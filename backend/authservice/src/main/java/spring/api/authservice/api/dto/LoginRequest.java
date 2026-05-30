package spring.api.authservice.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email không được để trống")
        @JsonAlias("username")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {}