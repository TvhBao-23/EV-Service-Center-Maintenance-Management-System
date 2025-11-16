package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.Part;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findByPartCode(String partCode);
    List<Part> findByCategory(String category);
    List<Part> findByCategoryIn(List<String> categories);
    List<Part> findByStatus(Part.PartStatus status);
    List<Part> findByStockQuantityLessThanEqual(Integer quantity);
}

