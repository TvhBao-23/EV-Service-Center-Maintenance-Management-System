package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.CustomerSubscription;
import spring.api.customerservice.domain.Payment;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.repository.CustomerSubscriptionRepository;
import spring.api.customerservice.repository.PaymentRepository;
import spring.api.customerservice.repository.AppointmentRepository;
import spring.api.customerservice.repository.ServiceRepository;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.Service;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers/payments")
@RequiredArgsConstructor
// CORS is handled by API Gateway
public class PaymentController {
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final CustomerSubscriptionRepository subscriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<Payment>> getPendingPayments(Authentication auth) {
        try {
            System.out.println("[PaymentController] GET /pending - Auth: " + (auth != null ? "present" : "null"));
            if (auth == null || auth.getPrincipal() == null) {
                System.out.println("[PaymentController] No auth, returning empty list");
                return ResponseEntity.ok(List.of());
            }
            
            User user = (User) auth.getPrincipal();
            System.out.println("[PaymentController] User ID: " + user.getUserId());
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseGet(() -> {
                        System.out.println("[PaymentController] Creating new customer for userId: " + user.getUserId());
                        Customer newCustomer = new Customer();
                        newCustomer.setUserId(user.getUserId());
                        newCustomer.setCreatedAt(java.time.LocalDateTime.now());
                        newCustomer.setUpdatedAt(java.time.LocalDateTime.now());
                        return customerRepository.save(newCustomer);
                    });
            
            System.out.println("[PaymentController] Customer ID: " + customer.getCustomerId());
            List<Payment> pendingPayments = paymentRepository.findByCustomerIdAndStatus(
                    customer.getCustomerId(), 
                    Payment.PaymentStatus.pending
            );
            
            System.out.println("[PaymentController] Found " + pendingPayments.size() + " pending payments");
            for (Payment p : pendingPayments) {
                System.out.println("[PaymentController] Payment ID: " + p.getPaymentId() + 
                    ", Subscription ID: " + p.getSubscriptionId() + 
                    ", Appointment ID: " + p.getAppointmentId() + 
                    ", Amount: " + p.getAmount() + 
                    ", Status: " + p.getStatus());
            }
            
            return ResponseEntity.ok(pendingPayments);
        } catch (Exception e) {
            System.err.println("[PaymentController] Error fetching pending payments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @PatchMapping("/{paymentId}/mark-paid")
    public ResponseEntity<?> markPaymentAsPaid(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            payment.setStatus(Payment.PaymentStatus.completed);
            payment.setPaymentDate(java.time.LocalDateTime.now());
            paymentRepository.save(payment);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã đánh dấu thanh toán thành công"
            ));
        } catch (Exception e) {
            System.err.println("[PaymentController] Error marking payment as paid: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/sync-subscription-payments")
    public ResponseEntity<Map<String, Object>> syncSubscriptionPayments(Authentication auth) {
        try {
            System.out.println("[PaymentController] POST /sync-subscription-payments - Auth: " + (auth != null ? "present" : "null"));
            if (auth == null || auth.getPrincipal() == null) {
                System.out.println("[PaymentController] No auth for sync");
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
            }
            
            User user = (User) auth.getPrincipal();
            System.out.println("[PaymentController] Sync - User ID: " + user.getUserId());
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            
            System.out.println("[PaymentController] Sync - Customer ID: " + customer.getCustomerId());
            // Get all subscriptions for this customer
            List<CustomerSubscription> subscriptions = subscriptionRepository.findByCustomerId(customer.getCustomerId());
            System.out.println("[PaymentController] Found " + subscriptions.size() + " subscriptions for customer");
            
            int createdCount = 0;
            for (CustomerSubscription sub : subscriptions) {
                System.out.println("[PaymentController] Checking subscription: " + sub.getSubscriptionId() + ", Status: " + sub.getStatus());
                // Check if payment already exists for this subscription
                List<Payment> existingPayments = paymentRepository.findBySubscriptionId(sub.getSubscriptionId());
                System.out.println("[PaymentController] Existing payments for subscription " + sub.getSubscriptionId() + ": " + existingPayments.size());
                
                if (existingPayments.isEmpty() && sub.getStatus().name().equals("ACTIVE")) {
                    System.out.println("[PaymentController] Creating payment for ACTIVE subscription: " + sub.getSubscriptionId());
                    // Create payment for this subscription
                    Payment payment = new Payment();
                    payment.setSubscriptionId(sub.getSubscriptionId());
                    payment.setCustomerId(customer.getCustomerId());
                    payment.setAmount(sub.getServicePackage().getPrice());
                    payment.setPaymentMethod(Payment.PaymentMethod.e_wallet);
                    payment.setStatus(Payment.PaymentStatus.pending);
                    payment.setTransactionId("SUB_" + sub.getSubscriptionId() + "_" + System.currentTimeMillis());
                    payment.setNotes("Thanh toán cho gói dịch vụ: " + sub.getServicePackage().getName());
                    Payment saved = paymentRepository.save(payment);
                    createdCount++;
                    System.out.println("[PaymentController] ✅ Created payment ID: " + saved.getPaymentId() + " for subscription: " + sub.getSubscriptionId());
                } else if (!existingPayments.isEmpty()) {
                    System.out.println("[PaymentController] ⚠️ Payment already exists for subscription: " + sub.getSubscriptionId());
                } else if (!sub.getStatus().name().equals("ACTIVE")) {
                    System.out.println("[PaymentController] ⚠️ Subscription not ACTIVE: " + sub.getStatus());
                }
            }
            
            System.out.println("[PaymentController] Sync completed. Created " + createdCount + " payments");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã tạo " + createdCount + " payment(s) cho subscriptions",
                    "created", createdCount
            ));
        } catch (Exception e) {
            System.err.println("[PaymentController] Error syncing subscription payments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        try {
            // Get all payments
            List<Payment> allPayments = paymentRepository.findAll();
            
            // Calculate total revenue (sum of completed payments)
            java.math.BigDecimal totalRevenue = allPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.completed)
                    .map(Payment::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            // Calculate pending payments from payments table (status = 'pending')
            java.math.BigDecimal pendingPaymentsFromPayments = allPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.pending)
                    .map(Payment::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            // Calculate unpaid appointments cost (appointments without payment or payment status != 'completed')
            java.math.BigDecimal unpaidAppointmentsCost = java.math.BigDecimal.ZERO;
            try {
                List<Appointment> allAppointments = appointmentRepository.findAll();
                List<Service> allServices = serviceRepository.findAll();
                
                for (Appointment appointment : allAppointments) {
                    Long appointmentId = appointment.getAppointmentId();
                    Long serviceId = appointment.getServiceId();
                    
                    // Find payment for this appointment
                    Payment relatedPayment = allPayments.stream()
                            .filter(p -> p.getAppointmentId() != null && p.getAppointmentId().equals(appointmentId))
                            .findFirst()
                            .orElse(null);
                    
                    // If no payment or payment status != 'completed', add to unpaid cost
                    if (relatedPayment == null || relatedPayment.getStatus() != Payment.PaymentStatus.completed) {
                        java.math.BigDecimal appointmentCost = java.math.BigDecimal.ZERO;
                        
                        // If has payment with amount and status != 'completed', use payment amount
                        if (relatedPayment != null && relatedPayment.getAmount() != null) {
                            appointmentCost = relatedPayment.getAmount();
                        } else if (serviceId != null) {
                            // Otherwise, use service basePrice
                            Service service = allServices.stream()
                                    .filter(s -> s.getServiceId().equals(serviceId))
                                    .findFirst()
                                    .orElse(null);
                            if (service != null && service.getBasePrice() != null) {
                                appointmentCost = service.getBasePrice();
                            }
                        }
                        
                        unpaidAppointmentsCost = unpaidAppointmentsCost.add(appointmentCost);
                    }
                }
            } catch (Exception e) {
                System.err.println("[PaymentController] Error calculating unpaid appointments cost: " + e.getMessage());
                e.printStackTrace();
            }
            
            // Total pending payments = pending payments + unpaid appointments cost
            java.math.BigDecimal totalPendingPayments = pendingPaymentsFromPayments.add(unpaidAppointmentsCost);
            
            System.out.println("[PaymentController] Payment statistics - Pending from payments: " + 
                    pendingPaymentsFromPayments + ", Unpaid appointments: " + unpaidAppointmentsCost + 
                    ", Total pending: " + totalPendingPayments);
            
            return ResponseEntity.ok(Map.of(
                    "totalRevenue", totalRevenue.longValue(),
                    "pendingPayments", totalPendingPayments.longValue()
            ));
        } catch (Exception e) {
            System.err.println("[PaymentController] Error getting payment statistics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "totalRevenue", 0L,
                    "pendingPayments", 0L
            ));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Payment>> getAllPayments() {
        try {
            // Get all payments (for admin dashboard)
            List<Payment> allPayments = paymentRepository.findAll();
            return ResponseEntity.ok(allPayments);
        } catch (Exception e) {
            System.err.println("[PaymentController] Error getting all payments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }
}

