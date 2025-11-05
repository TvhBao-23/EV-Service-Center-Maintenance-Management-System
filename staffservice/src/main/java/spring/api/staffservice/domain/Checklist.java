package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Checklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checklist_id")
    private Long checklistId;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "technician_id", nullable = false)
    private Long technicianId;

    // Battery checks
    @Column(name = "battery_health", length = 20)
    private String batteryHealth; // good, fair, poor

    @Column(name = "battery_voltage", precision = 5, scale = 2)
    private BigDecimal batteryVoltage;

    @Column(name = "battery_temperature", precision = 5, scale = 2)
    private BigDecimal batteryTemperature;

    // Mechanical checks
    @Column(name = "brake_system", length = 20)
    private String brakeSystem; // good, fair, needs_replacement

    @Column(name = "tire_condition", length = 20)
    private String tireCondition; // good, fair, needs_replacement

    @Column(name = "tire_pressure", length = 100)
    private String tirePressure; // JSON or comma-separated: FL,FR,RL,RR

    @Column(name = "lights_status", length = 20)
    private String lightsStatus; // all_working, some_issues, needs_repair

    // EV-specific checks
    @Column(name = "cooling_system", length = 20)
    private String coolingSystem; // good, fair, needs_service

    @Column(name = "motor_condition", length = 20)
    private String motorCondition; // excellent, good, fair, poor

    @Column(name = "charging_port", length = 20)
    private String chargingPort; // working, damaged, needs_cleaning

    @Column(name = "software_version", length = 50)
    private String softwareVersion;

    @Column(name = "overall_status", length = 20)
    private String overallStatus; // pass, conditional, fail

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (checkedAt == null) {
            checkedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

