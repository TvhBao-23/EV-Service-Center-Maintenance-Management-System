package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "received_by", nullable = false)
    private Long receivedBy;

    @Column(name = "odometer_reading", nullable = false)
    private Integer odometerReading;

    @Column(name = "fuel_level", length = 20)
    private String fuelLevel; // For hybrid EVs

    @Column(name = "exterior_condition", columnDefinition = "TEXT")
    private String exteriorCondition;

    @Column(name = "interior_condition", columnDefinition = "TEXT")
    private String interiorCondition;

    @Column(name = "customer_complaints", columnDefinition = "TEXT")
    private String customerComplaints;

    @Column(name = "estimated_completion")
    private LocalDateTime estimatedCompletion;

    @Column(name = "receipt_number", length = 50, unique = true, nullable = false)
    private String receiptNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (receiptNumber == null) {
            // Generate receipt number: SR-YYYYMMDD-XXXXXX
            receiptNumber = "SR-" + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) 
                + "-" + String.format("%06d", (int)(Math.random() * 999999));
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

