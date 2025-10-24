package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.model.Inventory;
import org.example.partsinventoryservice.service.InventoryService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/list")
    public List<Map<String, Object>> getAllInventory() {
        return inventoryService.getAllInventory().stream().map(inv -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", inv.getInventoryId());
            data.put("name", inv.getPart().getName());
            data.put("partCode", inv.getPart().getPartCode());
            data.put("currentStock", inv.getQuantityInStock());
            data.put("minStock", inv.getMinStockLevel());
            data.put("price", inv.getPart().getUnitPrice());
            data.put("manufacturer", inv.getPart().getManufacturer());
            return data;
        }).toList();
    }

    @PostMapping("/add/{partCode}")
    public Inventory addStock(@PathVariable String partCode, @RequestParam int quantity) {
        return inventoryService.addStock(partCode, quantity);
    }

    @PostMapping("/reduce/{partCode}")
    public Inventory reduceStock(@PathVariable String partCode, @RequestParam int quantity) {
        return inventoryService.reduceStock(partCode, quantity);
    }
}


