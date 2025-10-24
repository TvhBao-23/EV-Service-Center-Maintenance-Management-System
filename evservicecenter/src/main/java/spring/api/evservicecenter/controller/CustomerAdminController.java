package spring.api.evservicecenter.controller;

import spring.api.evservicecenter.dto.CustomerDetailDTO;
import spring.api.evservicecenter.dto.CustomerRequestDTO;
import spring.api.evservicecenter.dto.CustomerResponseDTO;
import spring.api.evservicecenter.dto.VehicleRequestDTO;
import spring.api.evservicecenter.entity.Customer;
import spring.api.evservicecenter.entity.Vehicle;
import spring.api.evservicecenter.service.CustomerVehicleService;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/customers") // Base path cho quản lý khách hàng
public class CustomerAdminController {

    @Autowired
    private CustomerVehicleService customerVehicleService;

    // Lấy danh sách tóm tắt tất cả khách hàng
    @GetMapping
    public ResponseEntity<List<CustomerResponseDTO>> getAllCustomers() {
        return ResponseEntity.ok(customerVehicleService.getAllCustomers());
    }

    // Tạo khách hàng mới
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerRequestDTO dto) {
        return ResponseEntity.status(201).body(customerVehicleService.createCustomer(dto));
    }

    // Lấy chi tiết một khách hàng (gồm danh sách xe)
    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerDetailDTO> getCustomerDetails(@PathVariable Integer customerId) {
        return ResponseEntity.ok(customerVehicleService.getCustomerDetails(customerId));
    }

    // Cập nhật khách hàng
    @PutMapping("/{customerId}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Integer customerId, @RequestBody CustomerRequestDTO dto) {
        return ResponseEntity.ok(customerVehicleService.updateCustomer(customerId, dto));
    }

    // Xóa khách hàng (và user, xe liên quan)
    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer customerId) {
        customerVehicleService.deleteCustomer(customerId);
        return ResponseEntity.noContent().build();
    }

    // --- Quản lý xe của khách hàng ---

    // Tạo xe mới cho một khách hàng
    @PostMapping("/{customerId}/vehicles")
    public ResponseEntity<Vehicle> createVehicle(
            @PathVariable Integer customerId, 
            @RequestBody VehicleRequestDTO dto) {
        return ResponseEntity.status(201).body(customerVehicleService.createVehicle(customerId, dto));
    }

    // Cập nhật một chiếc xe
    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Integer vehicleId, 
            @RequestBody VehicleRequestDTO dto) {
        return ResponseEntity.ok(customerVehicleService.updateVehicle(vehicleId, dto));
    }

    // Xóa một chiếc xe
    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer vehicleId) {
        customerVehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }
}