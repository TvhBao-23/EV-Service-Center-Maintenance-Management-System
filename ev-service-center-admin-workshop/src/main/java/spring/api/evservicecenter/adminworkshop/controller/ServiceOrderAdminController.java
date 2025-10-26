package spring.api.evservicecenter.adminworkshop.controller;

import spring.api.evservicecenter.adminworkshop.dto.AssignTechnicianRequestDTO;
import spring.api.evservicecenter.adminworkshop.dto.ServiceOrderAdminDTO;
import spring.api.evservicecenter.adminworkshop.dto.UpdateServiceOrderStatusRequestDTO;
import spring.api.evservicecenter.adminworkshop.entity.ServiceOrder;
import spring.api.evservicecenter.adminworkshop.service.ServiceOrderAdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/service-orders")
public class ServiceOrderAdminController {

    @Autowired
    private ServiceOrderAdminService serviceOrderAdminService;

    @GetMapping
    public ResponseEntity<List<ServiceOrderAdminDTO>> getAllServiceOrders() {
        return ResponseEntity.ok(serviceOrderAdminService.getAllServiceOrdersAdmin());
    }

    @PutMapping("/{orderId}/assign-technician")
    public ResponseEntity<ServiceOrder> assignTechnician(
            @PathVariable Integer orderId,
            @Valid @RequestBody AssignTechnicianRequestDTO dto) {
        return ResponseEntity.ok(serviceOrderAdminService.assignTechnician(orderId, dto));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ServiceOrder> updateStatus(
            @PathVariable Integer orderId,
            @Valid @RequestBody UpdateServiceOrderStatusRequestDTO dto) {
        return ResponseEntity.ok(serviceOrderAdminService.updateServiceOrderStatus(orderId, dto));
    }

     @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteServiceOrder(@PathVariable Integer orderId) {
        serviceOrderAdminService.deleteServiceOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}