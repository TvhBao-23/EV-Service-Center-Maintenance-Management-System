package spring.api.maintenance.dto;

public class ServiceOrderStatusUpdateRequest {
    private String status;
    private String checkInTime;
    private String checkOutTime;

    // Constructors
    public ServiceOrderStatusUpdateRequest() {}

    public ServiceOrderStatusUpdateRequest(String status, String checkInTime, String checkOutTime) {
        this.status = status;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(String checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
}
