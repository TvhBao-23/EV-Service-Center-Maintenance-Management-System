package spring.api.authservice.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
        @JsonAlias({"fullName", "name", "full_name", "hovaten"})
        String fullName,

        @JsonAlias({"phone", "phoneNumber", "phone_number", "sdt"})
        String phone,

        UserRole role
) {}