package spring.api.adminservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfigDTO {
    @NotNull(message = "maxActivities is required")
    @Min(value = 5, message = "maxActivities must be at least 5")
    @Max(value = 20, message = "maxActivities must be at most 20")
    private Integer maxActivities;

    @NotNull(message = "lowStockWarning is required")
    @Min(value = 1, message = "lowStockWarning must be at least 1")
    @Max(value = 50, message = "lowStockWarning must be at most 50")
    private Integer lowStockWarning;

    @NotNull(message = "refreshInterval is required")
    @Min(value = 30, message = "refreshInterval must be at least 30")
    @Max(value = 300, message = "refreshInterval must be at most 300")
    private Integer refreshInterval;

    @NotNull(message = "revenueTarget is required")
    @DecimalMin(value = "1.0", message = "revenueTarget must be at least 1.0")
    @DecimalMax(value = "10.0", message = "revenueTarget must be at most 10.0")
    private Double revenueTarget;
}
