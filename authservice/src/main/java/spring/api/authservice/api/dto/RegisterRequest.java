package spring.api.authservice.api.dto;

import jakarta.validation.constraints.*;
import spring.api.authservice.domain.UserRole;

public record RegisterRequest(
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 6, max = 50) String password,
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String phone,
        @NotNull UserRole role
) {}
