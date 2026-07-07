package spring.api.customerservice.domain;

public enum AppointmentStatus {
    pending,
    received,  // Added to match StaffService status
    confirmed,
    in_maintenance,  // Added to match StaffService status
    completed,
    cancelled
}
