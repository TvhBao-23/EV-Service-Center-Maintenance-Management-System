package spring.api.maintenance.dto;

import java.math.BigDecimal;

public class ServiceOrderCompletionRequest {
    private String checkOutTime;
    private BigDecimal totalAmount;

    public ServiceOrderCompletionRequest() {
    }

    public ServiceOrderCompletionRequest(String checkOutTime, BigDecimal totalAmount) {
        this.checkOutTime = checkOutTime;
        this.totalAmount = totalAmount;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
