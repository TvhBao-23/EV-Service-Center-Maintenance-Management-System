package spring.api.authservice.api.dto;

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword
) {}

