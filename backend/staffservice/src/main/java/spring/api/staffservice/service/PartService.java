package spring.api.staffservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.staffservice.domain.Part;
import spring.api.staffservice.repository.PartRepository;
import spring.api.staffservice.repository.ServicePartCategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartService {
    private final PartRepository partRepository;
    private final ServicePartCategoryRepository servicePartCategoryRepository;

    public List<Part> getAllParts() {
        List<Part> parts = partRepository.findAll();
        parts.forEach(this::fixPartEncoding);
        return parts;
    }

    public Part getPartById(Long partId) {
        return partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found with ID: " + partId));
    }

    public Part getPartByCode(String partCode) {
        return partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new RuntimeException("Part not found with code: " + partCode));
    }

    public List<Part> getPartsByCategory(String category) {
        List<Part> parts = partRepository.findByCategory(category);
        parts.forEach(this::fixPartEncoding);
        return parts;
    }

    /**
     * Get parts relevant for a specific service category
     * 
     * @param serviceCategory The service category (maintenance, battery, charging,
     *                        etc.)
     * @return List of parts matching the service's relevant part categories
     */
    public List<Part> getPartsForService(String serviceCategory) {
        log.info("🔍 Fetching parts for service category: {}", serviceCategory);

        // Get relevant part categories for this service
        List<String> partCategories = servicePartCategoryRepository
                .findPartCategoriesByServiceCategory(serviceCategory);

        log.info("📦 Found {} part categories for service '{}': {}",
                partCategories.size(), serviceCategory, partCategories);

        if (partCategories.isEmpty()) {
            log.warn("⚠️ No part categories mapped for service '{}'", serviceCategory);
            return List.of();
        }

        // Find all parts in these categories
        List<Part> parts = partRepository.findByCategoryIn(partCategories);

        // Fix encoding for all parts
        parts.forEach(this::fixPartEncoding);

        log.info("✅ Returning {} parts for service '{}'", parts.size(), serviceCategory);

        return parts;
    }

    /**
     * Fix encoding issues in part name and description
     */
    private void fixPartEncoding(Part part) {
        if (part.getName() != null) {
            part.setName(fixStringEncoding(part.getName()));
        }
        if (part.getDescription() != null) {
            part.setDescription(fixStringEncoding(part.getDescription()));
        }
        if (part.getManufacturer() != null) {
            part.setManufacturer(fixStringEncoding(part.getManufacturer()));
        }
    }

    /**
     * Fix common UTF-8 encoding issues
     */
    private String fixStringEncoding(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }

        // Check if string has encoding issues
        if (str.contains("???") || str.contains("Ã") || str.contains("áº") || str.contains("Æ°")) {
            try {
                // Try to decode as if it was UTF-8 bytes interpreted as Latin1
                byte[] bytes = new byte[str.length()];
                for (int i = 0; i < str.length(); i++) {
                    bytes[i] = (byte) (str.charAt(i) & 0xFF);
                }
                String decoded = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);

                // If decoded is different and doesn't contain encoding artifacts, use it
                if (!decoded.equals(str) && !decoded.contains("???")) {
                    log.debug("Fixed encoding: '{}' -> '{}'", str, decoded);
                    return decoded;
                }
            } catch (Exception e) {
                log.warn("Failed to fix encoding for string: {}", str);
            }

            // Manual replacement for common Vietnamese encoding issues
            return str
                    .replace("áº", "ư")
                    .replace("á»", "ộ")
                    .replace("á»", "ệ")
                    .replace("á»", "ồ")
                    .replace("á»", "ề")
                    .replace("Ã¡", "á")
                    .replace("Ã©", "é")
                    .replace("Ã­", "í")
                    .replace("Ã³", "ó")
                    .replace("Ãº", "ú")
                    .replace("Ã½", "ý")
                    .replace("á»", "à")
                    .replace("á»", "è")
                    .replace("á»", "ì")
                    .replace("á»", "ò")
                    .replace("á»", "ù")
                    .replace("???", "");
        }

        return str;
    }

    public List<Part> getLowStockParts() {
        return partRepository.findByStatus(Part.PartStatus.low_stock);
    }

    public List<Part> getOutOfStockParts() {
        return partRepository.findByStatus(Part.PartStatus.out_of_stock);
    }

    @Transactional
    public Part createPart(Part part) {
        log.info("Creating new part: {}", part.getName());
        return partRepository.save(part);
    }

    @Transactional
    public Part updatePart(Long partId, Part partDetails) {
        Part part = getPartById(partId);

        part.setName(partDetails.getName());
        part.setDescription(partDetails.getDescription());
        part.setCategory(partDetails.getCategory());
        part.setManufacturer(partDetails.getManufacturer());
        part.setCompatibleModels(partDetails.getCompatibleModels());
        part.setUnitPrice(partDetails.getUnitPrice());
        part.setStockQuantity(partDetails.getStockQuantity());
        part.setMinStockLevel(partDetails.getMinStockLevel());
        part.setLocation(partDetails.getLocation());
        part.setWarrantyMonths(partDetails.getWarrantyMonths());
        part.setImageUrl(partDetails.getImageUrl());

        if (partDetails.getStatus() != null) {
            part.setStatus(partDetails.getStatus());
        }

        log.info("Updating part ID: {}", partId);
        return partRepository.save(part);
    }

    @Transactional
    public Part updateStock(Long partId, Integer newQuantity) {
        Part part = getPartById(partId);
        part.setStockQuantity(newQuantity);
        log.info("Updated stock for part {} to {}", partId, newQuantity);
        return partRepository.save(part);
    }

    @Transactional
    public Part adjustStock(Long partId, Integer adjustment) {
        Part part = getPartById(partId);
        int newQuantity = part.getStockQuantity() + adjustment;
        if (newQuantity < 0) {
            throw new RuntimeException("Stock quantity cannot be negative");
        }
        part.setStockQuantity(newQuantity);
        log.info("Adjusted stock for part {} by {}. New quantity: {}", partId, adjustment, newQuantity);
        return partRepository.save(part);
    }

    @Transactional
    public void deletePart(Long partId) {
        Part part = getPartById(partId);
        log.info("Deleting part ID: {}", partId);
        partRepository.delete(part);
    }

    @Transactional
    public Part discontinuePart(Long partId) {
        Part part = getPartById(partId);
        part.setStatus(Part.PartStatus.discontinued);
        log.info("Discontinued part ID: {}", partId);
        return partRepository.save(part);
    }
}
