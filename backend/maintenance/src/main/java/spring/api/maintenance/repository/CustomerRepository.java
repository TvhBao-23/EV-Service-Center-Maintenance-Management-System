package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    // Find customer by email
    Optional<Customer> findByEmail(String email);

    // Find customer by phone
    Optional<Customer> findByPhone(String phone);

    // Find customers by address containing keyword
    List<Customer> findByAddressContainingIgnoreCase(String address);

    // Custom query to find customers with vehicles
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.vehicles WHERE c.customerId = :customerId")
    Optional<Customer> findByIdWithVehicles(@Param("customerId") Integer customerId);

    // Custom query to find customers with appointments
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.appointments WHERE c.customerId = :customerId")
    Optional<Customer> findByIdWithAppointments(@Param("customerId") Integer customerId);

    // Count total customers
    @Query("SELECT COUNT(c) FROM Customer c")
    long countAllCustomers();
}
