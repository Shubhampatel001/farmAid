package com.farmaid;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class DemoProfileIntegrationTest {

	@Autowired
	MockMvc mvc;

	@Autowired
	ObjectMapper json;

	@Test
	void demoAccountsAndSampleDataAreAvailable() throws Exception {
		String farmer = login("ravi@farmaid.demo", "Farmer@123");
		mvc.perform(get("/api/applications/me").header("Authorization", "Bearer " + farmer))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2));

		String admin = login("admin@farmaid.demo", "Admin@123");
		mvc.perform(get("/api/applications").header("Authorization", "Bearer " + admin))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(6));
		mvc.perform(get("/api/applications/1").header("Authorization", "Bearer " + admin))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.file").value(org.hamcrest.Matchers.startsWith("data:application/pdf;base64,")));
		mvc.perform(get("/api/feedback").header("Authorization", "Bearer " + admin))
				.andExpect(jsonPath("$.length()").value(3));
	}

	@Test
	void nonApiPathsAreNotBlockedButApiStaysProtected() throws Exception {
		// No frontend is bundled in tests, so client routes 404 instead of being rejected by security.
		mvc.perform(get("/my/applications")).andExpect(status().isNotFound());
		mvc.perform(get("/api/applications")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/does-not-exist")).andExpect(status().isUnauthorized());
	}

	private String login(String email, String password) throws Exception {
		String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content(json.writeValueAsString(Map.of("email", email, "password", password))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return json.readTree(body).get("token").asText();
	}
}
