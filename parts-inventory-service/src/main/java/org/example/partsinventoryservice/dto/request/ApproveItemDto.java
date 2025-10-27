package org.example.partsinventoryservice.dto.request;

public class ApproveItemDto {
    private Long partId;
    private int quantityApproved;

    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public int getQuantityApproved() {
        return quantityApproved;
    }

    public void setQuantityApproved(int quantityApproved) {
        this.quantityApproved = quantityApproved;
    }
}

