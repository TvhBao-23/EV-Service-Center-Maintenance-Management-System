package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.Customer;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomer(Customer customer);
}


