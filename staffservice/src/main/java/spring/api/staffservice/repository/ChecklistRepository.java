package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.Checklist;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    Optional<Checklist> findByAssignmentId(Long assignmentId);
    List<Checklist> findByVehicleId(Long vehicleId);
    List<Checklist> findByTechnicianId(Long technicianId);
    List<Checklist> findAllByOrderByCheckedAtDesc();
}

