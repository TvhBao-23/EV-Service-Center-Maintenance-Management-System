package spring.api.evservicecenter.adminworkshop.enums;

/**
 * Enum representing the status of a Service Order.
 * Based on the 'status' column in the 'service_orders' table.
 */
public enum ServiceOrderStatus {
    queued,        // Chờ xử lý
    in_progress,   // Đang xử lý
    completed,     // Hoàn tất
    delayed        // Tạm hoãn
    // Add any other statuses defined in your schema if necessary
}
