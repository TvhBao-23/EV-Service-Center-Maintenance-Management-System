package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByUser(User user);
}


