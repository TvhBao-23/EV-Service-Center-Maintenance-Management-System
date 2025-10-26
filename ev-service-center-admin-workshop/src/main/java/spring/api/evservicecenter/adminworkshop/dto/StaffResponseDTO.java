package spring.api.evservicecenter.adminworkshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import spring.api.evservicecenter.adminworkshop.enums.StaffPosition;
import spring.api.evservicecenter.adminworkshop.enums.UserRole;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor // Useful for JPA constructor expressions
public class StaffResponseDTO {
    private Integer staffId;
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role; // Include role
    private StaffPosition position;
    private LocalDate hireDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}