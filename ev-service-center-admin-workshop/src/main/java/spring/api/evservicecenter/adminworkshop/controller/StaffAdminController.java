package spring.api.evservicecenter.adminworkshop.controller;

import spring.api.evservicecenter.adminworkshop.dto.StaffRequestDTO;
import spring.api.evservicecenter.adminworkshop.dto.StaffResponseDTO;
import spring.api.evservicecenter.adminworkshop.repository.StaffRepository;
import spring.api.evservicecenter.adminworkshop.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staff") // Base path for staff management
public class StaffAdminController {

    @Autowired
    private StaffService staffService;
    // Inject StaffRepository directly or add method to StaffService
    @Autowired
    private StaffRepository staffRepository;

    // Get all staff members
    @GetMapping
    public ResponseEntity<List<StaffResponseDTO>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    // Get a specific staff member by ID
    @GetMapping("/{staffId}")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable Integer staffId) {
        return ResponseEntity.ok(staffService.getStaffById(staffId));
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<StaffResponseDTO>> getActiveTechnicians() {
        // Assuming you added findAllActiveTechnicians to StaffRepository
        return ResponseEntity.ok(staffRepository.findAllActiveTechnicians());
         // Or call a method in StaffService if you prefer:
        // return ResponseEntity.ok(staffService.getActiveTechnicians());
    }


    // Create a new staff member
    @PostMapping
    public ResponseEntity<StaffResponseDTO> createStaff(@Valid @RequestBody StaffRequestDTO dto) {
        StaffResponseDTO createdStaff = staffService.createStaff(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStaff);
    }

    // Update an existing staff member
    @PutMapping("/{staffId}")
    public ResponseEntity<StaffResponseDTO> updateStaff(@PathVariable Integer staffId, @Valid @RequestBody StaffRequestDTO dto) {
        StaffResponseDTO updatedStaff = staffService.updateStaff(staffId, dto);
        return ResponseEntity.ok(updatedStaff);
    }

    // Delete a staff member
    @DeleteMapping("/{staffId}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Integer staffId) {
        staffService.deleteStaff(staffId);
        return ResponseEntity.noContent().build(); // HTTP 204 No Content
    }
}