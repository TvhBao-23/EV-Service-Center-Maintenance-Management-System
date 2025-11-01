package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.Part;
import spring.api.maintenance.service.PartService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "*")
public class PartController {

    @Autowired
    private PartService partService;

    /**
     * Lấy danh sách phụ tùng
     */
    @GetMapping
    public ResponseEntity<?> getParts(@RequestParam(required = false) String category) {
        try {
            List<Part> parts;
            if (category != null && !category.isEmpty()) {
                parts = partService.getPartsByCategory(category);
            } else {
                parts = partService.getAllParts();
            }
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving parts: " + e.getMessage());
        }
    }

    /**
     * Lấy phụ tùng theo ID
     */
    @GetMapping("/{partId}")
    public ResponseEntity<?> getPartById(@PathVariable Integer partId) {
        try {
            Optional<Part> part = partService.getPartById(partId);
            if (part.isPresent()) {
                return ResponseEntity.ok(part.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Part not found with ID: " + partId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving part: " + e.getMessage());
        }
    }

    /**
     * Lấy phụ tùng theo mã
     */
    @GetMapping("/code/{partCode}")
    public ResponseEntity<?> getPartByCode(@PathVariable String partCode) {
        try {
            Optional<Part> part = partService.getPartByCode(partCode);
            if (part.isPresent()) {
                return ResponseEntity.ok(part.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Part not found with code: " + partCode);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving part: " + e.getMessage());
        }
    }

    /**
     * Tạo phụ tùng mới
     */
    @PostMapping
    public ResponseEntity<?> createPart(@RequestBody Part part) {
        try {
            Part createdPart = partService.createPart(part);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating part: " + e.getMessage());
        }
    }

    /**
     * Cập nhật phụ tùng
     */
    @PutMapping("/{partId}")
    public ResponseEntity<?> updatePart(@PathVariable Integer partId, 
                                       @RequestBody Part partDetails) {
        try {
            Part updatedPart = partService.updatePart(partId, partDetails);
            return ResponseEntity.ok(updatedPart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating part: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra tồn kho
     */
    @GetMapping("/{partId}/inventory")
    public ResponseEntity<?> getPartInventory(@PathVariable Integer partId) {
        try {
            Object inventory = partService.getPartInventory(partId);
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving part inventory: " + e.getMessage());
        }
    }

    /**
     * Lấy phụ tùng theo loại
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getPartsByCategory(@PathVariable String category) {
        try {
            List<Part> parts = partService.getPartsByCategory(category);
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving parts: " + e.getMessage());
        }
    }

    /**
     * Lấy phụ tùng theo nhà sản xuất
     */
    @GetMapping("/manufacturer/{manufacturer}")
    public ResponseEntity<?> getPartsByManufacturer(@PathVariable String manufacturer) {
        try {
            List<Part> parts = partService.getPartsByManufacturer(manufacturer);
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving parts: " + e.getMessage());
        }
    }

    /**
     * Tìm kiếm phụ tùng theo tên
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchParts(@RequestParam String name) {
        try {
            List<Part> parts = partService.searchPartsByName(name);
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching parts: " + e.getMessage());
        }
    }

    /**
     * Lấy phụ tùng sắp hết hàng
     */
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockParts() {
        try {
            List<Part> parts = partService.getLowStockParts();
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving low stock parts: " + e.getMessage());
        }
    }
}
