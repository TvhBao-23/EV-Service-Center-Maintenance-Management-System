package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "technician_id", nullable = false)
    private Long technicianId;

    @Column(name = "assigned_by", nullable = false)
    private Long assignedBy;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(length = 20, nullable = false)
    private String status; // assigned, accepted, in_progress, completed, cancelled

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "assigned";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

