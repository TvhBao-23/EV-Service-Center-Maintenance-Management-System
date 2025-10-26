package spring.api.evservicecenter.adminworkshop.entity;

 import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import spring.api.evservicecenter.adminworkshop.enums.AppointmentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Integer appointmentId;

    @Column(name = "requested_date_time", nullable = false)
    private LocalDateTime requestedDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.pending; // Default value

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Optional: ManyToOne relationship to Service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id") // Allows service_id to be NULL
    private Service service; // Assuming you have a Service entity

    // Optional: OneToOne relationship back to ServiceOrder
    @OneToOne(mappedBy = "appointment", fetch = FetchType.LAZY)
    private ServiceOrder serviceOrder;

    // Automatically set creation timestamp
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}