package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository cho Customer entity
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    /**
     * Tìm khách hàng theo user_id
     */
    Optional<Customer> findByUserId(Integer userId);
}