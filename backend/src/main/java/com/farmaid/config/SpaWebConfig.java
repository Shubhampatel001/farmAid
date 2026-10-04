package com.farmaid.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serves the Angular build when it is bundled into classpath:/static (the single-container demo image).
 * Unknown non-API paths fall back to index.html so client-side routes like /my/applications survive a refresh.
 * Without a bundled frontend (normal API deployments) this resolves nothing and requests 404 as usual.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/**")
				.addResourceLocations("classpath:/static/")
				.resourceChain(true)
				.addResolver(new PathResourceResolver() {
					@Override
					protected Resource getResource(String path, Resource location) throws IOException {
						if (!path.isEmpty()) {
							Resource requested = location.createRelative(path);
							if (requested.exists() && requested.isReadable()) {
								return requested;
							}
						}
						if (path.startsWith("api/") || path.startsWith("actuator/")) {
							return null;
						}
						Resource index = location.createRelative("index.html");
						return index.exists() && index.isReadable() ? index : null;
					}
				});
	}
}
