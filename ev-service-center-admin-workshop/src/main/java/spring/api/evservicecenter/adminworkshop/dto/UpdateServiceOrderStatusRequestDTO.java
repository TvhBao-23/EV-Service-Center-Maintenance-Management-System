package spring.api.evservicecenter.adminworkshop.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;
import spring.api.evservicecenter.adminworkshop.enums.ServiceOrderStatus;

@Data
public class UpdateServiceOrderStatusRequestDTO {
    @NotNull(message = "Status cannot be null")
    private ServiceOrderStatus status;
}