package org.example.partsinventoryservice.dto.response;

import org.example.partsinventoryservice.entity.PartRequestItem;

public class RequestItemResponseDto {
    private Long partId;
    private String partName;
    private int quantityRequested;
    private int quantityApproved;

    public static RequestItemResponseDto fromEntity(PartRequestItem item) {
        RequestItemResponseDto dto = new RequestItemResponseDto();
        dto.setPartId(item.getPart().getPartId());
        dto.setPartName(item.getPart().getName());
        dto.setQuantityRequested(item.getQuantityRequested());
        dto.setQuantityApproved(item.getQuantityApproved());
        return dto;
    }

    // Getters & Setters
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

    public int getQuantityApproved() {
        return quantityApproved;
    }

    public void setQuantityApproved(int quantityApproved) {
        this.quantityApproved = quantityApproved;
    }
}
