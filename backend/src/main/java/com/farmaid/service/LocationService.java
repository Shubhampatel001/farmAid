package com.farmaid.service;

import com.farmaid.model.StateDistrict;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Collections;
import java.util.List;

/** Indian states and districts, loaded once from classpath:data/StatesAPI.json. */
@Service
public class LocationService {

	private final List<StateDistrict> stateDistricts;

	public LocationService(ObjectMapper objectMapper) {
		try (InputStream is = getClass().getResourceAsStream("/data/StatesAPI.json")) {
			JsonNode states = objectMapper.readTree(is).get("states");
			this.stateDistricts = List.copyOf(objectMapper.convertValue(states, new TypeReference<List<StateDistrict>>() {
			}));
		} catch (IOException e) {
			throw new UncheckedIOException("Could not load state/district data", e);
		}
	}

	public List<String> getStates() {
		return stateDistricts.stream().map(StateDistrict::state).toList();
	}

	public List<String> getDistricts(String state) {
		return stateDistricts.stream()
				.filter(s -> s.state().equalsIgnoreCase(state))
				.map(StateDistrict::districts)
				.findFirst()
				.orElse(Collections.emptyList());
	}
}
