package org.example.partsinventoryservice.repository;

import org.example.partsinventoryservice.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findByPartCode(String partCode);
    @Query("select p from Part p left join fetch p.inventory")
    List<Part> findAllWithInventory();
}



