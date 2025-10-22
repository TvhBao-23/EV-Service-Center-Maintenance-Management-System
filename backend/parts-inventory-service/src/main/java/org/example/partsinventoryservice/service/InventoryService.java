package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.model.Inventory;
import org.example.partsinventoryservice.model.Part;
import org.example.partsinventoryservice.respository.InventoryRepository;
import org.example.partsinventoryservice.respository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final PartRepository partRepository;

    public InventoryService(InventoryRepository inventoryRepository, PartRepository partRepository) {
        this.inventoryRepository = inventoryRepository;
        this.partRepository = partRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryByPartCode(String partCode) {
        Part part = partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new RuntimeException("Part not found: " + partCode));
        return inventoryRepository.findByPart(part)
                .orElseThrow(() -> new RuntimeException("Inventory not found for part: " + partCode));
    }

    public Inventory addOrUpdateInventory(String partCode, int quantity) {
        Part part = partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new RuntimeException("Part not found: " + partCode));

        Inventory inventory = inventoryRepository.findByPart(part)
                .orElse(Inventory.builder()
                        .part(part)
                        .quantity(0)
                        .minThreshold(5)
                        .build());

        inventory.setQuantity(inventory.getQuantity() + quantity);
        return inventoryRepository.save(inventory);
    }

    public Inventory reduceInventory(String partCode, int quantity) {
        Inventory inventory = getInventoryByPartCode(partCode);

        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Not enough stock for part: " + partCode);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        return inventoryRepository.save(inventory);
    }
}

