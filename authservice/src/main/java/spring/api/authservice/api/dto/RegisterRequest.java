package spring.api.authservice.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import spring.api.authservice.domain.UserRole;

public record RegisterRequest(
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email,
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    String password,
    
    @NotBlank(message = "Họ tên không được để trống")
    String fullName,
    
    String phone,
    
    UserRole role
) {}
