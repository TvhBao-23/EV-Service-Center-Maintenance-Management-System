package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    // Find part by part code
    Optional<Part> findByPartCode(String partCode);

    // Find parts by name containing keyword
    List<Part> findByNameContainingIgnoreCase(String name);

    // Find parts by category
    List<Part> findByCategory(String category);

    // Find parts by manufacturer
    List<Part> findByManufacturer(String manufacturer);

    // Find parts by price range
    List<Part> findByUnitPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Find parts by name and category
    List<Part> findByNameContainingIgnoreCaseAndCategory(String name, String category);

    // Find parts by manufacturer and category
    List<Part> findByManufacturerAndCategory(String manufacturer, String category);

    // Find parts by description containing keyword
    @Query("SELECT p FROM Part p WHERE p.description LIKE %:keyword%")
    List<Part> findByDescriptionContaining(@Param("keyword") String keyword);

    // Find parts ordered by price ascending
    List<Part> findAllByOrderByUnitPriceAsc();

    // Find parts ordered by price descending
    List<Part> findAllByOrderByUnitPriceDesc();

    // Find parts by name ordered by price
    List<Part> findByNameContainingIgnoreCaseOrderByUnitPriceAsc(String name);

    // Count parts by category
    long countByCategory(String category);

    // Count parts by manufacturer
    long countByManufacturer(String manufacturer);

    // Find most expensive parts
    @Query("SELECT p FROM Part p ORDER BY p.unitPrice DESC")
    List<Part> findMostExpensiveParts();

    // Find cheapest parts
    @Query("SELECT p FROM Part p ORDER BY p.unitPrice ASC")
    List<Part> findCheapestParts();
}
