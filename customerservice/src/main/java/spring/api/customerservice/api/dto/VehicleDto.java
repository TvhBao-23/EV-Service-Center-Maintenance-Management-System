package spring.api.customerservice.api.dto;

import jakarta.validation.constraints.*;

public record VehicleDto(
        @NotBlank @Size(max = 17) String vin,
        @NotBlank @Size(max = 50) String brand,
        @NotBlank @Size(max = 50) String model,
        @Min(2000) @Max(2100) Integer year,
        @PositiveOrZero Double batteryCapacityKwh,
        @PositiveOrZero Double odometerKm,
        String lastServiceDate,
        @PositiveOrZero Double lastServiceKm
) {}


