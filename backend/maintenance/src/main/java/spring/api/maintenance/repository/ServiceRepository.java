package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    // Find services by name containing keyword
    List<Service> findByNameContainingIgnoreCase(String name);

    // Find services by type
    List<Service> findByType(Service.ServiceType type);

    // Find services by price range
    List<Service> findByBasePriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Find package services
    List<Service> findByIsPackageTrue();

    // Find non-package services
    List<Service> findByIsPackageFalse();

    // Find services by estimated duration
    List<Service> findByEstimatedDurationMinutesLessThanEqual(Integer maxDuration);

    // Find services by category and type
    @Query("SELECT s FROM Service s WHERE s.type = :type AND s.basePrice <= :maxPrice")
    List<Service> findByTypeAndMaxPrice(@Param("type") Service.ServiceType type,
            @Param("maxPrice") BigDecimal maxPrice);

    // Find most popular services (by usage count)
    @Query("SELECT s FROM Service s ORDER BY s.basePrice ASC")
    List<Service> findAllOrderByPriceAsc();

    // Find services by validity days
    List<Service> findByValidityDaysGreaterThan(Integer minValidityDays);

    // Count services by type
    long countByType(Service.ServiceType type);

    // Count package services
    long countByIsPackageTrue();
}