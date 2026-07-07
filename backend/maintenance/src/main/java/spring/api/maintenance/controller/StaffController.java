package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import spring.api.maintenance.entity.Staff;
import spring.api.maintenance.repository.StaffRepository;

import java.util.List;
import java.util.Map;

/**
 * Expose staff records stored in Maintenance Service (table staffs).
 * This helps frontend map user_id (account) to staff_id (maintenance DB).
 */
@RestController
@RequestMapping("/staffs")
// CORS is handled by API Gateway
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;

    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaffs() {
        List<Staff> staff = staffRepository.findAll();
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getStaffByUserId(@PathVariable Long userId) {
        return staffRepository.findByUserId(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "error", "Staff record not found for userId: " + userId)));
    }
}

