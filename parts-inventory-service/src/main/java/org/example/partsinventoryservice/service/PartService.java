package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.repository.PartInventoryRepository;
import org.example.partsinventoryservice.repository.PartRepository;
import org.example.partsinventoryservice.repository.PartTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PartService {

    private final PartRepository partRepository;
    private final PartInventoryRepository inventoryRepo;   // ✅ Thêm
    private final PartTransactionRepository txnRepo;

    public PartService(PartRepository partRepository,
                       PartInventoryRepository inventoryRepo,
                       PartTransactionRepository txnRepo) {
        this.partRepository = partRepository;
        this.inventoryRepo = inventoryRepo;
        this.txnRepo = txnRepo;
    }

    @Transactional(readOnly = true)
    public List<Part> getAllParts() {
        return partRepository.findAllWithInventory();
    }

    @Transactional(readOnly = true)
    public Part getById(Long partId) {
        return partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng id=" + partId));
    }

    @Transactional(readOnly = true)
    public Part getByCode(String partCode) {
        return partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng mã=" + partCode));
    }

    @Transactional
    public Part create(Part req) {
        // có thể bổ sung validate trùng part_code ở repository bằng unique
        return partRepository.save(req);
    }

    @Transactional
    public Part update(Long partId, Part req) {
        Part p = getById(partId);
        p.setPartCode(req.getPartCode());
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setCategory(req.getCategory());
        p.setUnitPrice(req.getUnitPrice());
        p.setManufacturer(req.getManufacturer());
        return partRepository.save(p);
    }

    @Transactional
    public void delete(Long partId) {
        // Xóa transaction trước
        txnRepo.deleteAllByPart_PartId(partId);

        // Xóa inventory
        inventoryRepo.deleteByPart_PartId(partId);

        // Cuối cùng xóa part
        Part p = getById(partId);
        partRepository.delete(p);
    }

}
