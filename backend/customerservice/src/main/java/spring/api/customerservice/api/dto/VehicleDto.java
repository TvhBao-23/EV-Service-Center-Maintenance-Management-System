package spring.api.customerservice.api.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record VehicleDto(
    @NotBlank(message = "VIN không được để trống")
    @Size(min = 17, max = 17, message = "VIN phải có 17 ký tự")
    String vin,
    
    @NotBlank(message = "Hãng xe không được để trống")
    String brand,
    
    @NotBlank(message = "Model không được để trống")
    String model,
    
    @NotNull(message = "Năm sản xuất không được để trống")
    @Min(value = 2000, message = "Năm sản xuất phải từ 2000 trở lên")
    Integer year,
    
    Double batteryCapacityKwh,
    Integer odometerKm,
    LocalDate lastServiceDate,
    Integer lastServiceKm
) {}

