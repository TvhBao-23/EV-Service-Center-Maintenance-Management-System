package spring.api.staffservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.staffservice.domain.*;
import spring.api.staffservice.repository.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
// CORS is handled by API Gateway
public class StaffController {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final ServiceReceiptRepository serviceReceiptRepository;
    private final ChecklistRepository checklistRepository;
    private final MaintenanceReportRepository maintenanceReportRepository;
    private final spring.api.staffservice.service.MessageService messageService;

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAllByOrderByAppointmentDateDesc();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        String newStatus = body.get("status");
        if (newStatus != null) {
            appointment.setStatus(newStatus);
            appointmentRepository.save(appointment);
        }

        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công", "appointment", appointment));
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        if (updates.containsKey("notes")) {
            appointment.setNotes((String) updates.get("notes"));
        }

        appointmentRepository.save(appointment);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }

    // =====================================================
    // CUSTOMER & VEHICLE MANAGEMENT
    // =====================================================

    @GetMapping("/customers")
    public ResponseEntity<List<Map<String, Object>>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        List<Map<String, Object>> result = customers.stream().map(customer -> {
            Map<String, Object> data = new HashMap<>();
            data.put("customer_id", customer.getCustomerId());
            data.put("user_id", customer.getUserId());
            data.put("address", customer.getAddress());
            data.put("created_at", customer.getCreatedAt());

            // Get user info
            userRepository.findById(customer.getUserId()).ifPresent(user -> {
                data.put("email", user.getEmail());
                data.put("full_name", user.getFullName());
                data.put("phone", user.getPhone());
            });

            // Count vehicles
            long vehicleCount = vehicleRepository.findByCustomerId(customer.getCustomerId()).size();
            data.put("vehicle_count", vehicleCount);

            return data;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<Map<String, Object>> getCustomerDetail(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Map<String, Object> data = new HashMap<>();
        data.put("customer_id", customer.getCustomerId());
        data.put("user_id", customer.getUserId());
        data.put("address", customer.getAddress());
        data.put("created_at", customer.getCreatedAt());

        // Get user info
        userRepository.findById(customer.getUserId()).ifPresent(user -> {
            data.put("email", user.getEmail());
            data.put("full_name", user.getFullName());
            data.put("phone", user.getPhone());
        });

        // Get vehicles
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customer.getCustomerId());
        data.put("vehicles", vehicles);

        // Get appointments
        List<Appointment> appointments = appointmentRepository.findByCustomerId(customer.getCustomerId());
        data.put("appointments", appointments);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Map<String, Object>>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Map<String, Object>> result = vehicles.stream().map(vehicle -> {
            Map<String, Object> data = new HashMap<>();
            data.put("vehicle_id", vehicle.getVehicleId());
            data.put("customer_id", vehicle.getCustomerId());
            data.put("vin", vehicle.getVin());
            data.put("brand", vehicle.getBrand());
            data.put("model", vehicle.getModel());
            data.put("year", vehicle.getYear());
            data.put("battery_capacity_kwh", vehicle.getBatteryCapacityKwh());
            data.put("odometer_km", vehicle.getOdometerKm());
            data.put("last_service_date", vehicle.getLastServiceDate());
            data.put("last_service_km", vehicle.getLastServiceKm());

            // Get customer info
            customerRepository.findById(vehicle.getCustomerId()).ifPresent(customer -> {
                userRepository.findById(customer.getUserId()).ifPresent(user -> {
                    data.put("customer_name", user.getFullName());
                    data.put("customer_phone", user.getPhone());
                });
            });

            return data;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<Map<String, Object>> getVehicleDetail(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        Map<String, Object> data = new HashMap<>();
        data.put("vehicle_id", vehicle.getVehicleId());
        data.put("customer_id", vehicle.getCustomerId());
        data.put("vin", vehicle.getVin());
        data.put("brand", vehicle.getBrand());
        data.put("model", vehicle.getModel());
        data.put("year", vehicle.getYear());
        data.put("battery_capacity_kwh", vehicle.getBatteryCapacityKwh());
        data.put("odometer_km", vehicle.getOdometerKm());
        data.put("last_service_date", vehicle.getLastServiceDate());
        data.put("last_service_km", vehicle.getLastServiceKm());
        data.put("created_at", vehicle.getCreatedAt());

        // Get customer info
        customerRepository.findById(vehicle.getCustomerId()).ifPresent(customer -> {
            data.put("customer", customer);
            userRepository.findById(customer.getUserId()).ifPresent(user -> {
                data.put("customer_name", user.getFullName());
                data.put("customer_phone", user.getPhone());
                data.put("customer_email", user.getEmail());
            });
        });

        // Get service history
        List<Checklist> checklists = checklistRepository.findByVehicleId(id);
        data.put("checklists", checklists);

        List<MaintenanceReport> reports = maintenanceReportRepository.findByVehicleId(id);
        data.put("maintenance_history", reports);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/vehicles/{id}/history")
    public ResponseEntity<Map<String, Object>> getVehicleHistory(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        Map<String, Object> history = new HashMap<>();
        history.put("vehicle", vehicle);
        history.put("checklists", checklistRepository.findByVehicleId(id));
        history.put("maintenance_reports", maintenanceReportRepository.findByVehicleId(id));
        history.put("service_receipts", serviceReceiptRepository.findByVehicleId(id));

        return ResponseEntity.ok(history);
    }

    // =====================================================
    // ASSIGNMENT SYSTEM
    // =====================================================

    @GetMapping("/technicians")
    public ResponseEntity<List<Map<String, Object>>> getAllTechnicians() {
        List<User> technicians = userRepository.findByRole(UserRole.technician);
        List<Map<String, Object>> result = technicians.stream().map(tech -> {
            Map<String, Object> data = new HashMap<>();
            data.put("user_id", tech.getUserId());
            data.put("full_name", tech.getFullName());
            data.put("email", tech.getEmail());
            data.put("phone", tech.getPhone());

            // Count active assignments
            long activeCount = assignmentRepository.findByTechnicianIdAndStatus(
                    tech.getUserId(), "in_progress").size();
            data.put("active_assignments", activeCount);

            return data;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // Count staff (role = staff)
    @GetMapping("/staff-count")
    public ResponseEntity<Map<String, Integer>> getStaffCount() {
        int count = userRepository.findByRole(UserRole.staff).size();
        return ResponseEntity.ok(Map.of("count", count));
    }

    // List staff members (role = staff) with basic info
    @GetMapping("/staff-members")
    public ResponseEntity<List<Map<String, Object>>> getStaffMembers() {
        List<User> staff = userRepository.findByRole(UserRole.staff);
        List<Map<String, Object>> result = staff.stream().map(s -> {
            Map<String, Object> data = new HashMap<>();
            data.put("user_id", s.getUserId());
            data.put("full_name", s.getFullName());
            data.put("email", s.getEmail());
            data.put("phone", s.getPhone());
            return data;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // Create new user (staff or technician)
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        try {
            String email = body.get("email") != null ? body.get("email").toString() : null;
            String password = body.get("password") != null ? body.get("password").toString() : null;
            String fullName = body.get("fullName") != null ? body.get("fullName").toString() : 
                             (body.get("full_name") != null ? body.get("full_name").toString() : null);
            String phone = body.get("phone") != null ? body.get("phone").toString() : null;
            String roleStr = body.get("role") != null ? body.get("role").toString() : null;

            // Validate required fields
            if (email == null || password == null || fullName == null || roleStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vui lòng điền đầy đủ thông tin: email, password, fullName, role"));
            }

            // Parse role
            UserRole role;
            try {
                role = UserRole.valueOf(roleStr.toLowerCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vai trò không hợp lệ. Chỉ chấp nhận: staff, technician"));
            }

            // Only allow staff and technician
            if (role != UserRole.staff && role != UserRole.technician) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Chỉ được tạo tài khoản Nhân viên (staff) hoặc Kỹ thuật viên (technician)"));
            }

            // Check if email already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email đã được sử dụng"));
            }

            // Encode password
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder = 
                    new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            String encodedPassword = passwordEncoder.encode(password);

            // Create new user
            User user = new User();
            user.setEmail(email);
            user.setPassword(encodedPassword);
            user.setFullName(fullName);
            user.setPhone(phone);
            user.setRole(role);
            user.setCreatedAt(java.time.LocalDateTime.now());
            user.setUpdatedAt(java.time.LocalDateTime.now());

            User savedUser = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tạo tài khoản thành công");
            response.put("user", Map.of(
                "user_id", savedUser.getUserId(),
                "email", savedUser.getEmail(),
                "full_name", savedUser.getFullName(),
                "phone", savedUser.getPhone() != null ? savedUser.getPhone() : "",
                "role", savedUser.getRole().name()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    // Update basic user info (full name, email, phone, role)
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User u = opt.get();
        if (body.containsKey("fullName") || body.containsKey("full_name")) {
            u.setFullName(String.valueOf(body.getOrDefault("fullName", body.get("full_name"))));
        }
        if (body.containsKey("email")) {
            u.setEmail(String.valueOf(body.get("email")));
        }
        if (body.containsKey("phone")) {
            u.setPhone(String.valueOf(body.get("phone")));
        }
        if (body.containsKey("role")) {
            try {
                String roleStr = String.valueOf(body.get("role"));
                u.setRole(UserRole.valueOf(roleStr));
            } catch (Exception ignored) {
            }
        }
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "Updated", "user_id", u.getUserId()));
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted", "user_id", id));
    }

    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Long appointmentId = Long.valueOf(request.get("appointment_id").toString());
        Long technicianId = Long.valueOf(request.get("technician_id").toString());

        // Check if appointment exists
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        // Check if technician exists
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỹ thuật viên"));

        if (!technician.getRole().equals(UserRole.technician)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User không phải kỹ thuật viên"));
        }

        // Check if already assigned
        if (assignmentRepository.findByAppointmentId(appointmentId).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lịch hẹn đã được phân công"));
        }

        // Get current staff user
        User currentUser = (User) authentication.getPrincipal();

        Assignment assignment = new Assignment();
        assignment.setAppointmentId(appointmentId);
        assignment.setTechnicianId(technicianId);
        assignment.setAssignedBy(currentUser.getUserId());
        assignment.setStatus("assigned");
        if (request.containsKey("notes")) {
            assignment.setNotes((String) request.get("notes"));
        }

        Assignment saved = assignmentRepository.save(assignment);

        // Update appointment status
        appointment.setStatus("confirmed");
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(Map.of(
                "message", "Phân công thành công",
                "assignment", saved));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAllAssignments() {
        List<Assignment> assignments = assignmentRepository.findAllByOrderByAssignedAtDesc();
        List<Map<String, Object>> result = assignments.stream().map(assignment -> {
            Map<String, Object> data = new HashMap<>();
            data.put("assignment_id", assignment.getAssignmentId());
            data.put("appointment_id", assignment.getAppointmentId());
            data.put("technician_id", assignment.getTechnicianId());
            data.put("assigned_by", assignment.getAssignedBy());
            data.put("status", assignment.getStatus());
            data.put("assigned_at", assignment.getAssignedAt());
            data.put("started_at", assignment.getStartedAt());
            data.put("completed_at", assignment.getCompletedAt());
            data.put("notes", assignment.getNotes());

            // Get technician info
            userRepository.findById(assignment.getTechnicianId()).ifPresent(tech -> {
                data.put("technician_name", tech.getFullName());
            });

            // Get appointment info
            appointmentRepository.findById(assignment.getAppointmentId()).ifPresent(apt -> {
                data.put("appointment", apt);
            });

            return data;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<Map<String, Object>> getAssignment(@PathVariable Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân công"));

        Map<String, Object> data = new HashMap<>();
        data.put("assignment", assignment);

        appointmentRepository.findById(assignment.getAppointmentId()).ifPresent(apt -> {
            data.put("appointment", apt);
        });

        userRepository.findById(assignment.getTechnicianId()).ifPresent(tech -> {
            data.put("technician", tech);
        });

        return ResponseEntity.ok(data);
    }

    @PutMapping("/assignments/{id}/status")
    public ResponseEntity<?> updateAssignmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân công"));

        String newStatus = body.get("status");
        if (newStatus != null) {
            assignment.setStatus(newStatus);

            if ("in_progress".equals(newStatus) && assignment.getStartedAt() == null) {
                assignment.setStartedAt(LocalDateTime.now());
            }

            if ("completed".equals(newStatus) && assignment.getCompletedAt() == null) {
                assignment.setCompletedAt(LocalDateTime.now());

                // Update appointment status
                appointmentRepository.findById(assignment.getAppointmentId()).ifPresent(apt -> {
                    apt.setStatus("completed");
                    appointmentRepository.save(apt);
                });
            }

            assignmentRepository.save(assignment);
        }

        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }

    // =====================================================
    // SERVICE RECEIPTS
    // =====================================================

    @PostMapping("/service-receipts")
    public ResponseEntity<?> createServiceReceipt(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Long appointmentId = Long.valueOf(request.get("appointment_id").toString());
        Long vehicleId = Long.valueOf(request.get("vehicle_id").toString());

        // Check if receipt already exists
        if (serviceReceiptRepository.findByAppointmentId(appointmentId).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phiếu tiếp nhận đã tồn tại"));
        }

        User currentUser = (User) authentication.getPrincipal();

        ServiceReceipt receipt = new ServiceReceipt();
        receipt.setAppointmentId(appointmentId);
        receipt.setVehicleId(vehicleId);
        receipt.setReceivedBy(currentUser.getUserId());
        receipt.setOdometerReading(Integer.valueOf(request.get("odometer_reading").toString()));

        if (request.containsKey("fuel_level")) {
            receipt.setFuelLevel((String) request.get("fuel_level"));
        }
        if (request.containsKey("exterior_condition")) {
            receipt.setExteriorCondition((String) request.get("exterior_condition"));
        }
        if (request.containsKey("interior_condition")) {
            receipt.setInteriorCondition((String) request.get("interior_condition"));
        }
        if (request.containsKey("customer_complaints")) {
            receipt.setCustomerComplaints((String) request.get("customer_complaints"));
        }
        if (request.containsKey("estimated_completion")) {
            receipt.setEstimatedCompletion(LocalDateTime.parse((String) request.get("estimated_completion")));
        }

        ServiceReceipt saved = serviceReceiptRepository.save(receipt);
        return ResponseEntity.ok(Map.of("message", "Tạo phiếu tiếp nhận thành công", "receipt", saved));
    }

    @GetMapping("/service-receipts")
    public ResponseEntity<List<ServiceReceipt>> getAllServiceReceipts() {
        return ResponseEntity.ok(serviceReceiptRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/service-receipts/{id}")
    public ResponseEntity<ServiceReceipt> getServiceReceipt(@PathVariable Long id) {
        ServiceReceipt receipt = serviceReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu tiếp nhận"));
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/service-receipts/appointment/{appointmentId}")
    public ResponseEntity<?> getServiceReceiptByAppointment(@PathVariable Long appointmentId) {
        ServiceReceipt receipt = serviceReceiptRepository.findByAppointmentId(appointmentId)
                .orElse(null);
        if (receipt == null) {
            return ResponseEntity.ok(Map.of("message", "Chưa có phiếu tiếp nhận"));
        }
        return ResponseEntity.ok(receipt);
    }

    // =====================================================
    // CHECKLISTS
    // =====================================================

    @PostMapping("/checklists")
    public ResponseEntity<?> createChecklist(
            @RequestBody Checklist checklist,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        checklist.setTechnicianId(currentUser.getUserId());

        Checklist saved = checklistRepository.save(checklist);
        return ResponseEntity.ok(Map.of("message", "Lưu checklist thành công", "checklist", saved));
    }

    @GetMapping("/checklists")
    public ResponseEntity<List<Checklist>> getAllChecklists() {
        return ResponseEntity.ok(checklistRepository.findAllByOrderByCheckedAtDesc());
    }

    @GetMapping("/checklists/{id}")
    public ResponseEntity<Checklist> getChecklist(@PathVariable Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy checklist"));
        return ResponseEntity.ok(checklist);
    }

    @GetMapping("/checklists/assignment/{assignmentId}")
    public ResponseEntity<?> getChecklistByAssignment(@PathVariable Long assignmentId) {
        Checklist checklist = checklistRepository.findByAssignmentId(assignmentId)
                .orElse(null);
        if (checklist == null) {
            return ResponseEntity.ok(Map.of("message", "Chưa có checklist"));
        }
        return ResponseEntity.ok(checklist);
    }

    @PutMapping("/checklists/{id}")
    public ResponseEntity<?> updateChecklist(
            @PathVariable Long id,
            @RequestBody Checklist updates) {

        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy checklist"));

        // Update fields
        if (updates.getBatteryHealth() != null)
            checklist.setBatteryHealth(updates.getBatteryHealth());
        if (updates.getBatteryVoltage() != null)
            checklist.setBatteryVoltage(updates.getBatteryVoltage());
        if (updates.getBatteryTemperature() != null)
            checklist.setBatteryTemperature(updates.getBatteryTemperature());
        if (updates.getBrakeSystem() != null)
            checklist.setBrakeSystem(updates.getBrakeSystem());
        if (updates.getTireCondition() != null)
            checklist.setTireCondition(updates.getTireCondition());
        if (updates.getTirePressure() != null)
            checklist.setTirePressure(updates.getTirePressure());
        if (updates.getLightsStatus() != null)
            checklist.setLightsStatus(updates.getLightsStatus());
        if (updates.getCoolingSystem() != null)
            checklist.setCoolingSystem(updates.getCoolingSystem());
        if (updates.getMotorCondition() != null)
            checklist.setMotorCondition(updates.getMotorCondition());
        if (updates.getChargingPort() != null)
            checklist.setChargingPort(updates.getChargingPort());
        if (updates.getSoftwareVersion() != null)
            checklist.setSoftwareVersion(updates.getSoftwareVersion());
        if (updates.getOverallStatus() != null)
            checklist.setOverallStatus(updates.getOverallStatus());
        if (updates.getNotes() != null)
            checklist.setNotes(updates.getNotes());

        Checklist saved = checklistRepository.save(checklist);
        return ResponseEntity.ok(Map.of("message", "Cập nhật checklist thành công", "checklist", saved));
    }

    // =====================================================
    // MAINTENANCE REPORTS
    // =====================================================

    @PostMapping("/maintenance-reports")
    public ResponseEntity<?> createMaintenanceReport(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            User currentUser = (User) authentication.getPrincipal();
            Long technicianId = currentUser.getUserId();

            // Validate required fields
            if (!request.containsKey("vehicleId") && !request.containsKey("vehicle_id")) {
                return ResponseEntity.badRequest().body(Map.of("error", "vehicleId is required"));
            }

            if (!request.containsKey("workPerformed") && !request.containsKey("work_performed")) {
                return ResponseEntity.badRequest().body(Map.of("error", "workPerformed is required"));
            }

            // Get vehicleId
            Long vehicleId = request.containsKey("vehicleId")
                    ? Long.valueOf(request.get("vehicleId").toString())
                    : Long.valueOf(request.get("vehicle_id").toString());

            // Get assignmentId - either provided directly or we need to create/find it
            Long assignmentId = null;

            if (request.containsKey("assignmentId") || request.containsKey("assignment_id")) {
                // Use provided assignmentId
                assignmentId = request.containsKey("assignmentId")
                        ? Long.valueOf(request.get("assignmentId").toString())
                        : Long.valueOf(request.get("assignment_id").toString());
            } else if (request.containsKey("appointmentId") || request.containsKey("appointment_id")) {
                // If appointmentId is provided, find or create assignment
                Long appointmentId = request.containsKey("appointmentId")
                        ? Long.valueOf(request.get("appointmentId").toString())
                        : Long.valueOf(request.get("appointment_id").toString());

                // Check if assignment exists for this appointment
                Optional<Assignment> existingAssignment = assignmentRepository.findByAppointmentId(appointmentId);

                if (existingAssignment.isPresent()) {
                    assignmentId = existingAssignment.get().getAssignmentId();
                } else {
                    // Create new assignment automatically
                    Appointment appointment = appointmentRepository.findById(appointmentId)
                            .orElseThrow(
                                    () -> new RuntimeException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

                    Assignment newAssignment = new Assignment();
                    newAssignment.setAppointmentId(appointmentId);
                    newAssignment.setTechnicianId(technicianId);
                    newAssignment.setAssignedBy(technicianId); // Technician assigns to themselves
                    newAssignment.setStatus("in_progress"); // Already in progress since creating report
                    newAssignment.setStartedAt(LocalDateTime.now());

                    Assignment savedAssignment = assignmentRepository.save(newAssignment);
                    assignmentId = savedAssignment.getAssignmentId();
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "error",
                        "Either assignmentId or appointmentId is required"));
            }

            // Create maintenance report
            MaintenanceReport report = new MaintenanceReport();
            report.setAssignmentId(assignmentId);
            report.setVehicleId(vehicleId);
            report.setTechnicianId(technicianId);
            report.setStatus("submitted"); // Set to submitted when creating report (technician submits it)
            report.setSubmittedAt(LocalDateTime.now()); // Set submission time

            // Set workPerformed (required)
            String workPerformed = request.containsKey("workPerformed")
                    ? (String) request.get("workPerformed")
                    : (String) request.get("work_performed");
            report.setWorkPerformed(workPerformed != null && !workPerformed.trim().isEmpty()
                    ? workPerformed
                    : "Đã thực hiện bảo dưỡng");

            // Set optional fields
            if (request.containsKey("partsUsed") || request.containsKey("parts_used")) {
                report.setPartsUsed(request.containsKey("partsUsed")
                        ? (String) request.get("partsUsed")
                        : (String) request.get("parts_used"));
            }

            if (request.containsKey("issuesFound") || request.containsKey("issues_found")) {
                report.setIssuesFound(request.containsKey("issuesFound")
                        ? (String) request.get("issuesFound")
                        : (String) request.get("issues_found"));
            }

            if (request.containsKey("recommendations")) {
                report.setRecommendations((String) request.get("recommendations"));
            }

            if (request.containsKey("laborHours") || request.containsKey("labor_hours")) {
                try {
                    report.setLaborHours(new java.math.BigDecimal(request.get("laborHours") != null
                            ? request.get("laborHours").toString()
                            : request.get("labor_hours").toString()));
                } catch (Exception e) {
                    // Ignore if laborHours is invalid
                }
            }

            MaintenanceReport saved = maintenanceReportRepository.save(report);
            return ResponseEntity.ok(Map.of("message", "Tạo báo cáo thành công", "report", saved));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error",
                    "Lỗi khi tạo báo cáo: " + (e.getMessage() != null ? e.getMessage() : e.toString())));
        }
    }

    @GetMapping("/maintenance-reports")
    public ResponseEntity<List<MaintenanceReport>> getAllMaintenanceReports() {
        return ResponseEntity.ok(maintenanceReportRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/maintenance-reports/{id}")
    public ResponseEntity<MaintenanceReport> getMaintenanceReport(@PathVariable Long id) {
        MaintenanceReport report = maintenanceReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));
        return ResponseEntity.ok(report);
    }

    @GetMapping("/maintenance-reports/assignment/{assignmentId}")
    public ResponseEntity<?> getMaintenanceReportByAssignment(@PathVariable Long assignmentId) {
        MaintenanceReport report = maintenanceReportRepository.findByAssignmentId(assignmentId)
                .orElse(null);
        if (report == null) {
            return ResponseEntity.ok(Map.of("message", "Chưa có báo cáo"));
        }
        return ResponseEntity.ok(report);
    }

    @PutMapping("/maintenance-reports/{id}")
    public ResponseEntity<?> updateMaintenanceReport(
            @PathVariable Long id,
            @RequestBody MaintenanceReport updates) {

        MaintenanceReport report = maintenanceReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        if (updates.getWorkPerformed() != null)
            report.setWorkPerformed(updates.getWorkPerformed());
        if (updates.getPartsUsed() != null)
            report.setPartsUsed(updates.getPartsUsed());
        if (updates.getIssuesFound() != null)
            report.setIssuesFound(updates.getIssuesFound());
        if (updates.getRecommendations() != null)
            report.setRecommendations(updates.getRecommendations());
        if (updates.getLaborHours() != null)
            report.setLaborHours(updates.getLaborHours());
        if (updates.getStatus() != null) {
            report.setStatus(updates.getStatus());
            if ("submitted".equals(updates.getStatus()) && report.getSubmittedAt() == null) {
                report.setSubmittedAt(LocalDateTime.now());
            }
        }

        MaintenanceReport saved = maintenanceReportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Cập nhật báo cáo thành công", "report", saved));
    }

    @PutMapping("/maintenance-reports/{id}/approve")
    public ResponseEntity<?> approveMaintenanceReport(
            @PathVariable Long id,
            Authentication authentication) {

        MaintenanceReport report = maintenanceReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        User currentUser = (User) authentication.getPrincipal();

        report.setStatus("approved");
        report.setApprovedBy(currentUser.getUserId());
        report.setApprovedAt(LocalDateTime.now());

        maintenanceReportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Phê duyệt báo cáo thành công"));
    }

    // =====================================================
    // CHAT & MESSAGING
    // =====================================================

    @PostMapping("/messages/send")
    public ResponseEntity<?> sendMessage(
            @RequestBody spring.api.staffservice.dto.SendMessageRequest request,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        spring.api.staffservice.dto.MessageDTO message = messageService.sendMessage(currentUser.getUserId(), request);

        return ResponseEntity.ok(Map.of(
                "message", "Tin nhắn đã được gửi",
                "data", message));
    }

    @GetMapping("/messages/conversation/{userId}")
    public ResponseEntity<?> getConversation(
            @PathVariable Long userId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        List<spring.api.staffservice.dto.MessageDTO> messages = messageService.getConversation(currentUser.getUserId(),
                userId);

        return ResponseEntity.ok(Map.of(
                "messages", messages,
                "count", messages.size()));
    }

    @GetMapping("/messages/unread")
    public ResponseEntity<?> getUnreadMessages(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<spring.api.staffservice.dto.MessageDTO> messages = messageService
                .getUnreadMessages(currentUser.getUserId());

        return ResponseEntity.ok(Map.of(
                "messages", messages,
                "count", messages.size()));
    }

    @GetMapping("/messages/unread/count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long count = messageService.getUnreadCount(currentUser.getUserId());

        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu là đã đọc"));
    }

    @PutMapping("/messages/conversation/{userId}/read")
    public ResponseEntity<?> markConversationAsRead(
            @PathVariable Long userId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        messageService.markConversationAsRead(currentUser.getUserId(), userId);

        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu cuộc hội thoại là đã đọc"));
    }

    // Get customer details with full information
    @GetMapping("/customers/{customerId}/details")
    public ResponseEntity<?> getCustomerDetails(@PathVariable Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Map<String, Object> result = new HashMap<>();
        result.put("customer", customer);

        // Get user info
        userRepository.findById(customer.getUserId()).ifPresent(user -> {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("email", user.getEmail());
            userInfo.put("fullName", user.getFullName());
            userInfo.put("phone", user.getPhone());
            userInfo.put("role", user.getRole());
            result.put("user", userInfo);
        });

        // Get vehicles
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
        result.put("vehicles", vehicles);

        // Get appointments
        List<Appointment> appointments = appointmentRepository.findByCustomerId(customerId);
        result.put("appointments", appointments);

        return ResponseEntity.ok(result);
    }
}
