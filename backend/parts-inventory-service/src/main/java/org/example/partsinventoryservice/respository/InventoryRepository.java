package org.example.partsinventoryservice.respository;

import org.example.partsinventoryservice.model.Inventory;
import org.example.partsinventoryservice.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByPart(Part part);
}
