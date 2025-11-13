package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.ServiceChecklist;
import spring.api.maintenance.service.ServiceChecklistService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/service-checklists")
@CrossOrigin(origins = "*")
public class ServiceChecklistDirectController {

    @Autowired
    private ServiceChecklistService serviceChecklistService;

    public ServiceChecklistDirectController() {
        System.out.println("🚀 ServiceChecklistDirectController constructor called!");
    }

    /**
     * Tạo checklist mới
     */
    @PostMapping
    public ResponseEntity<?> createServiceChecklist(@RequestBody ServiceChecklistRequest request) {
        System.out.println("🚀 ServiceChecklistDirectController - POST /api/service-checklists called");
        try {
            System.out.println("📝 Creating checklist - orderId: " + request.getOrderId() +
                    ", itemName: " + request.getItemName() +
                    ", isCompleted: " + request.getIsCompleted() +
                    ", completedBy: " + request.getCompletedBy());
            ServiceChecklist checklist = serviceChecklistService.createServiceChecklist(
                    request.getOrderId(),
                    request.getItemName(),
                    request.getIsCompleted() != null ? request.getIsCompleted() : false,
                    request.getNotes(),
                    request.getCompletedBy());
            System.out.println("✅ Checklist created with ID: " + checklist.getChecklistId());
            return ResponseEntity.status(HttpStatus.CREATED).body(checklist);
        } catch (Exception e) {
            System.err.println("❌ Error creating checklist: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating service checklist: " + e.getMessage());
        }
    }

    /**
     * Lấy tất cả service checklists
     */
    @GetMapping
    public ResponseEntity<?> getAllServiceChecklists() {
        try {
            List<ServiceChecklist> checklists = serviceChecklistService.getAllServiceChecklists();
            return ResponseEntity.ok(checklists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service checklists: " + e.getMessage());
        }
    }

    /**
     * Lấy service checklist theo ID
     */
    @GetMapping("/{checklistId}")
    public ResponseEntity<?> getServiceChecklistById(@PathVariable Integer checklistId) {
        try {
            Optional<ServiceChecklist> checklist = serviceChecklistService.getServiceChecklistById(checklistId);
            if (checklist.isPresent()) {
                return ResponseEntity.ok(checklist.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Service checklist not found with ID: " + checklistId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service checklist: " + e.getMessage());
        }
    }

    /**
     * Cập nhật service checklist
     */
    @PutMapping("/{checklistId}")
    public ResponseEntity<?> updateServiceChecklist(@PathVariable Integer checklistId,
            @RequestBody ServiceChecklistUpdateRequest request) {
        try {
            ServiceChecklist checklist = serviceChecklistService.updateServiceChecklist(
                    checklistId,
                    request.getItemName(),
                    request.getIsCompleted(),
                    request.getNotes(),
                    request.getCompletedBy());
            return ResponseEntity.ok(checklist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating service checklist: " + e.getMessage());
        }
    }

    /**
     * Xóa service checklist
     */
    @DeleteMapping("/{checklistId}")
    public ResponseEntity<?> deleteServiceChecklist(@PathVariable Integer checklistId) {
        try {
            serviceChecklistService.deleteServiceChecklist(checklistId);
            return ResponseEntity.ok("Service checklist deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting service checklist: " + e.getMessage());
        }
    }

    /**
     * Lấy service checklists theo order ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getServiceChecklistsByOrderId(@PathVariable Integer orderId) {
        try {
            List<ServiceChecklist> checklists = serviceChecklistService.getChecklistByOrderId(orderId);
            return ResponseEntity.ok(checklists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service checklists by order ID: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class ServiceChecklistRequest {
        private Integer orderId;
        private String itemName;
        private Boolean isCompleted;
        private String notes;
        private Integer completedBy;

        public Integer getOrderId() {
            return orderId;
        }

        public void setOrderId(Integer orderId) {
            this.orderId = orderId;
        }

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
        }

        public Boolean getIsCompleted() {
            return isCompleted;
        }

        public void setIsCompleted(Boolean isCompleted) {
            this.isCompleted = isCompleted;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public Integer getCompletedBy() {
            return completedBy;
        }

        public void setCompletedBy(Integer completedBy) {
            this.completedBy = completedBy;
        }
    }

    public static class ServiceChecklistUpdateRequest {
        private String itemName;
        private Boolean isCompleted;
        private String notes;
        private Integer completedBy;

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
        }

        public Boolean getIsCompleted() {
            return isCompleted;
        }

        public void setIsCompleted(Boolean isCompleted) {
            this.isCompleted = isCompleted;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public Integer getCompletedBy() {
            return completedBy;
        }

        public void setCompletedBy(Integer completedBy) {
            this.completedBy = completedBy;
        }
    }
}
