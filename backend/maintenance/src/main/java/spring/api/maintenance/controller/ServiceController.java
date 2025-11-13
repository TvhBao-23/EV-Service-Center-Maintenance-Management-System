package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.ServiceEntity;
import spring.api.maintenance.service.ServiceService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    /**
     * Lấy danh sách dịch vụ
     */
    @GetMapping
    public ResponseEntity<?> getServiceEntitys(@RequestParam(required = false) String type) {
        try {
            List<ServiceEntity> services;
            if (type != null && !type.isEmpty()) {
                services = serviceService.getServicesByType(type);
            } else {
                services = serviceService.getAllServices();
            }
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving services: " + e.getMessage());
        }
    }

    /**
     * Lấy dịch vụ theo ID
     */
    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getServiceEntityById(@PathVariable Integer serviceId) {
        try {
            Optional<ServiceEntity> service = serviceService.getServiceById(serviceId);
            if (service.isPresent()) {
                return ResponseEntity.ok(service.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("ServiceEntity not found with ID: " + serviceId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving service: " + e.getMessage());
        }
    }

    /**
     * Tạo dịch vụ mới
     */
    @PostMapping
    public ResponseEntity<?> createServiceEntity(@RequestBody ServiceEntity service) {
        try {
            ServiceEntity createdServiceEntity = serviceService.createService(service);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceEntity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating service: " + e.getMessage());
        }
    }

    /**
     * Cập nhật dịch vụ
     */
    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateServiceEntity(@PathVariable Integer serviceId,
            @RequestBody ServiceEntity serviceDetails) {
        try {
            ServiceEntity updatedServiceEntity = serviceService.updateService(serviceId,
                    serviceDetails);
            return ResponseEntity.ok(updatedServiceEntity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating service: " + e.getMessage());
        }
    }

    /**
     * Lấy dịch vụ theo loại
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getServiceEntitysByType(@PathVariable String type) {
        try {
            List<ServiceEntity> services = serviceService.getServicesByType(type);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving services: " + e.getMessage());
        }
    }

    /**
     * Lấy dịch vụ package
     */
    @GetMapping("/packages")
    public ResponseEntity<?> getPackageServiceEntitys() {
        try {
            List<ServiceEntity> services = serviceService.getPackageServices();
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving package services: " + e.getMessage());
        }
    }

    /**
     * Tìm kiếm dịch vụ theo tên
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchServiceEntitys(@RequestParam String name) {
        try {
            List<ServiceEntity> services = serviceService.searchServicesByName(name);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching services: " + e.getMessage());
        }
    }
}
