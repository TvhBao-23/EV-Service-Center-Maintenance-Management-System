package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.Part;
import spring.api.maintenance.service.PartsService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "*")
public class PartsController {

    @Autowired
    private PartsService partsService;

    // Lấy tất cả phụ tùng
    @GetMapping
    public ResponseEntity<List<Part>> getAllParts() {
        List<Part> parts = partsService.getAllParts();
        return ResponseEntity.ok(parts);
    }

    // Lấy phụ tùng theo ID
    @GetMapping("/{partId}")
    public ResponseEntity<Part> getPartById(@PathVariable Integer partId) {
        Optional<Part> part = partsService.getPartById(partId);
        return part.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy phụ tùng theo mã phụ tùng
    @GetMapping("/code/{partCode}")
    public ResponseEntity<Part> getPartByCode(@PathVariable String partCode) {
        Optional<Part> part = partsService.getPartByCode(partCode);
        return part.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy phụ tùng theo danh mục
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Part>> getPartsByCategory(@PathVariable String category) {
        List<Part> parts = partsService.getPartsByCategory(category);
        return ResponseEntity.ok(parts);
    }

    // Lấy phụ tùng theo nhà sản xuất
    @GetMapping("/manufacturer/{manufacturer}")
    public ResponseEntity<List<Part>> getPartsByManufacturer(@PathVariable String manufacturer) {
        List<Part> parts = partsService.getPartsByManufacturer(manufacturer);
        return ResponseEntity.ok(parts);
    }

    // Tìm kiếm phụ tùng theo tên
    @GetMapping("/search")
    public ResponseEntity<List<Part>> searchPartsByName(@RequestParam String name) {
        List<Part> parts = partsService.searchPartsByName(name);
        return ResponseEntity.ok(parts);
    }

    // Tạo phụ tùng mới
    @PostMapping
    public ResponseEntity<Part> createPart(@RequestBody Part part) {
        try {
            Part createdPart = partsService.createPart(part);
            return ResponseEntity.status(201).body(createdPart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Cập nhật phụ tùng
    @PutMapping("/{partId}")
    public ResponseEntity<Part> updatePart(@PathVariable Integer partId, 
                                        @RequestBody Part part) {
        try {
            Part updatedPart = partsService.updatePart(partId, part);
            return ResponseEntity.ok(updatedPart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Xóa phụ tùng
    @DeleteMapping("/{partId}")
    public ResponseEntity<Void> deletePart(@PathVariable Integer partId) {
        try {
            partsService.deletePart(partId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Lấy phụ tùng theo khoảng giá
    @GetMapping("/price-range")
    public ResponseEntity<List<Part>> getPartsByPriceRange(@RequestParam Double minPrice, 
                                                          @RequestParam Double maxPrice) {
        List<Part> parts = partsService.getPartsByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(parts);
    }

    // Kiểm tra tồn kho
    @GetMapping("/{partId}/inventory")
    public ResponseEntity<Object> getPartInventory(@PathVariable Integer partId) {
        try {
            Object inventory = partsService.getPartInventory(partId);
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}