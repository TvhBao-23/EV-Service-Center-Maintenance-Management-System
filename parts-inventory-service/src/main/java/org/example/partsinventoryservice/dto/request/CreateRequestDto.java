package org.example.partsinventoryservice.dto.request;

import java.util.List;

public class CreateRequestDto {
    private String requestedBy;      // Tên hoặc ID kỹ thuật viên gửi yêu cầu
    private String reason;           // Lý do yêu cầu xuất kho
    private List<CreateRequestItemDto> items;

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<CreateRequestItemDto> getItems() {
        return items;
    }

    public void setItems(List<CreateRequestItemDto> items) {
        this.items = items;
    }
}

