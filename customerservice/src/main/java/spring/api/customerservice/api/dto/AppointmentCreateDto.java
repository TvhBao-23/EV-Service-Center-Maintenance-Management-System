package spring.api.customerservice.api.dto;

import jakarta.validation.constraints.*;

public record AppointmentCreateDto(
        @NotNull Integer vehicleId,
        @NotNull Integer serviceId,
        @NotNull Integer centerId,
        @NotBlank String requestedDateTime, // ISO-8601 string; FE supplies timezone-aware string
        @Size(max = 2000) String notes
) {}


