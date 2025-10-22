package org.example.partsinventoryservice.respository;

import org.example.partsinventoryservice.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findByPartCode(String partCode);
}

