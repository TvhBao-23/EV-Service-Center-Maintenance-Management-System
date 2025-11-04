package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Convert(converter = UserRoleConverter.class)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum UserRole {
        CUSTOMER,
        STAFF,
        TECHNICIAN,
        ADMIN;

        // Helper method để convert từ database value
        public static UserRole fromString(String value) {
            if (value == null) return CUSTOMER;
            
            switch (value.toLowerCase()) {
                case "customer":
                    return CUSTOMER;
                case "staff":
                    return STAFF;
                case "technician":
                    return TECHNICIAN;
                case "admin":
                    return ADMIN;
                default:
                    return CUSTOMER;
            }
        }
    }
}

