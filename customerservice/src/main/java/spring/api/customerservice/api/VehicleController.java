package spring.api.customerservice.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.api.dto.VehicleDto;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.domain.Vehicle;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.repository.VehicleRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customer.getCustomerId());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(
            Authentication authentication,
            @PathVariable Long id) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        if (!vehicle.getCustomerId().equals(customer.getCustomerId())) {
            throw new RuntimeException("Bạn không có quyền truy cập xe này");
        }
        
        return ResponseEntity.ok(vehicle);
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(
            Authentication authentication,
            @Valid @RequestBody VehicleDto dto) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setUserId(user.getUserId());
                    newCustomer.setCreatedAt(LocalDateTime.now());
                    newCustomer.setUpdatedAt(LocalDateTime.now());
                    return customerRepository.save(newCustomer);
                });
        
        if (vehicleRepository.findByVin(dto.vin()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "VIN đã tồn tại"));
        }
        
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomerId(customer.getCustomerId());
        vehicle.setVin(dto.vin());
        vehicle.setBrand(dto.brand());
        vehicle.setModel(dto.model());
        vehicle.setYear(dto.year());
        vehicle.setBatteryCapacityKwh(dto.batteryCapacityKwh());
        vehicle.setOdometerKm(dto.odometerKm());
        vehicle.setLastServiceDate(dto.lastServiceDate());
        vehicle.setLastServiceKm(dto.lastServiceKm());
        vehicle.setCreatedAt(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());
        
        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        if (!vehicle.getCustomerId().equals(customer.getCustomerId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật xe này");
        }
        
        if (updates.containsKey("odometerKm")) {
            vehicle.setOdometerKm((Integer) updates.get("odometerKm"));
        }
        if (updates.containsKey("batteryCapacityKwh")) {
            vehicle.setBatteryCapacityKwh(((Number) updates.get("batteryCapacityKwh")).doubleValue());
        }
        
        vehicle.setUpdatedAt(LocalDateTime.now());
        vehicleRepository.save(vehicle);
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(
            Authentication authentication,
            @PathVariable Long id) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        if (!vehicle.getCustomerId().equals(customer.getCustomerId())) {
            throw new RuntimeException("Bạn không có quyền xóa xe này");
        }
        
        vehicleRepository.delete(vehicle);
        return ResponseEntity.ok(Map.of("message", "Xóa xe thành công"));
    }
}

