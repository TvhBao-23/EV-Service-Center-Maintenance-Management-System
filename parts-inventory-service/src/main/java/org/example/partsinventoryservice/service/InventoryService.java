package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.entity.PartInventory;
import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.example.partsinventoryservice.exception.BadRequestException;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.repository.PartInventoryRepository;
import org.example.partsinventoryservice.repository.PartRepository;
import org.example.partsinventoryservice.repository.PartTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final PartInventoryRepository inventoryRepo;
    private final PartRepository partRepo;
    private final PartTransactionRepository txnRepo;

    public InventoryService(PartInventoryRepository inventoryRepo,
                            PartRepository partRepo,
                            PartTransactionRepository txnRepo) {
        this.inventoryRepo = inventoryRepo;
        this.partRepo = partRepo;
        this.txnRepo = txnRepo;
    }

    @Transactional(readOnly = true)
    public List<PartInventory> getAll() {
        return inventoryRepo.findAll();
    }

    @Transactional(readOnly = true)
    public PartInventory getByPartId(Long partId) {
        return inventoryRepo.findByPart_PartId(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho cho partId=" + partId));
    }

    @Transactional
    public PartInventory initForPart(Long partId, int initialQty, int minLevel) {
        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng id=" + partId));

        // nếu đã có tồn kho -> cập nhật
        PartInventory inv = inventoryRepo.findByPart_PartId(partId).orElse(new PartInventory());
        inv.setPart(part);
        inv.setQuantityInStock(Math.max(0, initialQty));
        inv.setMinStockLevel(Math.max(0, minLevel));
        return inventoryRepo.save(inv);
    }

    @Transactional
    public PartInventory updateMinLevel(Long partId, int minLevel) {
        PartInventory inv = getByPartId(partId);
        inv.setMinStockLevel(Math.max(0, minLevel));
        return inventoryRepo.save(inv);
    }

    @Transactional
    public PartInventory importStock(Long partId, int qty, Long staffId, String note) {
        if (qty <= 0) throw new BadRequestException("Số lượng nhập phải > 0");
        if (staffId == null) staffId = 1L; // fallback test id

        PartInventory inv = inventoryRepo.findByPart_PartId(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa khởi tạo tồn kho cho partId=" + partId));

        inv.setQuantityInStock(inv.getQuantityInStock() + qty);
        inventoryRepo.save(inv);

        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng id=" + partId));

        PartTransaction txn = new PartTransaction();
        txn.setPart(part);
        txn.setType(TransactionType.IMPORT);
        txn.setQuantity(qty);
        txn.setNote(note);
        txn.setCreatedByStaffId(staffId);
        txnRepo.save(txn);

        return inv;
    }


    /**
     * Xuất kho: giảm số lượng và ghi transaction EXPORT
     */
    @Transactional
    public PartInventory exportStock(Long partId, int qty, Long staffId, String note, Long relatedOrderId, Long relatedRequestId) {
        if (qty <= 0) throw new BadRequestException("Số lượng xuất phải > 0");

        PartInventory inv = inventoryRepo.findByPart_PartId(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa khởi tạo tồn kho cho partId=" + partId));

        int after = inv.getQuantityInStock() - qty;
        if (after < 0) throw new BadRequestException("Tồn kho không đủ để xuất");

        inv.setQuantityInStock(after);
        inventoryRepo.save(inv);

        PartTransaction txn = new PartTransaction();
        txn.setPart(inv.getPart());
        txn.setType(TransactionType.EXPORT);
        txn.setQuantity(qty);
        txn.setCreatedByStaffId(staffId);
        txn.setRelatedOrderId(relatedOrderId);
        txn.setRelatedRequestId(relatedRequestId);
        txn.setNote(note);
        txnRepo.save(txn);

        return inv;
    }

    /**
     * Điều chỉnh tồn kho (dương hoặc âm) và ghi transaction ADJUSTMENT
     */
    @Transactional
    public PartInventory adjustStock(Long partId, int delta, Long staffId, String note) {
        PartInventory inv = inventoryRepo.findByPart_PartId(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa khởi tạo tồn kho cho partId=" + partId));

        int after = inv.getQuantityInStock() + delta;
        if (after < 0) throw new BadRequestException("Điều chỉnh làm âm tồn kho!");

        inv.setQuantityInStock(after);
        inventoryRepo.save(inv);

        PartTransaction txn = new PartTransaction();
        txn.setPart(inv.getPart());
        txn.setType(TransactionType.ADJUSTMENT);
        txn.setQuantity(Math.abs(delta));
        txn.setNote(note);
        txn.setCreatedByStaffId(staffId);
        txnRepo.save(txn);

        return inv;
    }

    @Transactional(readOnly = true)
    public long countLowStock() {
        List<PartInventory> all = inventoryRepo.findAll();
        return all.stream()
                .filter(p -> p.getQuantityInStock() <= p.getMinStockLevel())
                .count();
    }

}
