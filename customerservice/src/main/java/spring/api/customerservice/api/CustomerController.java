package spring.api.customerservice.api;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.*;
import spring.api.customerservice.repository.*;
import spring.api.customerservice.api.dto.*;
import spring.api.customerservice.service.SlotService;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceCenterRepository serviceCenterRepository;
    private final SlotService slotService;

    public CustomerController(UserRepository userRepository,
                              CustomerRepository customerRepository,
                              VehicleRepository vehicleRepository,
                              AppointmentRepository appointmentRepository,
                              ServiceCenterRepository serviceCenterRepository,
                              SlotService slotService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.appointmentRepository = appointmentRepository;
        this.serviceCenterRepository = serviceCenterRepository;
        this.slotService = slotService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        Customer customer = customerRepository.findByUser(user).orElse(null);
        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "phone", user.getPhone(),
                "role", user.getRole(),
                "customerId", customer != null ? customer.getCustomerId() : null
        ));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> listVehicles(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        Customer customer = customerRepository.findByUser(user).orElse(null);
        if (customer == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(vehicleRepository.findByCustomer(customer));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<Vehicle> createVehicle(Authentication auth, @Valid @RequestBody VehicleDto dto) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Customer customer = customerRepository.findByUser(user).orElseThrow();
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        vehicle.setVin(dto.vin());
        vehicle.setBrand(dto.brand());
        vehicle.setModel(dto.model());
        vehicle.setYear(dto.year());
        vehicle.setBatteryCapacityKwh(dto.batteryCapacityKwh());
        vehicle.setOdometerKm(dto.odometerKm());
        if (dto.lastServiceDate() != null) {
            vehicle.setLastServiceDate(java.time.LocalDate.parse(dto.lastServiceDate()));
        }
        vehicle.setLastServiceKm(dto.lastServiceKm());
        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.created(URI.create("/api/customers/vehicles/" + saved.getVehicleId())).body(saved);
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(Authentication auth, @PathVariable Integer id) {
        if (!vehicleRepository.existsById(id)) return ResponseEntity.notFound().build();
        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(Authentication auth, @RequestBody @Valid AppointmentCreateDto req) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Customer customer = customerRepository.findByUser(user).orElseThrow();
        Vehicle vehicle = vehicleRepository.findById(req.vehicleId()).orElseThrow();
        ServiceCenter center = serviceCenterRepository.findById(req.centerId()).orElseThrow();

        LocalDateTime requested = LocalDateTime.parse(req.requestedDateTime());
        if (!slotService.isSlotAvailable(center, requested)) {
            return ResponseEntity.status(409).body(Map.of(
                    "error", "SLOT_UNAVAILABLE",
                    "message", "Khung giờ đã đầy hoặc không khả dụng. Vui lòng chọn thời gian khác trong giờ làm việc (08:00-17:00, trừ giờ nghỉ trưa 12:00-13:00 và Chủ nhật)"
            ));
        }

        Appointment appt = new Appointment();
        appt.setCustomer(customer);
        appt.setVehicle(vehicle);
        appt.setCenter(center);
        appt.setServiceId(req.serviceId());
        appt.setRequestedDateTime(requested);
            appt.setStatus(AppointmentStatus.pending);
        appt.setNotes(req.notes());
        appt.setCreatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appt);
        return ResponseEntity.created(URI.create("/api/customers/appointments/" + saved.getAppointmentId())).body(saved);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> listAppointments(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Customer customer = customerRepository.findByUser(user).orElseThrow();
        return ResponseEntity.ok(appointmentRepository.findByCustomer(customer));
    }
}


