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
@RequestMapping("/api/customers/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles(Authentication authentication) {
        // Get current user from JWT token
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        User user = (User) authentication.getPrincipal();
        Long userId = user.getUserId();
        
        // Find customer by userId
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found for user: " + userId));
        
        // Return only vehicles owned by this customer
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customer.getCustomerId());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        return ResponseEntity.ok(vehicle);
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(@Valid @RequestBody VehicleDto dto, Authentication authentication) {
        // Get current user from JWT token
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        User user = (User) authentication.getPrincipal();
        Long userId = user.getUserId();
        
        // Find or create customer for this user
        Customer customer = customerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setUserId(userId);
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
            @PathVariable Long id,
            @Valid @RequestBody VehicleDto dto) {
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        // Update all fields from DTO
        vehicle.setBrand(dto.brand());
        vehicle.setModel(dto.model());
        vehicle.setVin(dto.vin());
        vehicle.setYear(dto.year());
        vehicle.setBatteryCapacityKwh(dto.batteryCapacityKwh());
        vehicle.setOdometerKm(dto.odometerKm());
        vehicle.setLastServiceDate(dto.lastServiceDate());
        vehicle.setLastServiceKm(dto.lastServiceKm());
        vehicle.setUpdatedAt(LocalDateTime.now());
        
        Vehicle saved = vehicleRepository.save(vehicle);
        
        return ResponseEntity.ok(saved);
    }

    // PATCH endpoint for partial updates (e.g., odometer only)
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchVehicle(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        // Update only provided fields
        if (updates.containsKey("odometerKm")) {
            Object kmValue = updates.get("odometerKm");
            if (kmValue instanceof Number) {
                vehicle.setOdometerKm(((Number) kmValue).intValue());
            }
        }
        
        if (updates.containsKey("lastServiceKm")) {
            Object kmValue = updates.get("lastServiceKm");
            if (kmValue instanceof Number) {
                vehicle.setLastServiceKm(((Number) kmValue).intValue());
            }
        }
        
        if (updates.containsKey("lastServiceDate")) {
            // Handle date if needed
        }
        
        vehicle.setUpdatedAt(LocalDateTime.now());
        Vehicle saved = vehicleRepository.save(vehicle);
        
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        vehicleRepository.delete(vehicle);
        return ResponseEntity.ok(Map.of("message", "Xóa xe thành công"));
    }
}

