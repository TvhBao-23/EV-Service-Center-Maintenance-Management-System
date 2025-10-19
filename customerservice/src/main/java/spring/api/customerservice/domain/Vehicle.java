package spring.api.customerservice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false, unique = true, length = 17)
    private String vin;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    private Integer year;
    @Column(name = "battery_capacity_kwh")
    private Double batteryCapacityKwh;
    @Column(name = "odometer_km")
    private Double odometerKm;
    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;
    @Column(name = "last_service_km")
    private Double lastServiceKm;
    @Column(name = "next_service_due_km")
    private Double nextServiceDueKm;
    @Column(name = "next_service_due_date")
    private LocalDate nextServiceDueDate;
}


