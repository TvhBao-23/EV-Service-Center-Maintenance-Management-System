package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.example.partsinventoryservice.respository.PartRepository;
import org.example.partsinventoryservice.respository.PartTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final PartTransactionRepository transactionRepository;
    private final PartRepository partRepository;
    private final InventoryService inventoryService;

    public TransactionService(PartTransactionRepository transactionRepository, PartRepository partRepository, InventoryService inventoryService) {
        this.transactionRepository = transactionRepository;
        this.partRepository = partRepository;
        this.inventoryService = inventoryService;
    }

    public List<PartTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public PartTransaction recordTransaction(Long partId, TransactionType type, int quantity, String performedBy) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ tùng."));

        // Cập nhật tồn kho
        if (type == TransactionType.IMPORT) {
            inventoryService.updateStock(partId, quantity);
        } else if (type == TransactionType.EXPORT) {
            inventoryService.updateStock(partId, -quantity);
        }

        PartTransaction transaction = new PartTransaction();
        transaction.setPart(part);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setPerformedBy(performedBy);
        return transactionRepository.save(transaction);
    }
}
