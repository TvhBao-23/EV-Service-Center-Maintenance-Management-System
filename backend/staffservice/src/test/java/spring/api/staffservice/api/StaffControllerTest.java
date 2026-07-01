package spring.api.staffservice.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import spring.api.staffservice.domain.Appointment;
import spring.api.staffservice.domain.Assignment;
import spring.api.staffservice.domain.Checklist;
import spring.api.staffservice.domain.MaintenanceReport;
import spring.api.staffservice.domain.ServiceReceipt;
import spring.api.staffservice.domain.User;
import spring.api.staffservice.domain.UserRole;
import spring.api.staffservice.repository.AppointmentRepository;
import spring.api.staffservice.repository.AssignmentRepository;
import spring.api.staffservice.repository.ChecklistRepository;
import spring.api.staffservice.repository.CustomerRepository;
import spring.api.staffservice.repository.MaintenanceReportRepository;
import spring.api.staffservice.repository.ServiceReceiptRepository;
import spring.api.staffservice.repository.UserRepository;
import spring.api.staffservice.repository.VehicleRepository;
import spring.api.staffservice.service.MessageService;

@ExtendWith(MockitoExtension.class)
class StaffControllerTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private UserRepository userRepository;
    @Mock private AssignmentRepository assignmentRepository;
    @Mock private ServiceReceiptRepository serviceReceiptRepository;
    @Mock private ChecklistRepository checklistRepository;
    @Mock private MaintenanceReportRepository maintenanceReportRepository;
    @Mock private MessageService messageService;

    @InjectMocks
    private StaffController controller;

    private Authentication staffAuth;
    private Authentication technicianAuth;
    private User staffUser;
    private User technicianUser;

    @BeforeEach
    void setUp() {
        staffUser = new User();
        staffUser.setUserId(100L);
        staffUser.setFullName("Staff One");
        staffUser.setRole(UserRole.staff);

        technicianUser = new User();
        technicianUser.setUserId(200L);
        technicianUser.setFullName("Tech One");
        technicianUser.setRole(UserRole.technician);

        staffAuth = authFor(staffUser);
        technicianAuth = authFor(technicianUser);
    }

    @Test
    @DisplayName("AS-01 - Phân công bằng appointment_id hợp lệ")
    void tc01_createAssignment_fromAppointment() {
        Appointment appointment = appointment(11L, 901L, "pending");
        Assignment saved = assignment(21L, 11L, 200L, 100L, "assigned");

        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));
        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(appointment));
        when(assignmentRepository.findByAppointmentId(11L)).thenReturn(Optional.empty());
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(saved);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("appointment_id", 11L);
        request.put("assignment_date", "2026-07-01T09:00:00");
        request.put("notes", "Kiem tra pin va phanh");

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = castMap(response.getBody());
        assertThat(body.get("message")).isEqualTo("Phân công thành công");
        Assignment assignment = (Assignment) body.get("assignment");
        assertThat(assignment.getAssignmentId()).isEqualTo(21L);
        assertThat(assignment.getAppointmentId()).isEqualTo(11L);
        assertThat(assignment.getTechnicianId()).isEqualTo(200L);
        assertThat(assignment.getStatus()).isEqualTo("assigned");

        verify(assignmentRepository).save(any(Assignment.class));
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("AS-02 - Phân công bằng receipt_id dạng SR")
    void tc02_createAssignment_fromReceiptNumber() {
        Appointment appointment = appointment(12L, 902L, "pending");
        ServiceReceipt receipt = serviceReceipt(31L, 12L, 902L, "SR-20260602-071738");
        Assignment saved = assignment(22L, 12L, 200L, 100L, "assigned");

        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));
        when(serviceReceiptRepository.findByReceiptNumber("SR-20260602-071738")).thenReturn(Optional.of(receipt));
        when(appointmentRepository.findById(12L)).thenReturn(Optional.of(appointment));
        when(assignmentRepository.findByAppointmentId(12L)).thenReturn(Optional.empty());
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(saved);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("receipt_id", "SR-20260602-071738");

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = castMap(response.getBody());
        assertThat(body.get("message")).isEqualTo("Phân công thành công");
        Assignment assignment = (Assignment) body.get("assignment");
        assertThat(assignment.getAppointmentId()).isEqualTo(12L);
    }

    @Test
    @DisplayName("AS-03 - Thiếu technician_id")
    void tc03_createAssignment_missingTechnicianId() {
        Map<String, Object> request = new HashMap<>();
        request.put("appointment_id", 11L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Thiếu ID kỹ thuật viên (technician_id)");
    }

    @Test
    @DisplayName("AS-11 - appointment_id sai format")
    void tc04_createAssignment_invalidAppointmentIdFormat() {
        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("appointment_id", "abc");

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("ID lịch hẹn (appointment_id) không hợp lệ");
    }

    @Test
    @DisplayName("AS-05 - Technician không tồn tại")
    void tc05_createAssignment_unknownTechnician() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 999L);
        request.put("appointment_id", 11L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Không tìm thấy kỹ thuật viên với ID = 999");
    }

    @Test
    @DisplayName("AS-06 - User không phải technician")
    void tc06_createAssignment_invalidTechnicianRole() {
        User staffAsTechnician = new User();
        staffAsTechnician.setUserId(300L);
        staffAsTechnician.setRole(UserRole.staff);

        when(userRepository.findById(300L)).thenReturn(Optional.of(staffAsTechnician));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 300L);
        request.put("appointment_id", 11L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("User không phải kỹ thuật viên");
    }

    @Test
    @DisplayName("AS-04 - technician_id sai format")
    void tc07_createAssignment_invalidTechnicianIdFormat() {
        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", "abc");
        request.put("appointment_id", 11L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("ID kỹ thuật viên không hợp lệ");
        verifyNoInteractions(userRepository, appointmentRepository, assignmentRepository, serviceReceiptRepository);
    }

    @Test
    @DisplayName("AS-07 - Thiếu cả appointment_id và receipt_id")
    void tc08_createAssignment_missingAppointmentAndReceipt() {
        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Thiếu thông tin lịch hẹn hoặc phiếu tiếp nhận (appointment_id hoặc receipt_id)");
    }

    @Test
    @DisplayName("AS-12 - appointment_id không tồn tại")
    void tc09_createAssignment_missingAppointment() {
        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));
        when(appointmentRepository.findById(11L)).thenReturn(Optional.empty());

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("appointment_id", 11L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Không tìm thấy lịch hẹn với ID = 11");
    }

    @Test
    @DisplayName("AS-13 - Phân công bằng receipt_id số")
    void tc10_createAssignment_numericReceiptId() {
        Appointment appointment = appointment(13L, 903L, "pending");
        ServiceReceipt receipt = serviceReceipt(33L, 13L, 903L, "SR-20260630-000003");
        Assignment saved = assignment(23L, 13L, 200L, 100L, "assigned");

        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));
        when(serviceReceiptRepository.findById(33L)).thenReturn(Optional.of(receipt));
        when(appointmentRepository.findById(13L)).thenReturn(Optional.of(appointment));
        when(assignmentRepository.findByAppointmentId(13L)).thenReturn(Optional.empty());
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(saved);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("receipt_id", 33L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Assignment assignment = (Assignment) castMap(response.getBody()).get("assignment");
        assertThat(assignment.getAppointmentId()).isEqualTo(13L);
    }

    @Test
    @DisplayName("AS-09 - Appointment đã được phân công")
    void tc11_createAssignment_duplicateAppointment() {
        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));
        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(appointment(11L, 901L, "pending")));
        when(assignmentRepository.findByAppointmentId(11L)).thenReturn(Optional.of(assignment(99L, 11L, 200L, 100L, "assigned")));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("appointment_id", 11L);

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Lịch hẹn đã được phân công");
    }

    @Test
    @DisplayName("AS-10 - assignment_date sai format")
    void tc12_createAssignment_invalidAssignmentDateFallsBackToNow() {
        when(userRepository.findById(200L)).thenReturn(Optional.of(technicianUser));
        when(appointmentRepository.findById(11L)).thenReturn(Optional.of(appointment(11L, 901L, "pending")));
        when(assignmentRepository.findByAppointmentId(11L)).thenReturn(Optional.empty());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("technician_id", 200L);
        request.put("appointment_id", 11L);
        request.put("assignment_date", "invalid-date");

        ResponseEntity<?> response = controller.createAssignment(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<Assignment> captor = ArgumentCaptor.forClass(Assignment.class);
        verify(assignmentRepository).save(captor.capture());
        assertThat(captor.getValue().getAssignedAt()).isNotNull();
    }

    @Test
    @DisplayName("SR-01 - Tạo phiếu tiếp nhận hợp lệ")
    void tc13_createServiceReceipt_createReceipt() {
        ServiceReceipt saved = serviceReceipt(41L, 11L, 901L, "SR-20260630-000001");
        saved.setReceivedBy(100L);
        saved.setOdometerReading(12000);
        saved.setFuelLevel("80%");
        saved.setExteriorCondition("Good");
        saved.setInteriorCondition("Clean");
        saved.setCustomerComplaints("Check battery");
        saved.setEstimatedCompletion(LocalDateTime.parse("2026-07-02T17:00:00"));

        when(serviceReceiptRepository.findByAppointmentId(11L)).thenReturn(Optional.empty());
        when(serviceReceiptRepository.save(any(ServiceReceipt.class))).thenReturn(saved);

        Map<String, Object> request = new HashMap<>();
        request.put("appointment_id", 11L);
        request.put("vehicle_id", 901L);
        request.put("odometer_reading", 12000);
        request.put("fuel_level", "80%");
        request.put("exterior_condition", "Good");
        request.put("interior_condition", "Clean");
        request.put("customer_complaints", "Check battery");
        request.put("estimated_completion", "2026-07-02T17:00:00");

        ResponseEntity<?> response = controller.createServiceReceipt(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = castMap(response.getBody());
        assertThat(body.get("message")).isEqualTo("Tạo phiếu tiếp nhận thành công");
        ServiceReceipt receipt = (ServiceReceipt) body.get("receipt");
        assertThat(receipt.getAppointmentId()).isEqualTo(11L);
        assertThat(receipt.getVehicleId()).isEqualTo(901L);
        assertThat(receipt.getReceivedBy()).isEqualTo(100L);
        assertThat(receipt.getOdometerReading()).isEqualTo(12000);
        assertThat(receipt.getFuelLevel()).isEqualTo("80%");
    }

    @Test
    @DisplayName("SR-07 - Có đầy đủ field optional")
    void tc14_createServiceReceipt_missingOptionalFields() {
        ServiceReceipt saved = serviceReceipt(42L, 12L, 902L, "SR-20260630-000002");
        saved.setReceivedBy(100L);
        saved.setOdometerReading(15000);

        when(serviceReceiptRepository.findByAppointmentId(12L)).thenReturn(Optional.empty());
        when(serviceReceiptRepository.save(any(ServiceReceipt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("appointment_id", 12L);
        request.put("vehicle_id", 902L);
        request.put("odometer_reading", 15000);

        ResponseEntity<?> response = controller.createServiceReceipt(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        ServiceReceipt receipt = (ServiceReceipt) castMap(response.getBody()).get("receipt");
        assertThat(receipt.getFuelLevel()).isNull();
        assertThat(receipt.getExteriorCondition()).isNull();
        assertThat(receipt.getInteriorCondition()).isNull();
        assertThat(receipt.getCustomerComplaints()).isNull();
    }

    @Test
    @DisplayName("SR-02 - Tạo trùng appointment")
    void tc15_createServiceReceipt_duplicateReceipt() {
        when(serviceReceiptRepository.findByAppointmentId(11L)).thenReturn(Optional.of(serviceReceipt(41L, 11L, 901L, "SR-20260630-000001")));

        Map<String, Object> request = new HashMap<>();
        request.put("appointment_id", 11L);
        request.put("vehicle_id", 901L);
        request.put("odometer_reading", 12000);

        ResponseEntity<?> response = controller.createServiceReceipt(request, staffAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Phiếu tiếp nhận đã tồn tại");
        verify(serviceReceiptRepository, never()).save(any(ServiceReceipt.class));
    }

    @Test
    @DisplayName("CL-04 - Checklist chưa có thì tự tạo từ mã SR")
    void tc16_updateChecklist_fromReceiptNumber() {
        ServiceReceipt receipt = serviceReceipt(51L, 13L, 903L, "SR-20260602-071738");
        Assignment assignment = assignment(61L, 13L, 200L, 100L, "assigned");
        Checklist created = checklist(71L, 61L, 903L, 200L);
        created.setBatteryHealth("95%");
        created.setBatteryVoltage(new BigDecimal("390.5"));
        created.setBatteryTemperature(new BigDecimal("35.2"));
        created.setBrakeSystem("good");
        created.setTireCondition("good");
        created.setTirePressure("FL:32,FR:32,RL:31,RR:31");
        created.setNotes("All good");

        when(serviceReceiptRepository.findByReceiptNumber("SR-20260602-071738")).thenReturn(Optional.of(receipt));
        when(assignmentRepository.findByAppointmentId(13L)).thenReturn(Optional.of(assignment));
        when(checklistRepository.findByAssignmentId(61L)).thenReturn(Optional.empty());
        when(checklistRepository.save(any(Checklist.class))).thenReturn(created);

        Map<String, Object> request = new HashMap<>();
        request.put("batterySoh", "95%");
        request.put("voltage", 390.5);
        request.put("batteryTemperature", 35.2);
        request.put("brakeCondition", "good");
        request.put("tireCondition", "good");
        request.put("tirePressure", "FL:32,FR:32,RL:31,RR:31");
        request.put("notes", "All good");

        ResponseEntity<?> response = controller.updateChecklist("SR-20260602-071738", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = castMap(response.getBody());
        assertThat(body.get("message")).isEqualTo("Cập nhật checklist thành công");
        Checklist checklist = (Checklist) body.get("checklist");
        assertThat(checklist.getAssignmentId()).isEqualTo(61L);
        assertThat(checklist.getVehicleId()).isEqualTo(903L);
        assertThat(checklist.getTechnicianId()).isEqualTo(200L);
        assertThat(checklist.getBatteryHealth()).isEqualTo("95%");
        assertThat(checklist.getBrakeSystem()).isEqualTo("good");
    }

    @Test
    @DisplayName("CL-04 - Checklist chưa có thì tự tạo từ receiptId số")
    void tc17_updateChecklist_fromNumericReceiptId() {
        ServiceReceipt receipt = serviceReceipt(53L, 15L, 905L, "SR-20260602-071740");
        Assignment assignment = assignment(62L, 15L, 200L, 100L, "assigned");
        Checklist created = checklist(73L, 62L, 905L, 200L);
        created.setBatteryHealth("90%");

        when(serviceReceiptRepository.findById(53L)).thenReturn(Optional.of(receipt));
        when(assignmentRepository.findByAppointmentId(15L)).thenReturn(Optional.of(assignment));
        when(checklistRepository.findByAssignmentId(62L)).thenReturn(Optional.empty());
        when(checklistRepository.save(any(Checklist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("battery_health", "90%");
        request.put("batteryVoltage", 388.2);
        request.put("brake_system", "good");

        ResponseEntity<?> response = controller.updateChecklist("53", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Checklist checklist = (Checklist) castMap(response.getBody()).get("checklist");
        assertThat(checklist).isNotNull();
        assertThat(checklist.getAssignmentId()).isEqualTo(62L);
        assertThat(checklist.getBatteryHealth()).isEqualTo("90%");
        assertThat(checklist.getBatteryVoltage()).isEqualByComparingTo("388.2");
        assertThat(checklist.getBrakeSystem()).isEqualTo("good");
    }

    @Test
    @DisplayName("CL-03 - Receipt có nhưng chưa phân công")
    void tc18_updateChecklist_receiptWithoutAssignment() {
        ServiceReceipt receipt = serviceReceipt(52L, 14L, 904L, "SR-20260602-071739");

        when(serviceReceiptRepository.findByReceiptNumber("SR-20260602-071739")).thenReturn(Optional.of(receipt));
        when(assignmentRepository.findByAppointmentId(14L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.updateChecklist("SR-20260602-071739", new HashMap<>());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Lịch hẹn liên quan chưa được phân công kỹ thuật viên");
    }

    @Test
    @DisplayName("CL-05 - Checklist đã có thì update")
    void tc19_updateChecklist_existingChecklistByNumericId() {
        Checklist existing = checklist(72L, 61L, 903L, 200L);
        existing.setBatteryHealth("old");
        existing.setBatteryVoltage(new BigDecimal("300"));

        when(checklistRepository.findById(72L)).thenReturn(Optional.of(existing));
        when(checklistRepository.save(any(Checklist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("batteryHealth", "fair");
        request.put("battery_voltage", 400.25);
        request.put("battery_temperature", 36.4);
        request.put("brakeSystem", "good");
        request.put("tire_condition", "fair");
        request.put("tire_pressure", "FL:30,FR:30,RL:31,RR:31");
        request.put("notes", "updated");

        ResponseEntity<?> response = controller.updateChecklist("72", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Checklist checklist = (Checklist) castMap(response.getBody()).get("checklist");
        assertThat(checklist.getBatteryHealth()).isEqualTo("fair");
        assertThat(checklist.getBatteryVoltage()).isEqualByComparingTo("400.25");
        assertThat(checklist.getBrakeSystem()).isEqualTo("good");
        assertThat(checklist.getTireCondition()).isEqualTo("fair");
    }

    @Test
    @DisplayName("CL-02 - Mã SR không tồn tại")
    void tc20_updateChecklist_notFound() {
        when(serviceReceiptRepository.findByReceiptNumber("SR-NOTFOUND")).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.updateChecklist("SR-NOTFOUND", new HashMap<>());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Không tìm thấy checklist hoặc phiếu tiếp nhận tương ứng với ID/Mã: SR-NOTFOUND");
    }

    @Test
    @DisplayName("MR-01 - Tạo report bằng assignmentId")
    void tc21_createMaintenanceReport_withAssignmentId() {
        MaintenanceReport saved = maintenanceReport(81L, 61L, 903L, 200L, "submitted", "Work done");

        when(maintenanceReportRepository.save(any(MaintenanceReport.class))).thenReturn(saved);

        Map<String, Object> request = new HashMap<>();
        request.put("assignmentId", 61L);
        request.put("vehicleId", 903L);
        request.put("workPerformed", "Work done");
        request.put("partsUsed", "None");
        request.put("issuesFound", "None");
        request.put("recommendations", "Maintain");
        request.put("laborHours", 2.5);

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = castMap(response.getBody());
        assertThat(body.get("message")).isEqualTo("Tạo báo cáo thành công");
        MaintenanceReport report = (MaintenanceReport) body.get("report");
        assertThat(report.getAssignmentId()).isEqualTo(61L);
        assertThat(report.getVehicleId()).isEqualTo(903L);
        assertThat(report.getTechnicianId()).isEqualTo(200L);
        assertThat(report.getStatus()).isEqualTo("submitted");
        assertThat(report.getWorkPerformed()).isEqualTo("Work done");
    }

    @Test
    @DisplayName("MR-07 - Có optional fields")
    void tc22_createMaintenanceReport_aliasFieldNames() {
        when(maintenanceReportRepository.save(any(MaintenanceReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new HashMap<>();
        request.put("assignment_id", 61L);
        request.put("vehicle_id", 903L);
        request.put("work_performed", "Work done");
        request.put("parts_used", "Brake pads");
        request.put("issues_found", "Worn brake pads");
        request.put("recommendations", "Replace pads");
        request.put("labor_hours", 3.75);

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        MaintenanceReport report = (MaintenanceReport) castMap(response.getBody()).get("report");
        assertThat(report.getVehicleId()).isEqualTo(903L);
        assertThat(report.getPartsUsed()).isEqualTo("Brake pads");
        assertThat(report.getIssuesFound()).isEqualTo("Worn brake pads");
        assertThat(report.getRecommendations()).isEqualTo("Replace pads");
        assertThat(report.getLaborHours()).isEqualByComparingTo("3.75");
    }

    @Test
    @DisplayName("MR-03 - Tạo report bằng appointmentId chưa có assignment")
    void tc23_createMaintenanceReport_createAssignmentFromAppointment() {
        Appointment appointment = appointment(15L, 905L, "confirmed");
        Assignment savedAssignment = assignment(91L, 15L, 200L, 200L, "in_progress");
        MaintenanceReport savedReport = maintenanceReport(82L, 91L, 905L, 200L, "submitted", "Work done");

        when(assignmentRepository.findByAppointmentId(15L)).thenReturn(Optional.empty());
        when(appointmentRepository.findById(15L)).thenReturn(Optional.of(appointment));
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(savedAssignment);
        when(maintenanceReportRepository.save(any(MaintenanceReport.class))).thenReturn(savedReport);

        Map<String, Object> request = new HashMap<>();
        request.put("vehicle_id", 905L);
        request.put("appointment_id", 15L);
        request.put("work_performed", "Work done");

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        MaintenanceReport report = (MaintenanceReport) castMap(response.getBody()).get("report");
        assertThat(report.getAssignmentId()).isEqualTo(91L);
        assertThat(report.getWorkPerformed()).isEqualTo("Work done");
    }

    @Test
    @DisplayName("MR-02 - Tạo report bằng appointmentId đã có assignment")
    void tc24_createMaintenanceReport_useExistingAssignmentForAppointment() {
        Assignment existingAssignment = assignment(92L, 16L, 200L, 100L, "assigned");
        MaintenanceReport savedReport = maintenanceReport(83L, 92L, 906L, 200L, "submitted", "Work done");

        when(assignmentRepository.findByAppointmentId(16L)).thenReturn(Optional.of(existingAssignment));
        when(maintenanceReportRepository.save(any(MaintenanceReport.class))).thenReturn(savedReport);

        Map<String, Object> request = new HashMap<>();
        request.put("vehicleId", 906L);
        request.put("appointmentId", 16L);
        request.put("workPerformed", "Work done");

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        MaintenanceReport report = (MaintenanceReport) castMap(response.getBody()).get("report");
        assertThat(report.getAssignmentId()).isEqualTo(92L);
        verify(assignmentRepository, never()).save(any(Assignment.class));
    }

    @Test
    @DisplayName("MR-06/MR-09 - workPerformed rỗng và laborHours sai format")
    void tc25_createMaintenanceReport_defaultWorkPerformedAndIgnoreInvalidLaborHours() {
        MaintenanceReport savedReport = maintenanceReport(84L, 61L, 903L, 200L, "submitted", "Đã thực hiện bảo dưỡng");

        when(maintenanceReportRepository.save(any(MaintenanceReport.class))).thenReturn(savedReport);

        Map<String, Object> request = new HashMap<>();
        request.put("assignmentId", 61L);
        request.put("vehicleId", 903L);
        request.put("workPerformed", "   ");
        request.put("laborHours", "abc");

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        MaintenanceReport report = (MaintenanceReport) castMap(response.getBody()).get("report");
        assertThat(report.getWorkPerformed()).isEqualTo("Đã thực hiện bảo dưỡng");
        assertThat(report.getLaborHours()).isNull();
    }

    @Test
    @DisplayName("MR-10 - Thiếu assignmentId hoặc appointmentId")
    void tc26_createMaintenanceReport_missingAssignmentOrAppointment() {
        Map<String, Object> request = new HashMap<>();
        request.put("vehicleId", 903L);
        request.put("workPerformed", "Work done");

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("Either assignmentId or appointmentId is required");
    }

    @Test
    @DisplayName("MR-04 - Thiếu vehicleId")
    void tc27_createMaintenanceReport_missingRequiredFields() {
        Map<String, Object> request = new HashMap<>();
        request.put("assignmentId", 61L);

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("vehicleId is required");
    }

    @Test
    @DisplayName("MR-05 - Thiếu workPerformed")
    void tc28_createMaintenanceReport_missingWorkPerformed() {
        Map<String, Object> request = new HashMap<>();
        request.put("vehicleId", 903L);
        request.put("assignmentId", 61L);

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(castMap(response.getBody()).get("error")).isEqualTo("workPerformed is required");
    }

    @Test
    @DisplayName("MR-03 - Appointment không tồn tại khi tự tạo assignment")
    void tc29_createMaintenanceReport_missingAppointmentWhenAutoCreatingAssignment() {
        when(assignmentRepository.findByAppointmentId(99L)).thenReturn(Optional.empty());
        when(appointmentRepository.findById(99L)).thenReturn(Optional.empty());

        Map<String, Object> request = new HashMap<>();
        request.put("vehicleId", 903L);
        request.put("appointmentId", 99L);
        request.put("workPerformed", "Work done");

        ResponseEntity<?> response = controller.createMaintenanceReport(request, technicianAuth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(castMap(response.getBody()).get("error")).asString().contains("Không tìm thấy lịch hẹn với ID: 99");
    }

    private Authentication authFor(User principal) {
        return new UsernamePasswordAuthenticationToken(principal, "N/A");
    }

    private Appointment appointment(Long id, Long vehicleId, String status) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(id);
        appointment.setVehicleId(vehicleId);
        appointment.setStatus(status);
        return appointment;
    }

    private Assignment assignment(Long id, Long appointmentId, Long technicianId, Long assignedBy, String status) {
        Assignment assignment = new Assignment();
        assignment.setAssignmentId(id);
        assignment.setAppointmentId(appointmentId);
        assignment.setTechnicianId(technicianId);
        assignment.setAssignedBy(assignedBy);
        assignment.setStatus(status);
        return assignment;
    }

    private ServiceReceipt serviceReceipt(Long id, Long appointmentId, Long vehicleId, String receiptNumber) {
        ServiceReceipt receipt = new ServiceReceipt();
        receipt.setReceiptId(id);
        receipt.setAppointmentId(appointmentId);
        receipt.setVehicleId(vehicleId);
        receipt.setReceiptNumber(receiptNumber);
        return receipt;
    }

    private Checklist checklist(Long id, Long assignmentId, Long vehicleId, Long technicianId) {
        Checklist checklist = new Checklist();
        checklist.setChecklistId(id);
        checklist.setAssignmentId(assignmentId);
        checklist.setVehicleId(vehicleId);
        checklist.setTechnicianId(technicianId);
        return checklist;
    }

    private MaintenanceReport maintenanceReport(Long id, Long assignmentId, Long vehicleId, Long technicianId, String status, String workPerformed) {
        MaintenanceReport report = new MaintenanceReport();
        report.setReportId(id);
        report.setAssignmentId(assignmentId);
        report.setVehicleId(vehicleId);
        report.setTechnicianId(technicianId);
        report.setStatus(status);
        report.setWorkPerformed(workPerformed);
        return report;
    }

    @SuppressWarnings("unchecked")
    private Map<?, ?> castMap(Object body) {
        assertThat(body).isInstanceOf(Map.class);
        return (Map<?, ?>) body;
    }
}
