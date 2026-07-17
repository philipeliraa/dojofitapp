package com.dojofit.api;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base para testes de integração: sobe um PostgreSQL real via Testcontainers
 * (mesma engine do ambiente Docker Compose, docs/08 seção 8), compartilhado
 * entre as classes de teste para reaproveitar o contexto Spring.
 */
@SpringBootTest
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        // Docker Engine 29+ exige API >= 1.40; o docker-java usa 1.32 por padrão
        // e recebe 400 do daemon. 1.44 cobre Docker 25+ (fev/2024 em diante).
        System.setProperty("api.version", "1.44");
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }
}
