package com.farmaid;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FarmAidApiIntegrationTest {

	private static final String PASSWORD = "Farmer@123";
	private static final String PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

	@Autowired
	MockMvc mvc;

	@Autowired
	ObjectMapper json;

	private String adminToken;

	@BeforeEach
	void loginAdmin() throws Exception {
		adminToken = login("admin@test.local", "Admin@12345");
	}

	// ---------------------------------------------------------------- security

	@Test
	void anonymousCanBrowseLoansAndLocationsButNotManage() throws Exception {
		mvc.perform(get("/api/loans")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(4));
		mvc.perform(get("/api/location/states")).andExpect(status().isOk()).andExpect(jsonPath("$[0]").isString());
		mvc.perform(get("/api/location/districts").param("state", "Odisha"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThan(10)));

		mvc.perform(post("/api/loans").contentType(MediaType.APPLICATION_JSON).content(loanJson("Hacker Loan")))
				.andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").exists());
		mvc.perform(get("/api/applications")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
		mvc.perform(patch("/api/loans/1/status").param("active", "false")).andExpect(status().isUnauthorized());
	}

	@Test
	void registrationIgnoresRequestedRoleAndNeverReturnsPassword() throws Exception {
		String email = uniqueEmail();
		String body = json.writeValueAsString(Map.of("email", email, "password", PASSWORD, "username", "Sneaky",
				"mobileNumber", "9876543210", "role", "ADMIN", "userRole", "ADMIN"));
		mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.role").value("USER"))
				.andExpect(jsonPath("$.password").doesNotExist());

		String token = login(email, PASSWORD);
		mvc.perform(auth(get("/api/users/me"), token))
				.andExpect(status().isOk()).andExpect(jsonPath("$.role").value("USER")).andExpect(jsonPath("$.password").doesNotExist());
		mvc.perform(auth(post("/api/loans").contentType(MediaType.APPLICATION_JSON).content(loanJson("User Loan")), token))
				.andExpect(status().isForbidden());
		mvc.perform(auth(get("/api/users"), token)).andExpect(status().isForbidden());
	}

	@Test
	void registrationValidationAndDuplicates() throws Exception {
		mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"bad\",\"password\":\"weak\",\"username\":\"\",\"mobileNumber\":\"12\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.email").exists())
				.andExpect(jsonPath("$.fieldErrors.password").exists())
				.andExpect(jsonPath("$.fieldErrors.mobileNumber").exists());

		String email = registerUser();
		mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registerJson(email)))
				.andExpect(status().isConflict());
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content(json.writeValueAsString(Map.of("email", email, "password", "Wrong@1234"))))
				.andExpect(status().isUnauthorized());
	}

	// ---------------------------------------------------------------- loans

	@Test
	void adminManagesLoansAndDeactivatedLoansDisappearFromCatalogue() throws Exception {
		String type = "Test Loan " + UUID.randomUUID();
		JsonNode created = body(mvc.perform(auth(post("/api/loans").contentType(MediaType.APPLICATION_JSON).content(loanJson(type)), adminToken))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
		long loanId = created.get("loanId").asLong();

		mvc.perform(auth(post("/api/loans").contentType(MediaType.APPLICATION_JSON).content(loanJson(type)), adminToken))
				.andExpect(status().isConflict());

		mvc.perform(auth(patch("/api/loans/" + loanId + "/status").param("active", "false"), adminToken))
				.andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));

		// Updating must not silently reactivate (bug in the old app).
		mvc.perform(auth(put("/api/loans/" + loanId).contentType(MediaType.APPLICATION_JSON).content(loanJson(type)), adminToken))
				.andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));

		mvc.perform(get("/api/loans/" + loanId)).andExpect(status().isNotFound());
		mvc.perform(auth(get("/api/loans/" + loanId), adminToken)).andExpect(status().isOk());

		String token = login(registerUser(), PASSWORD);
		mvc.perform(auth(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(applicationJson(loanId, 1000)), token))
				.andExpect(status().isBadRequest());
	}

	// ---------------------------------------------------------------- applications

	@Test
	void fullApplicationLifecycle() throws Exception {
		String farmer = login(registerUser(), PASSWORD);
		String otherFarmer = login(registerUser(), PASSWORD);

		mvc.perform(auth(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(applicationJson(1, 99_999_999)), farmer))
				.andExpect(status().isBadRequest());

		JsonNode app = body(mvc.perform(auth(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(applicationJson(1, 50_000)), farmer))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("PENDING"))
				.andExpect(jsonPath("$.file").doesNotExist())
				.andReturn().getResponse().getContentAsString());
		long appId = app.get("loanApplicationId").asLong();

		mvc.perform(auth(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(applicationJson(1, 10_000)), farmer))
				.andExpect(status().isConflict());

		mvc.perform(auth(get("/api/applications/me"), farmer))
				.andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].file").doesNotExist());
		mvc.perform(auth(get("/api/applications/" + appId), farmer))
				.andExpect(status().isOk()).andExpect(jsonPath("$.file").value(PNG));

		// Another farmer can neither see nor cancel it, and cannot approve it.
		mvc.perform(auth(get("/api/applications/" + appId), otherFarmer)).andExpect(status().isNotFound());
		mvc.perform(auth(patch("/api/applications/" + appId + "/cancel"), otherFarmer)).andExpect(status().isNotFound());
		mvc.perform(auth(patch("/api/applications/" + appId + "/decision").contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"APPROVED\"}"), farmer))
				.andExpect(status().isForbidden());

		mvc.perform(auth(get("/api/applications").param("status", "PENDING"), adminToken))
				.andExpect(status().isOk()).andExpect(jsonPath("$[?(@.loanApplicationId == " + appId + ")]").exists());
		mvc.perform(auth(patch("/api/applications/" + appId + "/decision").contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"REJECTED\"}"), adminToken))
				.andExpect(status().isBadRequest());
		mvc.perform(auth(patch("/api/applications/" + appId + "/decision").contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"APPROVED\",\"remarks\":\"Documents verified\"}"), adminToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("APPROVED"))
				.andExpect(jsonPath("$.adminRemarks").value("Documents verified"));

		mvc.perform(auth(patch("/api/applications/" + appId + "/cancel"), farmer)).andExpect(status().isConflict());
		mvc.perform(auth(patch("/api/applications/" + appId + "/decision").contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"REJECTED\",\"remarks\":\"x\"}"), adminToken))
				.andExpect(status().isConflict());

		// A fresh pending application can be cancelled by its owner.
		long second = body(mvc.perform(auth(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(applicationJson(2, 20_000)), farmer))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("loanApplicationId").asLong();
		mvc.perform(auth(patch("/api/applications/" + second + "/cancel"), farmer))
				.andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
	}

	@Test
	void rejectsNonImageDocuments() throws Exception {
		String farmer = login(registerUser(), PASSWORD);
		String body = applicationJson(1, 1000).replace(PNG, "data:text/html;base64,PHNjcmlwdD4=");
		mvc.perform(auth(post("/api/applications").contentType(MediaType.APPLICATION_JSON).content(body), farmer))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.file").exists());
	}

	// ---------------------------------------------------------------- feedback

	@Test
	void feedbackOwnershipAndAdminView() throws Exception {
		String farmer = login(registerUser(), PASSWORD);
		String other = login(registerUser(), PASSWORD);

		mvc.perform(auth(post("/api/feedback").contentType(MediaType.APPLICATION_JSON).content("{\"feedbackText\":\"x\",\"rating\":9}"), farmer))
				.andExpect(status().isBadRequest());
		long id = body(mvc.perform(auth(post("/api/feedback").contentType(MediaType.APPLICATION_JSON)
								.content("{\"feedbackText\":\"Quick approval, thanks!\",\"rating\":5}"), farmer))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.feedbackId").isNumber())
				.andExpect(jsonPath("$.date").exists())
				.andReturn().getResponse().getContentAsString()).get("feedbackId").asLong();

		mvc.perform(auth(get("/api/feedback/me"), farmer)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
		mvc.perform(auth(get("/api/feedback"), farmer)).andExpect(status().isForbidden());
		mvc.perform(auth(get("/api/feedback"), adminToken)).andExpect(status().isOk());

		mvc.perform(auth(delete("/api/feedback/" + id), other)).andExpect(status().isNotFound());
		mvc.perform(auth(delete("/api/feedback/" + id), farmer)).andExpect(status().isNoContent());
		mvc.perform(auth(delete("/api/feedback/" + id), adminToken)).andExpect(status().isNotFound());
	}

	@Test
	void invalidTokenIsTreatedAsAnonymous() throws Exception {
		mvc.perform(get("/api/users/me").header("Authorization", "Bearer not-a-jwt")).andExpect(status().isUnauthorized());
	}

	// ---------------------------------------------------------------- helpers

	private String registerUser() throws Exception {
		String email = uniqueEmail();
		mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registerJson(email)))
				.andExpect(status().isCreated());
		return email;
	}

	private String login(String email, String password) throws Exception {
		String res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content(json.writeValueAsString(Map.of("email", email, "password", password))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		String token = body(res).get("token").asText();
		assertThat(token).isNotBlank();
		return token;
	}

	private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder req, String token) {
		return req.header("Authorization", "Bearer " + token);
	}

	private JsonNode body(String content) throws Exception {
		return json.readTree(content);
	}

	private static String uniqueEmail() {
		return "farmer-" + UUID.randomUUID() + "@test.local";
	}

	private String registerJson(String email) throws Exception {
		return json.writeValueAsString(Map.of("email", email, "password", PASSWORD, "username", "Ravi Kumar", "mobileNumber", "9876543210"));
	}

	private String loanJson(String type) throws Exception {
		return json.writeValueAsString(Map.of("loanType", type, "description", "desc", "interestRate", 7.5,
				"maximumAmount", 100000, "repaymentTenure", 12, "eligibility", "Farmers", "documentsRequired", "Aadhaar"));
	}

	private String applicationJson(long loanId, double amount) throws Exception {
		return json.writeValueAsString(Map.of("loanId", loanId, "requestedAmount", amount, "state", "Odisha",
				"district", "Khordha", "farmLocation", "Village Road", "farmerAddress", "12 Main St, Bhubaneswar",
				"farmSizeInAcres", 2.5, "farmPurpose", "Paddy cultivation", "file", PNG));
	}
}
