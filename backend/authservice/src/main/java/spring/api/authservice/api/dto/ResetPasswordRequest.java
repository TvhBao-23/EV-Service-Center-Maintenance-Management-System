package spring.api.authservice.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @Pattern(regexp = "^\\d{6}$", message = "Mã xác nhận phải là 6 chữ số")
    @JsonAlias("otp")
    String token,
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, max = 16, message = "Mật khẩu phải từ 8 đến 16 ký tự")
    @JsonAlias({"password", "new_password"})
    String newPassword
) {}
