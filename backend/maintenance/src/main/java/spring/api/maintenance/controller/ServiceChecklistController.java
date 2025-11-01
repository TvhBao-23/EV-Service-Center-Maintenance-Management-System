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
@RequestMapping("/api/service-orders/{orderId}/checklist")
@CrossOrigin(origins = "*")
public class ServiceChecklistController {

    @Autowired
    private ServiceChecklistService serviceChecklistService;

    /**
     * Tạo checklist cho phiếu dịch vụ
     */
    @PostMapping
    public ResponseEntity<?> createChecklist(@PathVariable Integer orderId, 
                                         @RequestBody ChecklistCreationRequest request) {
        try {
            List<ServiceChecklist> checklist = serviceChecklistService.createChecklist(orderId, request.getItems());
            return ResponseEntity.status(HttpStatus.CREATED).body(checklist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating checklist: " + e.getMessage());
        }
    }

    /**
     * Lấy checklist của phiếu dịch vụ
     */
    @GetMapping
    public ResponseEntity<?> getChecklist(@PathVariable Integer orderId) {
        try {
            List<ServiceChecklist> checklist = serviceChecklistService.getChecklistByOrderId(orderId);
            return ResponseEntity.ok(checklist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving checklist: " + e.getMessage());
        }
    }

    /**
     * Lấy item checklist theo ID
     */
    @GetMapping("/{checklistId}")
    public ResponseEntity<?> getChecklistItem(@PathVariable Integer orderId, @PathVariable Integer checklistId) {
        try {
            Optional<ServiceChecklist> checklistItem = serviceChecklistService.getChecklistItemById(checklistId);
            if (checklistItem.isPresent()) {
                return ResponseEntity.ok(checklistItem.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Checklist item not found with ID: " + checklistId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving checklist item: " + e.getMessage());
        }
    }

    /**
     * Đánh dấu hoàn thành item
     */
    @PutMapping("/{checklistId}/complete")
    public ResponseEntity<?> completeChecklistItem(@PathVariable Integer orderId, 
                                                @PathVariable Integer checklistId,
                                                @RequestBody ChecklistCompletionRequest request) {
        try {
            ServiceChecklist checklistItem = serviceChecklistService.completeChecklistItem(
                checklistId, request.getNotes(), request.getCompletedBy());
            return ResponseEntity.ok(checklistItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error completing checklist item: " + e.getMessage());
        }
    }

    /**
     * Thêm item mới vào checklist
     */
    @PostMapping("/items")
    public ResponseEntity<?> addChecklistItem(@PathVariable Integer orderId, 
                                           @RequestBody ChecklistItemRequest request) {
        try {
            ServiceChecklist checklistItem = serviceChecklistService.addChecklistItem(
                orderId, request.getItemName());
            return ResponseEntity.status(HttpStatus.CREATED).body(checklistItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error adding checklist item: " + e.getMessage());
        }
    }

    /**
     * Cập nhật item checklist
     */
    @PutMapping("/{checklistId}")
    public ResponseEntity<?> updateChecklistItem(@PathVariable Integer orderId, 
                                              @PathVariable Integer checklistId,
                                              @RequestBody ChecklistItemUpdateRequest request) {
        try {
            ServiceChecklist checklistItem = serviceChecklistService.updateChecklistItem(
                checklistId, request.getItemName(), request.getNotes());
            return ResponseEntity.ok(checklistItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating checklist item: " + e.getMessage());
        }
    }

    /**
     * Xóa item checklist
     */
    @DeleteMapping("/{checklistId}")
    public ResponseEntity<?> deleteChecklistItem(@PathVariable Integer orderId, @PathVariable Integer checklistId) {
        try {
            serviceChecklistService.deleteChecklistItem(checklistId);
            return ResponseEntity.ok("Checklist item deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting checklist item: " + e.getMessage());
        }
    }

    /**
     * Lấy checklist items chưa hoàn thành
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingChecklistItems(@PathVariable Integer orderId) {
        try {
            List<ServiceChecklist> pendingItems = serviceChecklistService.getPendingChecklistItems(orderId);
            return ResponseEntity.ok(pendingItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving pending checklist items: " + e.getMessage());
        }
    }

    /**
     * Lấy checklist items đã hoàn thành
     */
    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedChecklistItems(@PathVariable Integer orderId) {
        try {
            List<ServiceChecklist> completedItems = serviceChecklistService.getCompletedChecklistItems(orderId);
            return ResponseEntity.ok(completedItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving completed checklist items: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class ChecklistCreationRequest {
        private List<String> items;
        
        public List<String> getItems() { return items; }
        public void setItems(List<String> items) { this.items = items; }
    }

    public static class ChecklistCompletionRequest {
        private String notes;
        private Integer completedBy;
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public Integer getCompletedBy() { return completedBy; }
        public void setCompletedBy(Integer completedBy) { this.completedBy = completedBy; }
    }

    public static class ChecklistItemRequest {
        private String itemName;
        
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
    }

    public static class ChecklistItemUpdateRequest {
        private String itemName;
        private String notes;
        
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}