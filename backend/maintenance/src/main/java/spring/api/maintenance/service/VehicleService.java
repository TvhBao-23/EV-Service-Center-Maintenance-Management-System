package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.Vehicle;
import spring.api.maintenance.repository.VehicleRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public Optional<Vehicle> getVehicleById(Integer vehicleId) {
        return vehicleRepository.findById(vehicleId);
    }

    public List<Vehicle> getVehiclesByCustomer(Integer customerId) {
        return vehicleRepository.findByCustomerId(customerId);
    }

    public Optional<Vehicle> getVehicleByVin(String vin) {
        return vehicleRepository.findByVin(vin);
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Integer vehicleId, VehicleUpdateRequest request) {
        Optional<Vehicle> optionalVehicle = vehicleRepository.findById(vehicleId);
        if (optionalVehicle.isPresent()) {
            Vehicle vehicle = optionalVehicle.get();
            if (request.getBrand() != null)
                vehicle.setBrand(request.getBrand());
            if (request.getModel() != null)
                vehicle.setModel(request.getModel());
            if (request.getYear() != null)
                vehicle.setYear(request.getYear());
            if (request.getBatteryCapacityKwh() != null)
                vehicle.setBatteryCapacityKwh(java.math.BigDecimal.valueOf(request.getBatteryCapacityKwh()));
            if (request.getOdometerKm() != null)
                vehicle.setOdometerKm(java.math.BigDecimal.valueOf(request.getOdometerKm()));
            return vehicleRepository.save(vehicle);
        }
        throw new RuntimeException("Vehicle not found with ID: " + vehicleId);
    }

    public Vehicle updateServiceInfo(Integer vehicleId, ServiceInfoUpdateRequest request) {
        Optional<Vehicle> optionalVehicle = vehicleRepository.findById(vehicleId);
        if (optionalVehicle.isPresent()) {
            Vehicle vehicle = optionalVehicle.get();
            if (request.getLastServiceDate() != null)
                vehicle.setLastServiceDate(java.time.LocalDateTime.parse(request.getLastServiceDate()));
            if (request.getLastServiceKm() != null)
                vehicle.setLastServiceKm(java.math.BigDecimal.valueOf(request.getLastServiceKm()));
            if (request.getNextServiceDueKm() != null)
                vehicle.setNextServiceDueKm(java.math.BigDecimal.valueOf(request.getNextServiceDueKm()));
            if (request.getNextServiceDueDate() != null)
                vehicle.setNextServiceDueDate(java.time.LocalDateTime.parse(request.getNextServiceDueDate()));
            return vehicleRepository.save(vehicle);
        }
        throw new RuntimeException("Vehicle not found with ID: " + vehicleId);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getVehiclesByBrand(String brand) {
        return vehicleRepository.findByBrand(brand);
    }

    public List<Vehicle> getVehiclesDueForService() {
        LocalDate today = LocalDate.now();
        return vehicleRepository.findByNextServiceDueDateLessThanEqual(today);
    }

    // Inner classes for request bodies
    public static class VehicleUpdateRequest {
        private String brand;
        private String model;
        private Integer year;
        private Double batteryCapacityKwh;
        private Double odometerKm;

        public String getBrand() {
            return brand;
        }

        public void setBrand(String brand) {
            this.brand = brand;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Integer getYear() {
            return year;
        }

        public void setYear(Integer year) {
            this.year = year;
        }

        public Double getBatteryCapacityKwh() {
            return batteryCapacityKwh;
        }

        public void setBatteryCapacityKwh(Double batteryCapacityKwh) {
            this.batteryCapacityKwh = batteryCapacityKwh;
        }

        public Double getOdometerKm() {
            return odometerKm;
        }

        public void setOdometerKm(Double odometerKm) {
            this.odometerKm = odometerKm;
        }
    }

    public static class ServiceInfoUpdateRequest {
        private String lastServiceDate;
        private Double lastServiceKm;
        private Double nextServiceDueKm;
        private String nextServiceDueDate;

        public String getLastServiceDate() {
            return lastServiceDate;
        }

        public void setLastServiceDate(String lastServiceDate) {
            this.lastServiceDate = lastServiceDate;
        }

        public Double getLastServiceKm() {
            return lastServiceKm;
        }

        public void setLastServiceKm(Double lastServiceKm) {
            this.lastServiceKm = lastServiceKm;
        }

        public Double getNextServiceDueKm() {
            return nextServiceDueKm;
        }

        public void setNextServiceDueKm(Double nextServiceDueKm) {
            this.nextServiceDueKm = nextServiceDueKm;
        }

        public String getNextServiceDueDate() {
            return nextServiceDueDate;
        }

        public void setNextServiceDueDate(String nextServiceDueDate) {
            this.nextServiceDueDate = nextServiceDueDate;
        }
    }
}