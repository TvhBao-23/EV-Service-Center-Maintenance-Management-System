package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.model.Inventory;
import org.example.partsinventoryservice.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*") // Cho phép frontend truy cập
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/{partCode}")
    public Inventory getInventoryByPartCode(@PathVariable String partCode) {
        return inventoryService.getInventoryByPartCode(partCode);
    }

    @PostMapping("/add/{partCode}")
    public Inventory addStock(@PathVariable String partCode, @RequestParam int quantity) {
        return inventoryService.addOrUpdateInventory(partCode, quantity);
    }

    @PostMapping("/reduce/{partCode}")
    public Inventory reduceStock(@PathVariable String partCode, @RequestParam int quantity) {
        return inventoryService.reduceInventory(partCode, quantity);
    }
}

