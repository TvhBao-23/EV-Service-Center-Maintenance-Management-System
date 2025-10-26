package spring.api.evservicecenter.adminworkshop.enums;



/**
 * Enum representing the payment status of a Service Order.
 * Based on the 'payment_status' column in the 'service_orders' table.
 */
public enum PaymentStatus {
    unpaid,         // Chưa thanh toán
    paid,           // Đã thanh toán
    partially_paid  // Đã thanh toán một phần
}