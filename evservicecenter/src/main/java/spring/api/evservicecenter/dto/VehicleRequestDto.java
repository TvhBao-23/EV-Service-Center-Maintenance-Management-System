package spring.api.evservicecenter.dto;


import java.math.BigDecimal;

public class VehicleRequestDto {
    
    private Long customerId; // ID của khách hàng sở hữu xe
    private String vin;
    private String brand;
    private String model;
    private int year;
    private BigDecimal batteryCapacityKwh;
    // ... thêm các trường khác nếu cần

    // Getters and Setters
    // ...
}