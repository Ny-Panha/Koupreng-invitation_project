# Spring Boot 4 & Java 25 Compatibility Overlay

## 1. Key Framework Differences from Spring Boot 3

When working in Koupreng, ignore outdated documentation for Spring Boot 2.x and 3.x:

| Area | Outdated Pattern (SB 3 / Java 17) | Modern Koupreng Pattern (SB 4 / Java 25) |
|---|---|---|
| **Parent POM** | `spring-boot-starter-parent:3.x` | `spring-boot-starter-parent:4.0.8` |
| **Web Starter** | `spring-boot-starter-web` | `spring-boot-starter-webmvc` |
| **Java Baseline** | Java 17 / 21 | Java 25 |
| **DTO Definitions** | Mutable classes with getters/setters | Java records or Lombok `@Value` / `@Data` with strict validations |
| **Security Config** | Deprecated adapter classes | Functional `SecurityFilterChain` bean DSL |
| **JWT Library** | Raw Nimbus parsing | Nimbus JOSE JWT 10.4 managed via Spring Security OAuth2 Resource Server |
| **OpenAPI** | Legacy springfox / springdoc 2.x | `springdoc-openapi-starter-webmvc-ui:3.1.1` with Scalar UI support |

## 2. SecurityFilterChain Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/v1/public/**", "/actuator/health/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            );
        return http.build();
    }
}
```

