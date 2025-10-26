package spring.api.evservicecenter.adminworkshop.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import spring.api.evservicecenter.adminworkshop.entity.Vehicle;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    /**
     * Tìm tất cả các xe thuộc về một khách hàng cụ thể.
     */
    List<Vehicle> findByCustomerId(Integer customerId);

    /**
     * Kiểm tra sự tồn tại của xe bằng số VIN.
     */
    Boolean existsByVin(String vin);
}