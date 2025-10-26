package spring.api.evservicecenter.adminworkshop.service;

import spring.api.evservicecenter.adminworkshop.dto.AssignTechnicianRequestDTO;
import spring.api.evservicecenter.adminworkshop.dto.ServiceOrderAdminDTO;
import spring.api.evservicecenter.adminworkshop.dto.UpdateServiceOrderStatusRequestDTO;
import spring.api.evservicecenter.adminworkshop.entity.ServiceOrder;
import spring.api.evservicecenter.adminworkshop.entity.Staff;
import spring.api.evservicecenter.adminworkshop.enums.ServiceOrderStatus;
import spring.api.evservicecenter.adminworkshop.exception.ResourceNotFoundException;
import spring.api.evservicecenter.adminworkshop.repository.ServiceOrderRepository;
import spring.api.evservicecenter.adminworkshop.repository.StaffRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;


@Service
public class ServiceOrderAdminService {

    @Autowired
    private ServiceOrderRepository serviceOrderRepository;

    @Autowired
    private StaffRepository staffRepository;

    public List<ServiceOrderAdminDTO> getAllServiceOrdersAdmin() {
        return serviceOrderRepository.findAllServiceOrdersForAdmin();
    }

    @Transactional
    public ServiceOrder assignTechnician(Integer orderId, AssignTechnicianRequestDTO dto) {
        ServiceOrder serviceOrder = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder not found with id: " + orderId));

        Staff technician = staffRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician (Staff) not found with id: " + dto.getTechnicianId()));

        // Optional: Add validation to ensure the staff member is actually a technician
        if (technician.getPosition() != spring.api.evservicecenter.adminworkshop.enums.StaffPosition.technician) {
             throw new IllegalArgumentException("Staff member is not a technician.");
        }


        serviceOrder.setAssignedTechnician(technician);
        return serviceOrderRepository.save(serviceOrder);
    }

    @Transactional
    public ServiceOrder updateServiceOrderStatus(Integer orderId, UpdateServiceOrderStatusRequestDTO dto) {
        ServiceOrder serviceOrder = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder not found with id: " + orderId));

        // Add logic here if status transitions need validation (e.g., cannot go from completed back to queued)

        serviceOrder.setStatus(dto.getStatus());

        // Update completion time if status is 'completed'
        if (dto.getStatus() == ServiceOrderStatus.completed) {
            serviceOrder.setCompletedAt(java.time.LocalDateTime.now());
            // Potentially update check_out_time as well if appropriate
             if (serviceOrder.getCheckOutTime() == null) {
                serviceOrder.setCheckOutTime(java.time.LocalDateTime.now());
            }
        } else {
             serviceOrder.setCompletedAt(null); // Clear completion time if moved away from completed
        }


        return serviceOrderRepository.save(serviceOrder);
    }

     // Optional: Method to delete a service order (use with caution)
    @Transactional
    public void deleteServiceOrder(Integer orderId) {
        if (!serviceOrderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("ServiceOrder not found with id: " + orderId);
        }
        serviceOrderRepository.deleteById(orderId);
    }
}