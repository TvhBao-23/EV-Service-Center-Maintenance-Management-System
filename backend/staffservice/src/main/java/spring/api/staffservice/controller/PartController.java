package spring.api.staffservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.staffservice.domain.Part;
import spring.api.staffservice.service.PartService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/parts")
@RequiredArgsConstructor
@Slf4j
// CORS is handled by API Gateway
public class PartController {
    private final PartService partService;

    @GetMapping
    public ResponseEntity<List<Part>> getAllParts() {
        log.info("GET /api/staff/parts - Fetching all parts");
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable Long id) {
        log.info("GET /api/staff/parts/{} - Fetching part", id);
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Part> getPartByCode(@PathVariable String code) {
        log.info("GET /api/staff/parts/code/{} - Fetching part by code", code);
        return ResponseEntity.ok(partService.getPartByCode(code));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Part>> getPartsByCategory(@PathVariable String category) {
        log.info("GET /api/staff/parts/category/{} - Fetching parts by category", category);
        return ResponseEntity.ok(partService.getPartsByCategory(category));
    }

    @GetMapping("/for-service/{serviceCategory}")
    public ResponseEntity<List<Part>> getPartsForService(@PathVariable String serviceCategory) {
        log.info("GET /api/staff/parts/for-service/{} - Fetching parts relevant for service", serviceCategory);
        return ResponseEntity.ok(partService.getPartsForService(serviceCategory));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Part>> getLowStockParts() {
        log.info("GET /api/staff/parts/low-stock - Fetching low stock parts");
        return ResponseEntity.ok(partService.getLowStockParts());
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Part>> getOutOfStockParts() {
        log.info("GET /api/staff/parts/out-of-stock - Fetching out of stock parts");
        return ResponseEntity.ok(partService.getOutOfStockParts());
    }

    @PostMapping
    public ResponseEntity<Part> createPart(@RequestBody Part part) {
        log.info("POST /api/staff/parts - Creating new part: {}", part.getName());
        Part created = partService.createPart(part);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Part> updatePart(@PathVariable Long id, @RequestBody Part part) {
        log.info("PUT /api/staff/parts/{} - Updating part", id);
        return ResponseEntity.ok(partService.updatePart(id, part));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Part> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        log.info("PATCH /api/staff/parts/{}/stock - Updating stock", id);
        Integer newQuantity = request.get("quantity");
        return ResponseEntity.ok(partService.updateStock(id, newQuantity));
    }

    @PatchMapping("/{id}/adjust-stock")
    public ResponseEntity<Part> adjustStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        log.info("PATCH /api/staff/parts/{}/adjust-stock - Adjusting stock", id);
        Integer adjustment = request.get("adjustment");
        return ResponseEntity.ok(partService.adjustStock(id, adjustment));
    }

    @PatchMapping("/{id}/discontinue")
    public ResponseEntity<Part> discontinuePart(@PathVariable Long id) {
        log.info("PATCH /api/staff/parts/{}/discontinue - Discontinuing part", id);
        return ResponseEntity.ok(partService.discontinuePart(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        log.info("DELETE /api/staff/parts/{} - Deleting part", id);
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException e) {
        log.error("Error in PartController: {}", e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

