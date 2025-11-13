package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Convert(converter = ServiceTypeConverter.class)
    @Column(name = "type", nullable = false)
    private ServiceType type;

    @Column(name = "is_package")
    private Boolean isPackage = false;

    @Column(name = "validity_days")
    private Integer validityDays;

    public enum ServiceType {
        MAINTENANCE, REPAIR, INSPECTION, PACKAGE;

        // Helper method để convert từ database value
        public static ServiceType fromString(String value) {
            if (value == null)
                return MAINTENANCE;

            switch (value.toLowerCase()) {
                case "maintenance":
                    return MAINTENANCE;
                case "repair":
                    return REPAIR;
                case "inspection":
                    return INSPECTION;
                case "package":
                    return PACKAGE;
                default:
                    return MAINTENANCE;
            }
        }
    }
}
