package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.dto.InventoryResponseDto;
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
    public ResponseEntity<List<InventoryResponseDto>> getAll() {
        List<InventoryResponseDto> list = inventoryService.getAll().stream()
                .map(inv -> new InventoryResponseDto(
                        inv.getPart().getPartId(),
                        inv.getPart().getName(),
                        inv.getQuantityInStock(),
                        inv.getMinStockLevel(),
                        inv.getPart().getUnitPrice()
                ))
                .toList();
        return ResponseEntity.ok(list);
    }


    @GetMapping("/{partId}")
    public ResponseEntity<PartInventory> getByPartId(@PathVariable Long partId) {
        return ResponseEntity.ok(inventoryService.getByPartId(partId));
    }

    @PostMapping("/{partId}/init")
    public ResponseEntity<PartInventory> initInventory(
            @PathVariable Long partId,
            @RequestParam int initialQty,
            @RequestParam(defaultValue = "5") int minStockLevel) {
        return ResponseEntity.ok(inventoryService.initForPart(partId, initialQty, minStockLevel));
    }

    @PutMapping("/{partId}/import")
    public ResponseEntity<PartInventory> importStock(
            @PathVariable Long partId,
            @RequestParam int quantity,
            @RequestParam Long staffId,
            @RequestParam(required = false, defaultValue = "Nhập kho thủ công") String note) {
        return ResponseEntity.ok(inventoryService.importStock(partId, quantity, staffId, note));
    }

    @PutMapping("/{partId}/export")
    public ResponseEntity<PartInventory> exportStock(
            @PathVariable Long partId,
            @RequestParam int quantity,
            @RequestParam Long staffId,
            @RequestParam(required = false, defaultValue = "Xuất kho thủ công") String note) {
        return ResponseEntity.ok(inventoryService.exportStock(partId, quantity, staffId, note, null, null));
    }

    @PutMapping("/{partId}/adjust")
    public ResponseEntity<PartInventory> adjustStock(
            @PathVariable Long partId,
            @RequestParam int delta,
            @RequestParam Long staffId,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(inventoryService.adjustStock(partId, delta, staffId, note));
    }

    @GetMapping("/low-stock/count")
    public ResponseEntity<Long> getLowStockCount() {
        return ResponseEntity.ok(inventoryService.countLowStock());
    }
}
