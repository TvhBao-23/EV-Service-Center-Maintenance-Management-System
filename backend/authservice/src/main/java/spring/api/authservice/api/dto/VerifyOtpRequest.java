package spring.api.authservice.api.dto;

public record VerifyOtpRequest(String email, String otp) {
}

