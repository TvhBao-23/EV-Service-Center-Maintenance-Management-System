package spring.api.evservicecenter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import spring.api.evservicecenter.entity.ServiceRecord;

import java.math.BigDecimal;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {

    // Đếm số dịch vụ của 1 khách hàng (qua các xe của họ)
    @Query("SELECT COUNT(s) FROM ServiceRecord s WHERE s.vehicle.customer.id = :customerId")
    long countByCustomerId(@Param("customerId") Long customerId);

    // Tính tổng chi phí của 1 khách hàng (qua các xe của họ)
    @Query("SELECT SUM(s.cost) FROM ServiceRecord s WHERE s.vehicle.customer.id = :customerId")
    BigDecimal sumCostByCustomerId(@Param("customerId") Long customerId);
}