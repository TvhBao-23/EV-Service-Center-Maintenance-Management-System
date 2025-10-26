package spring.api.evservicecenter.adminworkshop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTechnicianRequestDTO {
    @NotNull(message = "Technician ID cannot be null")
    private Integer technicianId;
}