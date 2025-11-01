package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.Part;
import spring.api.maintenance.repository.PartRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PartsService {

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

    public List<Part> getPartsByCategory(String category) {
        return partRepository.findByCategory(category);
    }

    public List<Part> getPartsByManufacturer(String manufacturer) {
        return partRepository.findByManufacturer(manufacturer);
    }

    public List<Part> searchPartsByName(String name) {
        return partRepository.findByNameContainingIgnoreCase(name);
    }

    public Part createPart(Part part) {
        return partRepository.save(part);
    }

    public Part updatePart(Integer partId, Part part) {
        part.setPartId(partId);
        return partRepository.save(part);
    }

    public void deletePart(Integer partId) {
        partRepository.deleteById(partId);
    }

    public List<Part> getPartsByPriceRange(Double minPrice, Double maxPrice) {
        return partRepository.findByUnitPriceBetween(minPrice, maxPrice);
    }

    public Object getPartInventory(Integer partId) {
        // This would typically query the part_inventories table
        // For now, return a simple response
        return "Inventory check for part ID: " + partId;
    }
}