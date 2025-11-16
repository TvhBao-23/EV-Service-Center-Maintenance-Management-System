package spring.api.authservice.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email,
    
    @NotBlank(message = "Mã xác nhận không được để trống")
    @Size(min = 6, max = 6, message = "Mã xác nhận phải có 6 ký tự")
    @Pattern(regexp = "^[0-9]{6}$", message = "Mã xác nhận phải là 6 chữ số")
    String token,
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    String newPassword
) {}
