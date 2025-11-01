package spring.api.maintenance.repository;

import spring.api.maintenance.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository cho ServiceEntity
 */
@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Integer> {

    /**
     * Tìm dịch vụ theo loại
     */
    List<ServiceEntity> findByType(String type);

    /**
     * Tìm dịch vụ package
     */
    List<ServiceEntity> findByIsPackageTrue();

    /**
     * Tìm dịch vụ theo tên (case insensitive)
     */
    List<ServiceEntity> findByNameContainingIgnoreCase(String name);

    /**
     * Tìm dịch vụ theo khoảng giá
     */
    List<ServiceEntity> findByBasePriceBetween(Double minPrice, Double maxPrice);

    /**
     * Tìm dịch vụ theo loại và giá
     */
    @Query("SELECT s FROM ServiceEntity s WHERE s.type = :type AND s.basePrice BETWEEN :minPrice AND :maxPrice")
    List<ServiceEntity> findByTypeAndPriceRange(@Param("type") String type,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice);
}
