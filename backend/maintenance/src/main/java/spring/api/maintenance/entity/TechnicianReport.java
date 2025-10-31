package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity cho bảng technician_reports
 * Quản lý báo cáo và đề xuất của kỹ thuật viên
 */
@Entity
@Table(name = "technician_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Column(name = "staff_id", nullable = false)
    private Integer staffId;

    @Column(name = "report_type")
    @Enumerated(EnumType.STRING)
    private ReportType reportType;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "suggested_parts", columnDefinition = "TEXT")
    private String suggestedParts;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ReportStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Integer reviewedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ReportStatus.PENDING;
        }
    }

    public enum ReportType {
        ISSUE, SUGGESTION, REQUEST
    }

    public enum ReportStatus {
        PENDING, REVIEWED, RESOLVED
    }
}
