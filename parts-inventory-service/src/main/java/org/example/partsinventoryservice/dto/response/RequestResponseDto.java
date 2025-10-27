package org.example.partsinventoryservice.dto.response;

import org.example.partsinventoryservice.entity.enum_.*;
import org.example.partsinventoryservice.entity.*;

import java.time.LocalDateTime;
import java.util.List;

public class RequestResponseDto {
    private Long id;
    private String requestedBy;
    private String reason;
    private RequestStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private List<ItemDto> items;

    public static RequestResponseDto fromEntity(PartRequest request) {
        RequestResponseDto dto = new RequestResponseDto();
        dto.setId(request.getId());
        dto.setRequestedBy(request.getRequestedBy());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setCreatedAt(request.getCreatedAt());

        dto.setItems(request.getItems().stream().map(item -> {
            ItemDto i = new ItemDto();
            i.setPartId(item.getPart().getPartId());
            i.setPartName(item.getPart().getName());
            i.setQuantityRequested(item.getQuantityRequested());
            return i;
        }).toList());

        return dto;
    }

    // nested static DTO
    public static class ItemDto {
        private Long partId;
        private String partName;
        private int quantityRequested;

        public Long getPartId() {
            return partId;
        }

        public void setPartId(Long partId) {
            this.partId = partId;
        }

        public String getPartName() {
            return partName;
        }

        public void setPartName(String partName) {
            this.partName = partName;
        }

        public int getQuantityRequested() {
            return quantityRequested;
        }

        public void setQuantityRequested(int quantityRequested) {
            this.quantityRequested = quantityRequested;
        }
    }

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

    public List<ItemDto> getItems() { return items; }
    public void setItems(List<ItemDto> items) { this.items = items; }
}

