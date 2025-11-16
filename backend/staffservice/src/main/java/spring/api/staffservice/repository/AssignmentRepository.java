package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.Assignment;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTechnicianId(Long technicianId);
    List<Assignment> findByStatus(String status);
    Optional<Assignment> findByAppointmentId(Long appointmentId);
    List<Assignment> findByTechnicianIdAndStatus(Long technicianId, String status);
    List<Assignment> findAllByOrderByAssignedAtDesc();
}

