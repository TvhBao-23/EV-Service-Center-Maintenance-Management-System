package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(length = 17, unique = true, nullable = false)
    private String vin;

    @Column(length = 100, nullable = false)
    private String brand;

    @Column(length = 100, nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "battery_capacity_kwh", precision = 5, scale = 2)
    private BigDecimal batteryCapacityKwh;

    @Column(name = "odometer_km")
    private Integer odometerKm;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "last_service_km")
    private Integer lastServiceKm;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

