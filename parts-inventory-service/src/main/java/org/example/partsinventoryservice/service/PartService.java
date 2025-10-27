package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.respository.PartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    public Part getPartById(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng với ID: " + id));
    }

    public Part addPart(Part part) {
        return partRepository.save(part);
    }

    public Part updatePart(Long id, Part updatedPart) {
        Part part = getPartById(id);
        part.setName(updatedPart.getName());
        part.setDescription(updatedPart.getDescription());
        part.setPrice(updatedPart.getPrice());
        return partRepository.save(part);
    }

    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy phụ tùng cần xóa.");
        }
        partRepository.deleteById(id);
    }
}
