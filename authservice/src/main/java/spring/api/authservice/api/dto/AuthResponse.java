package spring.api.authservice.api.dto;

public record AuthResponse(
        String token,
        String email,
        String fullName,
        String role,
        Integer userId
) {}
