package spring.api.evservicecenter.adminworkshop.enums;


/**
 * Enum representing the status of an Appointment.
 * Based on the 'status' column in the 'appointments' table.
 */
public enum AppointmentStatus {
    pending,     // Chờ xác nhận
    confirmed,   // Đã xác nhận
    cancelled,   // Đã hủy
    completed    // Đã hoàn thành (khi ServiceOrder tương ứng hoàn tất)
}