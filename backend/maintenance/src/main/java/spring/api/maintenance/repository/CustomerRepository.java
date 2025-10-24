package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho Customer entity
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    /**
     * Tìm khách hàng theo email
     */
    Optional<Customer> findByEmail(String email);

    /**
     * Tìm khách hàng theo số điện thoại
     */
    Optional<Customer> findByPhone(String phone);

    /**
     * Tìm khách hàng theo tên (tìm kiếm gần đúng)
     */
    @Query("SELECT c FROM Customer c WHERE c.fullName LIKE %:name%")
    List<Customer> findByNameContaining(@Param("name") String name);

    /**
     * Đếm số lượng khách hàng
     */
    @Query("SELECT COUNT(c) FROM Customer c")
    long countAllCustomers();
}