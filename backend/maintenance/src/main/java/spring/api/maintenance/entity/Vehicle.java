package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity cho bảng vehicles
 * Quản lý thông tin xe của khách hàng
 */
@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "vin", length = 17, unique = true)
    private String vin;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "year")
    private Integer year;

    @Column(name = "battery_capacity_kwh", precision = 10, scale = 2)
    private BigDecimal batteryCapacityKwh;

    @Column(name = "odometer_km", precision = 10, scale = 2)
    private BigDecimal odometerKm;

    @Column(name = "last_service_date")
    private LocalDateTime lastServiceDate;

    @Column(name = "last_service_km", precision = 10, scale = 2)
    private BigDecimal lastServiceKm;

    @Column(name = "next_service_due_km", precision = 10, scale = 2)
    private BigDecimal nextServiceDueKm;

    @Column(name = "next_service_due_date")
    private LocalDateTime nextServiceDueDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}