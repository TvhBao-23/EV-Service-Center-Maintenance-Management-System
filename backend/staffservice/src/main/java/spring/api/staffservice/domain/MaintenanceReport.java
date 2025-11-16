package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "technician_id", nullable = false)
    private Long technicianId;

    @Column(name = "work_performed", columnDefinition = "TEXT", nullable = false)
    private String workPerformed;

    @Column(name = "parts_used", columnDefinition = "TEXT")
    private String partsUsed;

    @Column(name = "issues_found", columnDefinition = "TEXT")
    private String issuesFound;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "labor_hours", precision = 5, scale = 2)
    private BigDecimal laborHours;

    @Column(length = 20, nullable = false)
    private String status; // draft, submitted, approved, rejected

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "draft";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

