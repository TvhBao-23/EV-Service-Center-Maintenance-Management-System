package spring.api.evservicecenter.dto;


import java.math.BigDecimal;

// DTO này chứa chính xác các thông tin ta cần cho bảng
public class CustomerManagementDTO {
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private long vehicleCount;  // Số xe
    private long serviceCount;  // Số dịch vụ
    private BigDecimal totalCost;   // Tổng chi phí

    public CustomerManagementDTO(Long customerId, String customerName, String customerEmail, long vehicleCount, long serviceCount, BigDecimal totalCost) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.vehicleCount = vehicleCount;
        this.serviceCount = serviceCount;
        this.totalCost = (totalCost == null) ? BigDecimal.ZERO : totalCost; // Xử lý null
    }

    // Getters and Setters...
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public long getVehicleCount() { return vehicleCount; }
    public long getServiceCount() { return serviceCount; }
    public BigDecimal getTotalCost() { return totalCost; }
}