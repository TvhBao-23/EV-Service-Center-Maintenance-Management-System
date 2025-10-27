package org.example.partsinventoryservice.entity;

import jakarta.persistence.*;
import org.example.partsinventoryservice.entity.enum_.RequestStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "part_requests")
public class PartRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    // Giữ tham chiếu sang service_orders/staffs dưới dạng ID để tách service
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "created_by_staff_id", nullable = false)
    private Long createdByStaffId;

    @Column(name = "approved_by_staff_id")
    private Long approvedByStaffId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "fulfilled_at")
    private LocalDateTime fulfilledAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PartRequestItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // Getters/Setters
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getCreatedByStaffId() { return createdByStaffId; }
    public void setCreatedByStaffId(Long createdByStaffId) { this.createdByStaffId = createdByStaffId; }

    public Long getApprovedByStaffId() { return approvedByStaffId; }
    public void setApprovedByStaffId(Long approvedByStaffId) { this.approvedByStaffId = approvedByStaffId; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(LocalDateTime fulfilledAt) { this.fulfilledAt = fulfilledAt; }

    public List<PartRequestItem> getItems() { return items; }
    public void setItems(List<PartRequestItem> items) { this.items = items; }
}
