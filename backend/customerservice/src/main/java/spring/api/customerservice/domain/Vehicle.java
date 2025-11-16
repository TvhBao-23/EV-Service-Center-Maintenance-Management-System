package spring.api.customerservice.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(unique = true, nullable = false, length = 17)
    private String vin;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "battery_capacity_kwh")
    private Double batteryCapacityKwh;

    @Column(name = "odometer_km")
    private Integer odometerKm;

    @Column(name = "last_service_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastServiceDate;

    @Column(name = "last_service_km")
    private Integer lastServiceKm;

    @Column(name = "created_at")
    @JsonIgnore
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonIgnore
    private LocalDateTime updatedAt;
}

