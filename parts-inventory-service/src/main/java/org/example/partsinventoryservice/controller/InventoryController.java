package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.entity.PartInventory;
import org.example.partsinventoryservice.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<PartInventory>> getAllInventories() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{partId}")
    public ResponseEntity<PartInventory> getInventoryByPart(@PathVariable Long partId) {
        return ResponseEntity.ok(inventoryService.getInventoryByPart(partId));
    }

    @PostMapping("/{partId}/create")
    public ResponseEntity<PartInventory> createInventory(@PathVariable Long partId,
                                                         @RequestParam int initialStock,
                                                         @RequestParam int minStock) {
        return ResponseEntity.ok(inventoryService.createInventoryForPart(partId, initialStock, minStock));
    }

    @PutMapping("/{partId}/update-stock")
    public ResponseEntity<String> updateStock(@PathVariable Long partId,
                                              @RequestParam int quantityChange) {
        inventoryService.updateStock(partId, quantityChange);
        return ResponseEntity.ok("Đã cập nhật tồn kho cho partId=" + partId);
    }

    @GetMapping("/low-stock-count")
    public ResponseEntity<Long> countLowStock() {
        return ResponseEntity.ok(inventoryService.countLowStockParts());
    }
}
