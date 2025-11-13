package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.Part;
import spring.api.maintenance.repository.PartRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PartService {

    @Autowired
    private PartRepository partRepository;

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    public Optional<Part> getPartById(Integer partId) {
        return partRepository.findById(partId);
    }

    public Optional<Part> getPartByCode(String partCode) {
        return partRepository.findByPartCode(partCode);
    }

    public Part createPart(Part part) {
        return partRepository.save(part);
    }

    public Part updatePart(Integer partId, Part partDetails) {
        Optional<Part> optionalPart = partRepository.findById(partId);
        if (optionalPart.isPresent()) {
            Part part = optionalPart.get();
            part.setPartCode(partDetails.getPartCode());
            part.setName(partDetails.getName());
            part.setDescription(partDetails.getDescription());
            part.setCategory(partDetails.getCategory());
            part.setUnitPrice(partDetails.getUnitPrice());
            part.setManufacturer(partDetails.getManufacturer());
            return partRepository.save(part);
        }
        throw new RuntimeException("Part not found with ID: " + partId);
    }

    public Object getPartInventory(Integer partId) {
        // This would typically involve a separate inventory service
        // For now, return a simple response
        return "Inventory check for part ID: " + partId;
    }

    public List<Part> getPartsByCategory(String category) {
        return partRepository.findByCategory(category);
    }

    public List<Part> getPartsByManufacturer(String manufacturer) {
        return partRepository.findByManufacturer(manufacturer);
    }

    public List<Part> searchPartsByName(String name) {
        return partRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Part> getLowStockParts() {
        // This would typically involve inventory checking
        // For now, return empty list
        return List.of();
    }

    public void deletePart(Integer partId) {
        partRepository.deleteById(partId);
    }

    public List<Part> getPartsByPriceRange(Double minPrice, Double maxPrice) {
        return partRepository.findByUnitPriceBetween(minPrice, maxPrice);
    }
}
