package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.Vehicle;
import spring.api.maintenance.service.VehicleService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    /**
     * Lấy thông tin xe theo ID
     */
    @GetMapping("/{vehicleId}")
    public ResponseEntity<?> getVehicleById(@PathVariable Integer vehicleId) {
        try {
            Optional<Vehicle> vehicle = vehicleService.getVehicleById(vehicleId);
            if (vehicle.isPresent()) {
                return ResponseEntity.ok(vehicle.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vehicle not found with ID: " + vehicleId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vehicle: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách xe của khách hàng
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getVehiclesByCustomer(@PathVariable Integer customerId) {
        try {
            List<Vehicle> vehicles = vehicleService.getVehiclesByCustomer(customerId);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vehicles: " + e.getMessage());
        }
    }

    /**
     * Lấy xe theo VIN
     */
    @GetMapping("/vin/{vin}")
    public ResponseEntity<?> getVehicleByVin(@PathVariable String vin) {
        try {
            Optional<Vehicle> vehicle = vehicleService.getVehicleByVin(vin);
            if (vehicle.isPresent()) {
                return ResponseEntity.ok(vehicle.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vehicle not found with VIN: " + vin);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vehicle: " + e.getMessage());
        }
    }

    /**
     * Tạo xe mới
     */
    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody Vehicle vehicle) {
        try {
            Vehicle createdVehicle = vehicleService.createVehicle(vehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating vehicle: " + e.getMessage());
        }
    }

    /**
     * Cập nhật thông tin xe
     */
    @PutMapping("/{vehicleId}")
    public ResponseEntity<?> updateVehicle(@PathVariable Integer vehicleId, 
                                        @RequestBody VehicleUpdateRequest request) {
        try {
            VehicleService.VehicleUpdateRequest serviceRequest = new VehicleService.VehicleUpdateRequest();
            serviceRequest.setBrand(request.getBrand());
            serviceRequest.setModel(request.getModel());
            serviceRequest.setYear(request.getYear());
            serviceRequest.setBatteryCapacityKwh(request.getBatteryCapacityKwh());
            serviceRequest.setOdometerKm(request.getOdometerKm());
            
            Vehicle vehicle = vehicleService.updateVehicle(vehicleId, serviceRequest);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating vehicle: " + e.getMessage());
        }
    }

    /**
     * Cập nhật thông tin bảo dưỡng
     */
    @PutMapping("/{vehicleId}/service-info")
    public ResponseEntity<?> updateServiceInfo(@PathVariable Integer vehicleId, 
                                            @RequestBody ServiceInfoUpdateRequest request) {
        try {
            VehicleService.ServiceInfoUpdateRequest serviceRequest = new VehicleService.ServiceInfoUpdateRequest();
            serviceRequest.setLastServiceDate(request.getLastServiceDate());
            serviceRequest.setLastServiceKm(request.getLastServiceKm());
            serviceRequest.setNextServiceDueKm(request.getNextServiceDueKm());
            serviceRequest.setNextServiceDueDate(request.getNextServiceDueDate());
            
            Vehicle vehicle = vehicleService.updateServiceInfo(vehicleId, serviceRequest);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating service info: " + e.getMessage());
        }
    }

    /**
     * Lấy tất cả xe
     */
    @GetMapping
    public ResponseEntity<?> getAllVehicles() {
        try {
            List<Vehicle> vehicles = vehicleService.getAllVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vehicles: " + e.getMessage());
        }
    }

    /**
     * Lấy xe theo hãng
     */
    @GetMapping("/brand/{brand}")
    public ResponseEntity<?> getVehiclesByBrand(@PathVariable String brand) {
        try {
            List<Vehicle> vehicles = vehicleService.getVehiclesByBrand(brand);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vehicles: " + e.getMessage());
        }
    }

    /**
     * Lấy xe cần bảo dưỡng
     */
    @GetMapping("/due-for-service")
    public ResponseEntity<?> getVehiclesDueForService() {
        try {
            List<Vehicle> vehicles = vehicleService.getVehiclesDueForService();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vehicles: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class VehicleUpdateRequest {
        private String brand;
        private String model;
        private Integer year;
        private Double batteryCapacityKwh;
        private Double odometerKm;
        
        public String getBrand() { return brand; }
        public void setBrand(String brand) { this.brand = brand; }
        
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        
        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }
        
        public Double getBatteryCapacityKwh() { return batteryCapacityKwh; }
        public void setBatteryCapacityKwh(Double batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }
        
        public Double getOdometerKm() { return odometerKm; }
        public void setOdometerKm(Double odometerKm) { this.odometerKm = odometerKm; }
    }

    public static class ServiceInfoUpdateRequest {
        private String lastServiceDate;
        private Double lastServiceKm;
        private Double nextServiceDueKm;
        private String nextServiceDueDate;
        
        public String getLastServiceDate() { return lastServiceDate; }
        public void setLastServiceDate(String lastServiceDate) { this.lastServiceDate = lastServiceDate; }
        
        public Double getLastServiceKm() { return lastServiceKm; }
        public void setLastServiceKm(Double lastServiceKm) { this.lastServiceKm = lastServiceKm; }
        
        public Double getNextServiceDueKm() { return nextServiceDueKm; }
        public void setNextServiceDueKm(Double nextServiceDueKm) { this.nextServiceDueKm = nextServiceDueKm; }
        
        public String getNextServiceDueDate() { return nextServiceDueDate; }
        public void setNextServiceDueDate(String nextServiceDueDate) { this.nextServiceDueDate = nextServiceDueDate; }
    }
}