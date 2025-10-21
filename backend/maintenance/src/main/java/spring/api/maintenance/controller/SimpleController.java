package spring.api.maintenance.controller;

import spring.api.maintenance.entity.Appointment;
import spring.api.maintenance.entity.Customer;
import spring.api.maintenance.entity.Vehicle;
import spring.api.maintenance.repository.AppointmentRepository;
import spring.api.maintenance.repository.CustomerRepository;
import spring.api.maintenance.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Simple REST Controller for testing basic CRUD operations
 * Controller đơn giản để test các thao tác CRUD cơ bản
 */
@RestController
@RequestMapping("/api/simple")
@CrossOrigin(origins = "*")
public class SimpleController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // ========== CUSTOMER APIs ==========

    /**
     * GET /api/simple/customers - Lấy tất cả khách hàng
     */
    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return ResponseEntity.ok(customers);
    }

    /**
     * GET /api/simple/customers/{id} - Lấy khách hàng theo ID
     */
    @GetMapping("/customers/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer id) {
        Optional<Customer> customer = customerRepository.findById(id);
        if (customer.isPresent()) {
            return ResponseEntity.ok(customer.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/simple/customers - Tạo khách hàng mới
     */
    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        try {
            Customer savedCustomer = customerRepository.save(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating customer: " + e.getMessage());
        }
    }

    // ========== VEHICLE APIs ==========

    /**
     * GET /api/simple/vehicles - Lấy tất cả xe
     */
    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return ResponseEntity.ok(vehicles);
    }

    /**
     * GET /api/simple/vehicles/{id} - Lấy xe theo ID
     */
    @GetMapping("/vehicles/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Optional<Vehicle> vehicle = vehicleRepository.findById(id);
        if (vehicle.isPresent()) {
            return ResponseEntity.ok(vehicle.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/simple/vehicles/customer/{customerId} - Lấy xe của khách hàng
     */
    @GetMapping("/vehicles/customer/{customerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByCustomer(@PathVariable Long customerId) {
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * POST /api/simple/vehicles - Tạo xe mới
     */
    @PostMapping("/vehicles")
    public ResponseEntity<?> createVehicle(@RequestBody Vehicle vehicle) {
        try {
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            return ResponseEntity.ok(savedVehicle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating vehicle: " + e.getMessage());
        }
    }

    // ========== APPOINTMENT APIs ==========

    /**
     * GET /api/simple/appointments - Lấy tất cả lịch hẹn
     */
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return ResponseEntity.ok(appointments);
    }

    /**
     * GET /api/simple/appointments/{id} - Lấy lịch hẹn theo ID
     */
    @GetMapping("/appointments/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Integer id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        if (appointment.isPresent()) {
            return ResponseEntity.ok(appointment.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/simple/appointments/customer/{customerId} - Lấy lịch hẹn của khách
     * hàng
     */
    @GetMapping("/appointments/customer/{customerId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByCustomer(@PathVariable Integer customerId) {
        List<Appointment> appointments = appointmentRepository.findByCustomerId(customerId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * POST /api/simple/appointments - Tạo lịch hẹn mới
     */
    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            Appointment savedAppointment = appointmentRepository.save(appointment);
            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating appointment: " + e.getMessage());
        }
    }

    // ========== STATS APIs ==========

    /**
     * GET /api/simple/stats - Thống kê tổng quan
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalCustomers = customerRepository.count();
        long totalVehicles = vehicleRepository.count();
        long totalAppointments = appointmentRepository.count();

        return ResponseEntity.ok(new StatsResponse(totalCustomers, totalVehicles, totalAppointments));
    }

    // ========== TEST APIs ==========

    /**
     * GET /api/simple/test - Test API hoạt động
     */
    @GetMapping("/test")
    public ResponseEntity<?> testApi() {
        return ResponseEntity.ok(new TestResponse("API is working!", System.currentTimeMillis()));
    }

    // DTO Classes
    public static class StatsResponse {
        private long totalCustomers;
        private long totalVehicles;
        private long totalAppointments;

        public StatsResponse(long totalCustomers, long totalVehicles, long totalAppointments) {
            this.totalCustomers = totalCustomers;
            this.totalVehicles = totalVehicles;
            this.totalAppointments = totalAppointments;
        }

        // Getters
        public long getTotalCustomers() {
            return totalCustomers;
        }

        public long getTotalVehicles() {
            return totalVehicles;
        }

        public long getTotalAppointments() {
            return totalAppointments;
        }
    }

    public static class TestResponse {
        private String message;
        private long timestamp;

        public TestResponse(String message, long timestamp) {
            this.message = message;
            this.timestamp = timestamp;
        }

        // Getters
        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
