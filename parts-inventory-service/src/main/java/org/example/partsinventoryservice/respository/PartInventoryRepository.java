package org.example.partsinventoryservice.respository;

import org.example.partsinventoryservice.entity.PartInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartInventoryRepository extends JpaRepository<PartInventory, Long> {
    Optional<PartInventory> findByPart_PartId(Long partId);
}

