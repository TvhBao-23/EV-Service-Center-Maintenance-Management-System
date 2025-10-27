package org.example.partsinventoryservice.dto.response;


import org.example.partsinventoryservice.entity.PartRequest;
import org.example.partsinventoryservice.entity.enum_.RequestStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO phản hồi cho phiếu yêu cầu phụ tùng (PartRequest)
 * Bao gồm thông tin chung và danh sách item trong phiếu.
 */
public class RequestResponseDto {

    private Long requestId;
    private Long orderId;
    private Long createdByStaffId;
    private Long approvedByStaffId;
    private RequestStatus status;
    private String reason;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime fulfilledAt;
    private List<RequestItemResponseDto> items;

    public RequestResponseDto() {}

    // ---------- STATIC MAPPER ----------
    public static RequestResponseDto fromEntity(PartRequest req) {
        RequestResponseDto dto = new RequestResponseDto();
        dto.setRequestId(req.getRequestId());
        dto.setOrderId(req.getOrderId());
        dto.setCreatedByStaffId(req.getCreatedByStaffId());
        dto.setApprovedByStaffId(req.getApprovedByStaffId());
        dto.setStatus(req.getStatus());
        dto.setReason(req.getReason());
        dto.setRejectReason(req.getRejectReason());
        dto.setCreatedAt(req.getCreatedAt());
        dto.setApprovedAt(req.getApprovedAt());
        dto.setFulfilledAt(req.getFulfilledAt());

        if (req.getItems() != null) {
            dto.setItems(req.getItems().stream()
                    .map(RequestItemResponseDto::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // ---------- GETTERS & SETTERS ----------
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCreatedByStaffId() {
        return createdByStaffId;
    }

    public void setCreatedByStaffId(Long createdByStaffId) {
        this.createdByStaffId = createdByStaffId;
    }

    public Long getApprovedByStaffId() {
        return approvedByStaffId;
    }

    public void setApprovedByStaffId(Long approvedByStaffId) {
        this.approvedByStaffId = approvedByStaffId;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getFulfilledAt() {
        return fulfilledAt;
    }

    public void setFulfilledAt(LocalDateTime fulfilledAt) {
        this.fulfilledAt = fulfilledAt;
    }

    public List<RequestItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<RequestItemResponseDto> items) {
        this.items = items;
    }

    // ---------- BUILDER ----------
    public static class Builder {
        private final RequestResponseDto dto;

        public Builder() {
            this.dto = new RequestResponseDto();
        }

        public Builder requestId(Long id) {
            dto.setRequestId(id);
            return this;
        }

        public Builder orderId(Long id) {
            dto.setOrderId(id);
            return this;
        }

        public Builder createdBy(Long id) {
            dto.setCreatedByStaffId(id);
            return this;
        }

        public Builder approvedBy(Long id) {
            dto.setApprovedByStaffId(id);
            return this;
        }

        public Builder status(RequestStatus status) {
            dto.setStatus(status);
            return this;
        }

        public Builder reason(String reason) {
            dto.setReason(reason);
            return this;
        }

        public Builder rejectReason(String rejectReason) {
            dto.setRejectReason(rejectReason);
            return this;
        }

        public Builder createdAt(LocalDateTime time) {
            dto.setCreatedAt(time);
            return this;
        }

        public Builder approvedAt(LocalDateTime time) {
            dto.setApprovedAt(time);
            return this;
        }

        public Builder fulfilledAt(LocalDateTime time) {
            dto.setFulfilledAt(time);
            return this;
        }

        public Builder items(List<RequestItemResponseDto> items) {
            dto.setItems(items);
            return this;
        }

        public RequestResponseDto build() {
            return dto;
        }
    }

    // ---------- toString() ----------
    @Override
    public String toString() {
        return "RequestResponseDto{" +
                "requestId=" + requestId +
                ", orderId=" + orderId +
                ", createdByStaffId=" + createdByStaffId +
                ", approvedByStaffId=" + approvedByStaffId +
                ", status=" + status +
                ", reason='" + reason + '\'' +
                ", rejectReason='" + rejectReason + '\'' +
                ", createdAt=" + createdAt +
                ", approvedAt=" + approvedAt +
                ", fulfilledAt=" + fulfilledAt +
                ", items=" + (items != null ? items.size() : 0) +
                '}';
    }
}

