package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import spring.api.maintenance.entity.Appointment;
import spring.api.maintenance.entity.ServiceOrder;
import spring.api.maintenance.entity.Staff;
import spring.api.maintenance.repository.ServiceOrderRepository;
import spring.api.maintenance.repository.AppointmentRepository;
import spring.api.maintenance.repository.StaffRepository;
import spring.api.maintenance.dto.ServiceOrderCompletionRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceOrderService {

    @Autowired
    private ServiceOrderRepository serviceOrderRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private StaffRepository staffRepository;

    public ServiceOrder createServiceOrderFromAppointment(Integer appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            ServiceOrder serviceOrder = new ServiceOrder();
            serviceOrder.setAppointmentId(appointmentId);
            serviceOrder.setVehicleId(appointment.getVehicleId());
            serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.QUEUED);
            serviceOrder.setCreatedAt(LocalDateTime.now());
            return serviceOrderRepository.save(serviceOrder);
        }
        return null;
    }

    public ServiceOrder createServiceOrder(ServiceOrder serviceOrder) {
        serviceOrder.setCreatedAt(LocalDateTime.now());
        return serviceOrderRepository.save(serviceOrder);
    }

    public ServiceOrder getServiceOrderById(Integer orderId) {
        Optional<ServiceOrder> serviceOrder = serviceOrderRepository.findById(orderId);
        return serviceOrder.orElse(null);
    }

    public List<ServiceOrder> getServiceOrdersByStatus(String status) {
        ServiceOrder.ServiceOrderStatus statusEnum = ServiceOrder.ServiceOrderStatus.valueOf(status.toUpperCase());
        return serviceOrderRepository.findByStatus(statusEnum);
    }

    public List<ServiceOrder> getAllServiceOrders() {
        return serviceOrderRepository.findAll();
    }

    public ServiceOrder updateServiceOrderStatus(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(serviceOrder);
    }

    public ServiceOrder assignTechnician(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(serviceOrder);
    }

    public ServiceOrder completeServiceOrder(ServiceOrder serviceOrder) {
        serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.COMPLETED);
        serviceOrder.setCompletedAt(LocalDateTime.now());
        return serviceOrderRepository.save(serviceOrder);
    }

    public ServiceOrder updateServiceOrderAmount(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(serviceOrder);
    }

    public List<ServiceOrder> getServiceOrdersByTechnician(Integer technicianId) {
        // technicianId từ frontend là userId, cần map sang staff_id
        Optional<Staff> staffOpt = staffRepository.findByUserId(technicianId.longValue());

        Long staffId;
        if (!staffOpt.isPresent()) {
            // Tự động tạo staff record nếu chưa có (giống assignTechnician)
            System.out.println("[ServiceOrderService] Staff record not found for userId: " + technicianId
                    + ", creating new staff record...");
            Staff newStaff = new Staff();
            newStaff.setUserId(technicianId.longValue());
            newStaff.setPosition("technician"); // Default position
            newStaff.setHireDate(java.time.LocalDate.now());
            newStaff.setCreatedAt(LocalDateTime.now());
            newStaff.setUpdatedAt(LocalDateTime.now());
            Staff savedStaff = staffRepository.save(newStaff);
            staffId = savedStaff.getStaffId();
            System.out.println("[ServiceOrderService] Created new staff record with staff_id: " + staffId);
        } else {
            Staff staff = staffOpt.get();
            staffId = staff.getStaffId();
            System.out.println("[ServiceOrderService] getServiceOrdersByTechnician: mapped userId " + technicianId
                    + " to staff_id " + staffId);
        }

        return serviceOrderRepository.findByAssignedTechnicianId(staffId.intValue());
    }

    public ServiceOrder updateServiceOrderStatus(Integer orderId, String status) {
        ServiceOrder serviceOrder = getServiceOrderById(orderId);
        if (serviceOrder != null) {
            serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.valueOf(status.toUpperCase()));
            return serviceOrderRepository.save(serviceOrder);
        }
        return null;
    }

    public ServiceOrder assignTechnician(Integer orderId, Integer technicianId) {
        System.out.println(
                "[ServiceOrderService] assignTechnician called: orderId=" + orderId + ", technicianId (userId)="
                        + technicianId);

        // Map userId sang staff_id
        // technicianId từ frontend là userId, cần tìm staff_id tương ứng
        Optional<Staff> staffOpt = staffRepository.findByUserId(technicianId.longValue());

        Long staffId;
        if (!staffOpt.isPresent()) {
            // Tự động tạo staff record nếu chưa có
            System.out.println("[ServiceOrderService] Staff record not found for userId: " + technicianId
                    + ", creating new staff record...");
            Staff newStaff = new Staff();
            newStaff.setUserId(technicianId.longValue());
            newStaff.setPosition("technician"); // Default position
            newStaff.setHireDate(java.time.LocalDate.now());
            newStaff.setCreatedAt(LocalDateTime.now());
            newStaff.setUpdatedAt(LocalDateTime.now());
            Staff savedStaff = staffRepository.save(newStaff);
            staffId = savedStaff.getStaffId();
            System.out.println("[ServiceOrderService] Created new staff record with staff_id: " + staffId);
        } else {
            Staff staff = staffOpt.get();
            staffId = staff.getStaffId();
            System.out.println("[ServiceOrderService] Mapped userId " + technicianId + " to staff_id " + staffId);
        }

        ServiceOrder serviceOrder = getServiceOrderById(orderId);
        if (serviceOrder != null) {
            System.out.println("[ServiceOrderService] Found service order: " + serviceOrder.getOrderId());
            // Sử dụng staff_id thay vì userId
            serviceOrder.setAssignedTechnicianId(staffId.intValue());
            System.out.println("[ServiceOrderService] Setting assignedTechnicianId (staff_id) to: " + staffId);
            ServiceOrder saved = serviceOrderRepository.save(serviceOrder);
            System.out.println("[ServiceOrderService] Saved service order with assignedTechnicianId: "
                    + saved.getAssignedTechnicianId());
            return saved;
        }
        System.out.println("[ServiceOrderService] Service order not found with orderId: " + orderId);
        return null;
    }

    public ServiceOrder completeServiceOrder(Integer orderId, ServiceOrderCompletionRequest request) {
        ServiceOrder serviceOrder = getServiceOrderById(orderId);
        if (serviceOrder != null) {
            serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.COMPLETED);
            serviceOrder.setCompletedAt(LocalDateTime.now());
            if (request.getTotalAmount() != null) {
                serviceOrder.setTotalAmount(request.getTotalAmount());
            }
            return serviceOrderRepository.save(serviceOrder);
        }
        return null;
    }

    public ServiceOrder updateServiceOrderAmount(Integer orderId, Double amount) {
        ServiceOrder serviceOrder = getServiceOrderById(orderId);
        if (serviceOrder != null) {
            serviceOrder.setTotalAmount(java.math.BigDecimal.valueOf(amount));
            return serviceOrderRepository.save(serviceOrder);
        }
        return null;
    }
}
