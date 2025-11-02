package spring.api.authservice.api.dto;

public record ResetPasswordRequest(String email, String otp, String newPassword) {
}

