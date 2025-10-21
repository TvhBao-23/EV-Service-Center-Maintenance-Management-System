package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Find vehicle by VIN
    Optional<Vehicle> findByVin(String vin);

    // Find vehicles by customer ID
    List<Vehicle> findByCustomerId(Long customerId);

    // Find vehicles by brand
    List<Vehicle> findByBrand(String brand);

    // Find vehicles by model
    List<Vehicle> findByModel(String model);

    // Find vehicles by year range
    List<Vehicle> findByYearBetween(Integer startYear, Integer endYear);

    // Find vehicles by odometer range
    List<Vehicle> findByOdometerKmBetween(BigDecimal minKm, BigDecimal maxKm);

    // Find vehicles needing service (based on date)
    @Query("SELECT v FROM Vehicle v WHERE v.nextServiceDueDate <= :currentDate")
    List<Vehicle> findVehiclesNeedingServiceByDate(@Param("currentDate") LocalDate currentDate);

    // Find vehicles needing service (based on mileage)
    @Query("SELECT v FROM Vehicle v WHERE v.nextServiceDueKm <= v.odometerKm")
    List<Vehicle> findVehiclesNeedingServiceByMileage();

    // Find vehicles by brand and model
    List<Vehicle> findByBrandAndModel(String brand, String model);

    // Custom query to find vehicle with appointments
    @Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.appointments WHERE v.vehicleId = :vehicleId")
    Optional<Vehicle> findByIdWithAppointments(@Param("vehicleId") Long vehicleId);

    // Custom query to find vehicle with service orders
    @Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.serviceOrders WHERE v.vehicleId = :vehicleId")
    Optional<Vehicle> findByIdWithServiceOrders(@Param("vehicleId") Long vehicleId);

    // Count vehicles by customer
    long countByCustomerId(Long customerId);

    // Count vehicles by brand
    long countByBrand(String brand);
}
