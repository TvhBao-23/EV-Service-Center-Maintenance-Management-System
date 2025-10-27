package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.repository.PartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    @Transactional(readOnly = true)
    public List<Part> getAll() {
        return partRepository.findAll();
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
        Part p = getById(partId);
        partRepository.delete(p);
    }
}
