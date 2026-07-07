package org.example.partsinventoryservice.repository;

import org.example.partsinventoryservice.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findByPartCode(String partCode);

    @Query("SELECT DISTINCT p FROM Part p LEFT JOIN FETCH p.inventory")
    List<Part> findAllWithInventory();

    @Query("SELECT p FROM Part p LEFT JOIN FETCH p.inventory WHERE p.partId = :id")
    Optional<Part> findByIdWithInventory(@Param("id") Long id);
}
