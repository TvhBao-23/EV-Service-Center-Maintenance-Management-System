package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho Vehicle entity
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    /**
     * Tìm xe theo VIN
     */
    Optional<Vehicle> findByVin(String vin);

    /**
     * Tìm tất cả xe của một khách hàng
     */
    List<Vehicle> findByCustomerId(Integer customerId);

    /**
     * Tìm xe theo hãng và model
     */
    @Query("SELECT v FROM Vehicle v WHERE v.brand = :brand AND v.model = :model")
    List<Vehicle> findByBrandAndModel(@Param("brand") String brand, @Param("model") String model);

    /**
     * Tìm xe cần bảo dưỡng (đã đến hạn)
     */
    @Query("SELECT v FROM Vehicle v WHERE v.nextServiceDueKm <= :currentKm OR v.nextServiceDueDate <= CURRENT_TIMESTAMP")
    List<Vehicle> findVehiclesDueForService(@Param("currentKm") Double currentKm);

    /**
     * Đếm số xe của một khách hàng
     */
    long countByCustomerId(Integer customerId);

    /**
     * Tìm xe theo hãng
     */
    List<Vehicle> findByBrand(String brand);

    /**
     * Tìm xe cần bảo dưỡng theo ngày
     */
    List<Vehicle> findByNextServiceDueDateLessThanEqual(java.time.LocalDate date);
}