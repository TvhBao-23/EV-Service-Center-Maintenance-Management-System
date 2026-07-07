package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.customerservice.domain.Customer;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long userId);
}

