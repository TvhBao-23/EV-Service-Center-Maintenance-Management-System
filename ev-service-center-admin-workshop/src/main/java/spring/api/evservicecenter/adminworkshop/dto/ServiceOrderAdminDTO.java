package spring.api.evservicecenter.adminworkshop.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import spring.api.evservicecenter.adminworkshop.enums.ServiceOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor // For JPA projection
public class ServiceOrderAdminDTO {
    private Integer orderId;
    private Integer appointmentId;
    private Integer vehicleId;
    private String customerName; // From User linked to Customer linked to Vehicle
    private String vehicleModel; // From Vehicle
    private String serviceName; // From Service linked via Appointment
    private LocalDateTime requestedDateTime; // From Appointment
    private Integer assignedTechnicianId;
    private String assignedTechnicianName; // From Staff
    private ServiceOrderStatus status; // From ServiceOrder
    private LocalDateTime checkInTime;
    private BigDecimal totalAmount;
    // Add other relevant fields if needed
}