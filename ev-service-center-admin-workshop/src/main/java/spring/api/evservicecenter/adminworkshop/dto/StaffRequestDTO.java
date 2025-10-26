package spring.api.evservicecenter.adminworkshop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import spring.api.evservicecenter.adminworkshop.enums.StaffPosition;
import spring.api.evservicecenter.adminworkshop.enums.UserRole;

import java.time.LocalDate;

@Data
public class StaffRequestDTO {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không quá 100 ký tự")
    private String email;

    @Size(max = 20, message = "Số điện thoại không quá 20 ký tự")
    private String phone;

    // Password is only required when creating, not updating
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password; // Allow null for updates

    @NotNull(message = "Vai trò không được để trống")
    private UserRole role; // Use UserRole enum (staff, technician, admin)

    @NotNull(message = "Vị trí không được để trống")
    private StaffPosition position; // Use StaffPosition enum

    private LocalDate hireDate;

    // Add isActive field for updates
    private Boolean isActive;
}