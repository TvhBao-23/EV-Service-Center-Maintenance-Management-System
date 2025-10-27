package org.example.partsinventoryservice.dto.request;

import java.util.List;

public class CreateRequestDto {
    private Long orderId;            // có thể null nếu không liên quan lệnh sửa chữa
    private Long createdByStaffId;   // id kỹ thuật viên tạo phiếu
    private String reason;
    private List<CreateRequestItemDto> items;

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


