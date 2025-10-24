package spring.api.evservicecenter.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class VehicleRequestDTO {
    private String vin;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal batteryCapacityKwh;
    private BigDecimal odometerKm;
    private LocalDate lastServiceDate;
}