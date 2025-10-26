package spring.api.evservicecenter.adminworkshop.repository;



import spring.api.evservicecenter.adminworkshop.dto.ServiceOrderAdminDTO;
import spring.api.evservicecenter.adminworkshop.dto.StaffResponseDTO;
import spring.api.evservicecenter.adminworkshop.entity.ServiceOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Integer> {

    // Query to fetch detailed Service Order information for Admin view
    @Query("SELECT new com.evservicecenter.dto.ServiceOrderAdminDTO(" +
           "so.orderId, a.appointmentId, v.vehicleId, u.fullName, " + // Customer name from User
           "CONCAT(v.brand, ' ', v.model), s.name, a.requestedDateTime, " + // Vehicle, Service name, Appointment time
           "st.staffId, techUser.fullName, so.status, so.checkInTime, so.totalAmount) " +
           "FROM ServiceOrder so " +
           "JOIN so.vehicle v " +
           "JOIN v.customer c " +
           "JOIN c.user u " + // Join to get Customer's User info
           "LEFT JOIN so.appointment a " + // Left join in case appointment is nullified
           "LEFT JOIN a.service s " + // Left join for service name
           "LEFT JOIN so.assignedTechnician st " + // Left join for technician
           "LEFT JOIN st.user techUser " + // Join technician's staff to user
           "ORDER BY a.requestedDateTime DESC") // Example ordering
    List<ServiceOrderAdminDTO> findAllServiceOrdersForAdmin();

    @Query("SELECT new com.evservicecenter.dto.StaffResponseDTO(" + // Reuse StaffResponseDTO or create a simpler one
           "s.staffId, u.userId, u.fullName, u.email, u.phone, u.role, s.position, s.hireDate, u.isActive, u.createdAt) " +
           "FROM Staff s JOIN s.user u " +
           "WHERE u.isActive = true AND s.position = com.evservicecenter.enums.StaffPosition.technician " + // Filter by position
           "ORDER BY u.fullName")
    List<StaffResponseDTO> findAllActiveTechnicians();

}