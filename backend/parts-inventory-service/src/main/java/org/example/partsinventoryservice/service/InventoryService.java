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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ tùng có mã: " + partCode));
        return inventoryRepository.findByPart(part)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tồn kho cho phụ tùng: " + partCode));
    }

    public Inventory addStock(String partCode, int quantity) {
        Part part = partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ tùng: " + partCode));

        Inventory inventory = inventoryRepository.findByPart(part)
                .orElse(Inventory.builder()
                        .part(part)
                        .quantityInStock(0)
                        .minStockLevel(5)
                        .build());

        inventory.setQuantityInStock(inventory.getQuantityInStock() + quantity);
        return inventoryRepository.save(inventory);
    }

    public Inventory reduceStock(String partCode, int quantity) {
        Inventory inventory = getInventoryByPartCode(partCode);
        if (inventory.getQuantityInStock() < quantity) {
            throw new RuntimeException("Số lượng tồn kho không đủ để xuất!");
        }
        inventory.setQuantityInStock(inventory.getQuantityInStock() - quantity);
        return inventoryRepository.save(inventory);
    }
}


