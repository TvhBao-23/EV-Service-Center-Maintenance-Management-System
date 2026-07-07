package org.example.partsinventoryservice.repository;

import jakarta.transaction.Transactional;
import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.entity.PartInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PartInventoryRepository extends JpaRepository<PartInventory, Long> {
    Optional<PartInventory> findByPart(Part part);
    Optional<PartInventory> findByPart_PartId(Long partId);
    long countByQuantityInStockLessThanEqual(Integer minStockLevel);

    @Transactional
    void deleteByPart_PartId(Long partId);
}


