package com.analytics.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI analyticsOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Real-Time Analytics Dashboard API")
                .description("""
                    Enterprise-grade analytics backend built with Spring Boot 3.
                    
                    **Features:**
                    - JWT Authentication & Role-Based Access Control
                    - Real-Time WebSocket event streaming
                    - Time-series metrics with Redis caching
                    - Paginated reports & analytics
                    
                    **Default credentials:**
                    - Admin: `admin` / `Admin@123`
                    - Demo:  `demo`  / `Demo@123`
                    """)
                .version("v1.0.0")
                .contact(new Contact()
                    .name("Analytics Dashboard")
                    .email("admin@analytics.com")))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .name("Authorization")
                        .description("Enter your JWT token (get it from POST /api/v1/auth/login)")));
    }
}
