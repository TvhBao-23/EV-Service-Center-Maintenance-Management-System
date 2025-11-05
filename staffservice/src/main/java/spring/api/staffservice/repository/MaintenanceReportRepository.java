package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.MaintenanceReport;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceReportRepository extends JpaRepository<MaintenanceReport, Long> {
    Optional<MaintenanceReport> findByAssignmentId(Long assignmentId);
    List<MaintenanceReport> findByVehicleId(Long vehicleId);
    List<MaintenanceReport> findByTechnicianId(Long technicianId);
    List<MaintenanceReport> findByStatus(String status);
    List<MaintenanceReport> findAllByOrderByCreatedAtDesc();
}

