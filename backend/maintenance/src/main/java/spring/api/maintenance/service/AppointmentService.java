package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.Appointment;
import spring.api.maintenance.repository.AppointmentRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public Optional<Appointment> getAppointmentById(Integer appointmentId) {
        return appointmentRepository.findById(appointmentId);
    }

    public List<Appointment> getAppointmentsByCustomer(Integer customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public List<Appointment> getAppointmentsByStatus(String status) {
        Appointment.AppointmentStatus statusEnum = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
        return appointmentRepository.findByStatus(statusEnum);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment confirmAppointment(Integer appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    public Appointment cancelAppointment(Integer appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    public Appointment updateAppointment(Integer appointmentId, Appointment appointment) {
        appointment.setAppointmentId(appointmentId);
        return appointmentRepository.save(appointment);
    }

    public Appointment completeAppointment(Integer appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
            return appointmentRepository.save(appointment);
        }
        return null;
    }
}
