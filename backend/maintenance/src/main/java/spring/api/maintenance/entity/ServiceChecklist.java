package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity cho bảng service_checklists
 * Quản lý danh sách kiểm tra chi tiết cho từng phiếu bảo dưỡng
 */
@Entity
@Table(name = "service_checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checklist_id")
    private Integer checklistId;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "completed_by")
    private Integer completedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        if (isCompleted && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}