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
    private Long id;

    private String requestedBy; // tên hoặc ID kỹ thuật viên

    private String reason; // lý do yêu cầu

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    private String rejectionReason;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "partRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PartRequestItem> items = new ArrayList<>();

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<PartRequestItem> getItems() { return items; }
    public void setItems(List<PartRequestItem> items) { this.items = items; }
}
