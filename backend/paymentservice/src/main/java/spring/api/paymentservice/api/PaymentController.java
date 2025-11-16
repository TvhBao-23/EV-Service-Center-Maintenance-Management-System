package spring.api.paymentservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.paymentservice.domain.Payment;
import spring.api.paymentservice.domain.User;
import spring.api.paymentservice.repository.PaymentRepository;
import spring.api.paymentservice.service.PaymentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
// CORS is handled by API Gateway
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Payment payment, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = (User) auth.getPrincipal();
        payment.setCustomerId(user.getUserId());

        Payment created = paymentService.initiatePayment(payment);

        return ResponseEntity.ok(Map.of(
            "message", "Giao dịch đã được tạo. Vui lòng nhập mã xác thực",
            "payment_id", created.getPaymentId(),
            "transaction_id", created.getTransactionId(),
            "amount", created.getAmount(),
            "verification_code", created.getVerificationCode(), // For testing only - remove in production
            "expires_at", created.getVerificationExpiresAt()
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        
        Long paymentId = Long.valueOf(body.get("paymentId").toString());
        String code = body.get("verificationCode").toString();
        
        if (code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu mã xác thực"));
        }

        try {
            boolean verified = paymentService.verifyPayment(paymentId, code);
            if (verified) {
                Payment payment = paymentService.completePayment(paymentId);
                return ResponseEntity.ok(Map.of(
                    "message", "Xác thực thành công. Đang xử lý thanh toán",
                    "payment", payment
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã xác thực không đúng"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable Long paymentId, Authentication auth) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));
        
        User user = (User) auth.getPrincipal();
        if (!payment.getCustomerId().equals(user.getUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền truy cập"));
        }

        return ResponseEntity.ok(payment);
    }

    @GetMapping("/my-payments")
    public ResponseEntity<?> getMyPayments(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Payment> payments = paymentRepository.findByCustomerIdOrderByCreatedAtDesc(user.getUserId());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointment(@PathVariable Long appointmentId, Authentication auth) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElse(null);
        
        if (payment == null) {
            return ResponseEntity.ok(Map.of("message", "Chưa có thanh toán cho lịch hẹn này"));
        }

        return ResponseEntity.ok(payment);
    }
}

