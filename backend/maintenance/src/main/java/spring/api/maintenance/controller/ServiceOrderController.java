package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.ServiceOrder;
import spring.api.maintenance.service.ServiceOrderService;
import spring.api.maintenance.dto.ServiceOrderCompletionRequest;

import java.util.List;

@RestController
@RequestMapping("/api/service-orders")
@CrossOrigin(origins = "*")
public class ServiceOrderController {

    @Autowired
    private ServiceOrderService serviceOrderService;

    /**
     * Tạo phiếu dịch vụ từ lịch hẹn
     */
    @PostMapping("/from-appointment/{appointmentId}")
    public ResponseEntity<?> createServiceOrderFromAppointment(@PathVariable Integer appointmentId) {
        try {
            ServiceOrder serviceOrder = serviceOrderService.createServiceOrderFromAppointment(appointmentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(serviceOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating service order from appointment: " + e.getMessage());
        }
    }

    /**
     * Tạo phiếu dịch vụ trực tiếp
     */
    @PostMapping
    public ResponseEntity<?> createServiceOrder(@RequestBody ServiceOrder serviceOrder) {
        try {
            ServiceOrder createdServiceOrder = serviceOrderService.createServiceOrder(serviceOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating service order: " + e.getMessage());
        }
    }

    /**
     * Lấy phiếu dịch vụ theo ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getServiceOrderById(@PathVariable Integer orderId) {
        try {
            ServiceOrder serviceOrder = serviceOrderService.getServiceOrderById(orderId);
            if (serviceOrder != null) {
                return ResponseEntity.ok(serviceOrder);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Service order not found with ID: " + orderId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service order: " + e.getMessage());
        }
    }

    /**
     * Lấy phiếu dịch vụ theo trạng thái
     */
    @GetMapping
    public ResponseEntity<?> getServiceOrdersByStatus(@RequestParam(required = false) String status) {
        try {
            List<ServiceOrder> serviceOrders;
            if (status != null && !status.isEmpty()) {
                serviceOrders = serviceOrderService.getServiceOrdersByStatus(status);
            } else {
                serviceOrders = serviceOrderService.getAllServiceOrders();
            }
            return ResponseEntity.ok(serviceOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service orders: " + e.getMessage());
        }
    }

    /**
     * Cập nhật trạng thái phiếu dịch vụ
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateServiceOrderStatus(@PathVariable Integer orderId,
            @RequestBody ServiceOrderStatusUpdateRequest request) {
        try {
            ServiceOrder serviceOrder = serviceOrderService.updateServiceOrderStatus(orderId, request.getStatus());
            return ResponseEntity.ok(serviceOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating service order status: " + e.getMessage());
        }
    }

    /**
     * Phân công kỹ thuật viên
     */
    @PutMapping("/{orderId}/assign-technician")
    public ResponseEntity<?> assignTechnician(@PathVariable Integer orderId,
            @RequestBody TechnicianAssignmentRequest request) {
        try {
            ServiceOrder serviceOrder = serviceOrderService.assignTechnician(orderId, request.getTechnicianId());
            return ResponseEntity.ok(serviceOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error assigning technician: " + e.getMessage());
        }
    }

    /**
     * Hoàn thành phiếu dịch vụ
     */
    @PutMapping("/{orderId}/complete")
    public ResponseEntity<?> completeServiceOrder(@PathVariable Integer orderId,
            @RequestBody ServiceOrderCompletionRequest request) {
        try {
            ServiceOrder serviceOrder = serviceOrderService.completeServiceOrder(orderId, request);
            return ResponseEntity.ok(serviceOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error completing service order: " + e.getMessage());
        }
    }

    /**
     * Cập nhật tổng tiền phiếu dịch vụ
     */
    @PutMapping("/{orderId}/amount")
    public ResponseEntity<?> updateServiceOrderAmount(@PathVariable Integer orderId,
            @RequestBody AmountUpdateRequest request) {
        try {
            ServiceOrder serviceOrder = serviceOrderService.updateServiceOrderAmount(orderId, request.getTotalAmount());
            return ResponseEntity.ok(serviceOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating service order amount: " + e.getMessage());
        }
    }

    /**
     * Lấy phiếu dịch vụ của kỹ thuật viên
     */
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<?> getServiceOrdersByTechnician(@PathVariable Integer technicianId) {
        try {
            List<ServiceOrder> serviceOrders = serviceOrderService.getServiceOrdersByTechnician(technicianId);
            return ResponseEntity.ok(serviceOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service orders: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class ServiceOrderStatusUpdateRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class TechnicianAssignmentRequest {
        private Integer technicianId;

        public Integer getTechnicianId() {
            return technicianId;
        }

        public void setTechnicianId(Integer technicianId) {
            this.technicianId = technicianId;
        }
    }

    public static class AmountUpdateRequest {
        private Double totalAmount;

        public Double getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(Double totalAmount) {
            this.totalAmount = totalAmount;
        }
    }
}