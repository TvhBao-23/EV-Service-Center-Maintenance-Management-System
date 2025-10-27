package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.entity.PartInventory;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.respository.PartInventoryRepository;
import org.example.partsinventoryservice.respository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final PartInventoryRepository inventoryRepository;
    private final PartRepository partRepository;

    public InventoryService(PartInventoryRepository inventoryRepository, PartRepository partRepository) {
        this.inventoryRepository = inventoryRepository;
        this.partRepository = partRepository;
    }

    public List<PartInventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    public PartInventory getInventoryByPart(Long partId) {
        return inventoryRepository.findByPart_PartId(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho cho phụ tùng ID: " + partId));
    }

    @Transactional
    public void updateStock(Long partId, int quantityChange) {
        PartInventory inventory = getInventoryByPart(partId);
        int newStock = inventory.getCurrentStock() + quantityChange;
        if (newStock < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được âm!");
        }
        inventory.setCurrentStock(newStock);
        inventoryRepository.save(inventory);
    }

    public PartInventory createInventoryForPart(Long partId, int initialStock, int minStock) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng."));
        PartInventory inventory = new PartInventory();
        inventory.setPart(part);
        inventory.setCurrentStock(initialStock);
        inventory.setMinStock(minStock);
        return inventoryRepository.save(inventory);
    }

    public long countLowStockParts() {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getCurrentStock() < inv.getMinStock())
                .count();
    }
}
