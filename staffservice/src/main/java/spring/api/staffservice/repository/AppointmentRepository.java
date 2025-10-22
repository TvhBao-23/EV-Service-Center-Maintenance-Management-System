package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.staffservice.domain.Appointment;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findAllByOrderByAppointmentDateDesc();
    List<Appointment> findByStatus(String status);
}

