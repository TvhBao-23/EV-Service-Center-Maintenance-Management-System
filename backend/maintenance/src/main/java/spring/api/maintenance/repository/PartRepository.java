package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho Part entity
 */
@Repository
public interface PartRepository extends JpaRepository<Part, Integer> {

    /**
     * Tìm phụ tùng theo mã
     */
    Optional<Part> findByPartCode(String partCode);

    /**
     * Tìm phụ tùng theo danh mục
     */
    List<Part> findByCategory(String category);

    /**
     * Tìm phụ tùng đang hoạt động
     */
    List<Part> findByIsActiveTrue();

    /**
     * Tìm phụ tùng theo nhà sản xuất
     */
    List<Part> findByManufacturer(String manufacturer);

    /**
     * Tìm phụ tùng theo tên (tìm kiếm gần đúng)
     */
    @Query("SELECT p FROM Part p WHERE p.name LIKE %:name% AND p.isActive = true")
    List<Part> findByNameContaining(@Param("name") String name);

    /**
     * Tìm phụ tùng theo khoảng giá
     */
    @Query("SELECT p FROM Part p WHERE p.unitPrice BETWEEN :minPrice AND :maxPrice AND p.isActive = true")
    List<Part> findByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

    /**
     * Tìm phụ tùng sắp hết hàng
     */
    @Query("SELECT p FROM Part p WHERE p.stockQuantity <= p.minStockLevel AND p.isActive = true")
    List<Part> findLowStockParts();

    /**
     * Tìm phụ tùng hết hàng
     */
    @Query("SELECT p FROM Part p WHERE p.stockQuantity = 0 AND p.isActive = true")
    List<Part> findOutOfStockParts();

    /**
     * Đếm phụ tùng theo danh mục
     */
    long countByCategory(String category);

    /**
     * Đếm phụ tùng sắp hết hàng
     */
    @Query("SELECT COUNT(p) FROM Part p WHERE p.stockQuantity <= p.minStockLevel AND p.isActive = true")
    long countLowStockParts();

    /**
     * Tìm phụ tùng theo tên (case insensitive)
     */
    List<Part> findByNameContainingIgnoreCase(String name);

    /**
     * Tìm phụ tùng theo khoảng giá
     */
    List<Part> findByUnitPriceBetween(Double minPrice, Double maxPrice);
}