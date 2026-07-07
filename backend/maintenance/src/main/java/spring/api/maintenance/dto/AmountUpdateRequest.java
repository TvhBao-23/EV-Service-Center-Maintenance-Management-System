package spring.api.maintenance.dto;

import java.math.BigDecimal;

public class AmountUpdateRequest {
    private BigDecimal totalAmount;

    // Constructors
    public AmountUpdateRequest() {}

    public AmountUpdateRequest(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    // Getters and Setters
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
