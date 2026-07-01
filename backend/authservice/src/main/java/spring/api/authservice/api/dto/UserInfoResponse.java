package spring.api.authservice.api.dto;

public record UserInfoResponse(
    Long userId,
    String email,
    String fullName,
    String phone,
    String role
) {}
