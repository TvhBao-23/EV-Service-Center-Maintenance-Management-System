package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import spring.api.maintenance.entity.Appointment;
import spring.api.maintenance.entity.ServiceOrder;
import spring.api.maintenance.repository.ServiceOrderRepository;
import spring.api.maintenance.repository.AppointmentRepository;
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
        return serviceOrderRepository.findByAssignedTechnicianId(technicianId);
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
        ServiceOrder serviceOrder = getServiceOrderById(orderId);
        if (serviceOrder != null) {
            serviceOrder.setAssignedTechnicianId(technicianId);
            return serviceOrderRepository.save(serviceOrder);
        }
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
