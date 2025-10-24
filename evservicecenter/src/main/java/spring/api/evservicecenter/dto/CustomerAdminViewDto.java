package spring.api.evservicecenter.dto;

import java.math.BigDecimal;

public class CustomerAdminViewDto {
    
    private Long customerId;
    private String name;
    private String email;
    private long vehicleCount;
    private long serviceOrderCount;
    private BigDecimal totalSpent;

    // Constructors
    public CustomerAdminViewDto(Long customerId, String name, String email, long vehicleCount, long serviceOrderCount, BigDecimal totalSpent) {
        this.customerId = customerId;
        this.name = name;
        this.email = email;
        this.vehicleCount = vehicleCount;
        this.serviceOrderCount = serviceOrderCount;
        this.totalSpent = totalSpent;
    }

    // Getters and Setters
    // ...
}
