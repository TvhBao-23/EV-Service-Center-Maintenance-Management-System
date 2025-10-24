package spring.api.evservicecenter.dto;

import lombok.Data;

@Data
public class CustomerResponseDTO {
    private Integer customerId;
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Boolean isActive;
    private long vehicleCount; // Đếm số lượng xe
}