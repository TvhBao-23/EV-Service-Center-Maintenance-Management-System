package spring.api.maintenance.dto;

public class TechnicianAssignmentRequest {
    private Integer technicianId;

    // Constructors
    public TechnicianAssignmentRequest() {}

    public TechnicianAssignmentRequest(Integer technicianId) {
        this.technicianId = technicianId;
    }

    // Getters and Setters
    public Integer getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Integer technicianId) {
        this.technicianId = technicianId;
    }
}
