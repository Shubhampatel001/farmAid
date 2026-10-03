package com.farmaid.controller;

import com.farmaid.service.LocationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/location")
@Tag(name = "Location")
public class LocationController {

	private final LocationService locationService;

	public LocationController(LocationService locationService) {
		this.locationService = locationService;
	}

	@GetMapping("/states")
	public List<String> states() {
		return locationService.getStates();
	}

	@GetMapping("/districts")
	public List<String> districts(@RequestParam String state) {
		return locationService.getDistricts(state);
	}
}
