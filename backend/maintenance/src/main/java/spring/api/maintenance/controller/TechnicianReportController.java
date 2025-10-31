package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.TechnicianReport;
import spring.api.maintenance.repository.TechnicianReportRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/technician-reports")
@CrossOrigin(origins = "*")
public class TechnicianReportController {

    @Autowired
    private TechnicianReportRepository reportRepository;

    /**
     * Lấy tất cả báo cáo
     */
    @GetMapping
    public ResponseEntity<List<TechnicianReport>> getAllReports() {
        try {
            List<TechnicianReport> reports = reportRepository.findAll();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tạo báo cáo mới
     */
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody CreateReportRequest request) {
        try {
            TechnicianReport report = new TechnicianReport();
            report.setOrderId(request.getOrderId());
            report.setVehicleId(request.getVehicleId());
            report.setStaffId(request.getStaffId());
            report.setReportType(TechnicianReport.ReportType.valueOf(request.getReportType()));
            report.setMessage(request.getMessage());
            report.setSuggestedParts(request.getSuggestedParts());
            report.setStatus(TechnicianReport.ReportStatus.PENDING);

            TechnicianReport saved = reportRepository.save(report);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating report: " + e.getMessage());
        }
    }

    /**
     * Lấy báo cáo theo ID
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReportById(@PathVariable Integer reportId) {
        try {
            return reportRepository.findById(reportId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy báo cáo theo order_id
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getReportsByOrderId(@PathVariable Integer orderId) {
        try {
            List<TechnicianReport> reports = reportRepository.findByOrderId(orderId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy báo cáo theo staff_id
     */
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getReportsByStaffId(@PathVariable Integer staffId) {
        try {
            List<TechnicianReport> reports = reportRepository.findByStaffId(staffId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cập nhật trạng thái báo cáo
     */
    @PutMapping("/{reportId}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Integer reportId,
            @RequestBody UpdateStatusRequest request) {
        try {
            TechnicianReport report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            report.setStatus(TechnicianReport.ReportStatus.valueOf(request.getStatus()));
            if (request.getReviewedBy() != null) {
                report.setReviewedBy(request.getReviewedBy());
                report.setReviewedAt(LocalDateTime.now());
            }

            TechnicianReport updated = reportRepository.save(report);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating report status: " + e.getMessage());
        }
    }

    /**
     * Xóa báo cáo
     */
    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Integer reportId) {
        try {
            reportRepository.deleteById(reportId);
            return ResponseEntity.ok("Report deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting report: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class CreateReportRequest {
        private Integer orderId;
        private Integer vehicleId;
        private Integer staffId;
        private String reportType;
        private String message;
        private String suggestedParts;

        // Getters and setters
        public Integer getOrderId() {
            return orderId;
        }

        public void setOrderId(Integer orderId) {
            this.orderId = orderId;
        }

        public Integer getVehicleId() {
            return vehicleId;
        }

        public void setVehicleId(Integer vehicleId) {
            this.vehicleId = vehicleId;
        }

        public Integer getStaffId() {
            return staffId;
        }

        public void setStaffId(Integer staffId) {
            this.staffId = staffId;
        }

        public String getReportType() {
            return reportType;
        }

        public void setReportType(String reportType) {
            this.reportType = reportType;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getSuggestedParts() {
            return suggestedParts;
        }

        public void setSuggestedParts(String suggestedParts) {
            this.suggestedParts = suggestedParts;
        }
    }

    public static class UpdateStatusRequest {
        private String status;
        private Integer reviewedBy;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getReviewedBy() {
            return reviewedBy;
        }

        public void setReviewedBy(Integer reviewedBy) {
            this.reviewedBy = reviewedBy;
        }
    }
}
