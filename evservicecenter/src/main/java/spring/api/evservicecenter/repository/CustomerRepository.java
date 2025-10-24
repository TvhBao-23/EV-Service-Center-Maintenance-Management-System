package spring.api.evservicecenter.repository;

import spring.api.evservicecenter.dto.CustomerResponseDTO;
import spring.api.evservicecenter.entity.Customer;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    /**
     * Lấy danh sách tóm tắt tất cả khách hàng.
     * Sử dụng DTO projection (constructor expression) để chỉ lấy các trường cần thiết 
     * và đếm số lượng xe (vehicleCount) bằng subquery.
     * Giả sử CustomerResponseDTO có constructor khớp với các trường SELECT.
     */
    @Query("SELECT new com.evservicecenter.dto.CustomerResponseDTO(" +
           "c.customerId, u.userId, u.fullName, u.email, u.phone, c.address, u.isActive, " +
           "(SELECT COUNT(v) FROM Vehicle v WHERE v.customer = c)) " +
           "FROM Customer c JOIN c.user u " +
           "WHERE u.role = 'customer'")
    List<CustomerResponseDTO> findAllCustomerSummaries();

    /**
     * Lấy thông tin chi tiết của một khách hàng, bao gồm cả User và danh sách Vehicles.
     * Sử dụng JOIN FETCH để tải đồng thời các mối quan hệ (Eager loading) 
     * tránh lỗi N+1 query khi truy cập user hoặc vehicles.
     */
    @Query("SELECT c FROM Customer c " +
           "JOIN FETCH c.user u " +
           "LEFT JOIN FETCH c.vehicles v " + // LEFT JOIN trong trường hợp khách hàng chưa có xe
           "WHERE c.customerId = :id")
    Optional<Customer> findCustomerDetailsById(@Param("id") Integer id);

}
