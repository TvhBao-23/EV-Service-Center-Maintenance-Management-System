package spring.api.evservicecenter.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.evservicecenter.dto.VehicleRequestDto;
import spring.api.evservicecenter.model.Vehicle;
import spring.api.evservicecenter.service.VehicleAdminService;

@RestController
@RequestMapping("/api/admin/vehicles") // Endpoint riêng cho xe
public class VehicleAdminController {

    @Autowired
    private VehicleAdminService vehicleAdminService;

    // THÊM (CREATE)
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody VehicleRequestDto requestDto) {
        Vehicle newVehicle = vehicleAdminService.createVehicle(requestDto);
        return new ResponseEntity<>(newVehicle, HttpStatus.CREATED);
    }

    // SỬA (UPDATE)
    @PutMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long vehicleId, @RequestBody VehicleRequestDto requestDto) {
        Vehicle updatedVehicle = vehicleAdminService.updateVehicle(vehicleId, requestDto);
        return ResponseEntity.ok(updatedVehicle);
    }

    // XÓA (DELETE)
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long vehicleId) {
        vehicleAdminService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }
    
    // Bạn cũng có thể thêm GET (lấy 1 xe) hoặc GET (lấy tất cả xe) ở đây
}