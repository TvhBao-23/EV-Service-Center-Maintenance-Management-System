package spring.api.authservice.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

// [KCPM-42]: Chuẩn hóa chữ thường sang chữ hoa cho UserRole Enum và dùng @JsonProperty để giữ tương thích JSON
public enum UserRole {
    @JsonProperty("customer")
    CUSTOMER,
    @JsonProperty("staff")
    STAFF,
    @JsonProperty("technician")
    TECHNICIAN,
    @JsonProperty("admin")
    ADMIN
}