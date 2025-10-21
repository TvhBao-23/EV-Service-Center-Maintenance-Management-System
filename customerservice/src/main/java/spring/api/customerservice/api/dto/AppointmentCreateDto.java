package spring.api.customerservice.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentCreateDto {
    private Long vehicleId;
    private Long serviceId;
    private Long centerId;
    private LocalDateTime appointmentDate;
    private String notes;
}

