package spring.api.customerservice.service;

import org.springframework.stereotype.Service;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.AppointmentStatus;
import spring.api.customerservice.domain.ServiceCenter;
import spring.api.customerservice.repository.AppointmentRepository;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class SlotService {
    private final AppointmentRepository appointmentRepository;

    // Capacity rule: max 10 appointments per center per hour
    private final int capacityPerHour = 10;
    
    // Working hours: 08:00-17:00, lunch break 12:00-13:00, closed on Sunday
    private final LocalTime workStart = LocalTime.of(8, 0);
    private final LocalTime workEnd = LocalTime.of(17, 0);
    private final LocalTime lunchStart = LocalTime.of(12, 0);
    private final LocalTime lunchEnd = LocalTime.of(13, 0);

    public SlotService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public boolean isSlotAvailable(ServiceCenter center, LocalDateTime requested) {
        // Check if it's Sunday (closed)
        if (requested.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return false;
        }
        
        // Check working hours
        LocalTime requestTime = requested.toLocalTime();
        if (requestTime.isBefore(workStart) || requestTime.isAfter(workEnd)) {
            return false;
        }
        
        // Check lunch break
        if (!requestTime.isBefore(lunchStart) && requestTime.isBefore(lunchEnd)) {
            return false;
        }
        
        // Check capacity for the hour
        LocalDateTime start = requested.withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusHours(1);
        long count = appointmentRepository.findAll().stream()
                .filter(a -> a.getCenter().getCenterId().equals(center.getCenterId()))
                .filter(a -> !a.getRequestedDateTime().isBefore(start) && a.getRequestedDateTime().isBefore(end))
                .filter(a -> a.getStatus() != AppointmentStatus.cancelled)
                .count();
        return count < capacityPerHour;
    }
}


