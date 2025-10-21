package spring.api.customerservice.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentCreateDto {
    private Long vehicleId;
    private Long serviceId;
    private Long centerId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentDate;
    
    private String notes;
}

