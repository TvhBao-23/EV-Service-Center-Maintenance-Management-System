package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.Vehicle;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByCustomer(Customer customer);
}


