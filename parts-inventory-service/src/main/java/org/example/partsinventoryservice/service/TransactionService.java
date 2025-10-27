package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.repository.PartRepository;
import org.example.partsinventoryservice.repository.PartTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

    private final PartTransactionRepository txnRepo;
    private final PartRepository partRepo;

    public TransactionService(PartTransactionRepository txnRepo, PartRepository partRepo) {
        this.txnRepo = txnRepo;
        this.partRepo = partRepo;
    }

    @Transactional(readOnly = true)
    public List<PartTransaction> getAll() {
        return txnRepo.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<PartTransaction> getByPart(Long partId) {
        return txnRepo.findByPart_PartIdOrderByCreatedAtDesc(partId);
    }

    @Transactional(readOnly = true)
    public List<PartTransaction> getByType(TransactionType type) {
        return txnRepo.findByTypeOrderByCreatedAtDesc(type);
    }

    /**
     * Ghi nhận nhập kho (chỉ ghi transaction — KHÔNG thay đổi tồn kho ở đây)
     * Nếu muốn thay đổi tồn kho, hãy dùng InventoryService.importStock(...)
     */
    @Transactional
    public PartTransaction recordImport(Long partId, int qty, Long staffId, String note) {
        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng id=" + partId));
        PartTransaction t = new PartTransaction();
        t.setPart(part);
        t.setType(TransactionType.IMPORT);
        t.setQuantity(qty);
        t.setCreatedByStaffId(staffId);
        t.setNote(note);
        return txnRepo.save(t);
    }

    /**
     * Ghi nhận xuất kho cho yêu cầu (chỉ ghi transaction — KHÔNG thay đổi tồn kho ở đây)
     * Nếu muốn thay đổi tồn kho, hãy dùng InventoryService.exportStock(...)
     */
    @Transactional
    public PartTransaction recordExportForRequest(Long partId, int qty, Long staffId, Long requestId, Long orderId, String note) {
        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng id=" + partId));
        PartTransaction t = new PartTransaction();
        t.setPart(part);
        t.setType(TransactionType.EXPORT);
        t.setQuantity(qty);
        t.setCreatedByStaffId(staffId);
        t.setRelatedRequestId(requestId);
        t.setRelatedOrderId(orderId);
        t.setNote(note);
        return txnRepo.save(t);
    }
}
