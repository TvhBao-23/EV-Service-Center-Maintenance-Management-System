package spring.api.maintenance.dto;

import java.math.BigDecimal;

public class ServiceOrderCompletionRequest {
    private String checkOutTime;
    private BigDecimal totalAmount;

    // Constructors
    public ServiceOrderCompletionRequest() {}

    public ServiceOrderCompletionRequest(String checkOutTime, BigDecimal totalAmount) {
        this.checkOutTime = checkOutTime;
        this.totalAmount = totalAmount;
    }

    // Getters and Setters
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
