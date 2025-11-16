package spring.api.staffservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.staffservice.domain.PartRequest;
import spring.api.staffservice.service.PartRequestService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/part-requests")
@RequiredArgsConstructor
@Slf4j
// CORS is handled by API Gateway
public class PartRequestController {
    private final PartRequestService partRequestService;

    @GetMapping
    public ResponseEntity<List<PartRequest>> getAllRequests() {
        log.info("GET /api/staff/part-requests - Fetching all part requests");
        return ResponseEntity.ok(partRequestService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartRequest> getRequestById(@PathVariable Long id) {
        log.info("GET /api/staff/part-requests/{} - Fetching request", id);
        return ResponseEntity.ok(partRequestService.getRequestById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PartRequest>> getRequestsByCustomer(@PathVariable Long customerId) {
        log.info("GET /api/staff/part-requests/customer/{} - Fetching requests by customer", customerId);
        return ResponseEntity.ok(partRequestService.getRequestsByCustomerId(customerId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PartRequest>> getPendingRequests() {
        log.info("GET /api/staff/part-requests/pending - Fetching pending requests");
        return ResponseEntity.ok(partRequestService.getPendingRequests());
    }

    @PostMapping
    public ResponseEntity<PartRequest> createRequest(@RequestBody PartRequest request) {
        log.info("POST /api/staff/part-requests - Creating new part request");
        PartRequest created = partRequestService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartRequest> updateRequest(
            @PathVariable Long id,
            @RequestBody PartRequest request) {
        log.info("PUT /api/staff/part-requests/{} - Updating request", id);
        return ResponseEntity.ok(partRequestService.updateRequest(id, request));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<PartRequest> approveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        log.info("PATCH /api/staff/part-requests/{}/approve - Approving request", id);
        
        Long staffId = Long.valueOf(request.get("staffId").toString());
        BigDecimal approvedPrice = request.containsKey("approvedPrice") 
                ? new BigDecimal(request.get("approvedPrice").toString())
                : null;
        
        return ResponseEntity.ok(partRequestService.approveRequest(id, staffId, approvedPrice));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<PartRequest> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        log.info("PATCH /api/staff/part-requests/{}/reject - Rejecting request", id);
        
        Long staffId = Long.valueOf(request.get("staffId").toString());
        String reason = request.get("reason").toString();
        
        return ResponseEntity.ok(partRequestService.rejectRequest(id, staffId, reason));
    }

    @PatchMapping("/{id}/fulfill")
    public ResponseEntity<PartRequest> fulfillRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        log.info("PATCH /api/staff/part-requests/{}/fulfill - Fulfilling request", id);
        
        Long staffId = request.get("staffId");
        
        return ResponseEntity.ok(partRequestService.fulfillRequest(id, staffId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        log.info("DELETE /api/staff/part-requests/{} - Deleting request", id);
        partRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException e) {
        log.error("Error in PartRequestController: {}", e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

