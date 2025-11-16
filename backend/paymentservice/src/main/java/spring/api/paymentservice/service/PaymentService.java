package spring.api.paymentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import spring.api.paymentservice.domain.Payment;
import spring.api.paymentservice.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final Random random = new Random();

    public String generateVerificationCode() {
        return String.format("%06d", random.nextInt(1000000));
    }

    public String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Payment initiatePayment(Payment payment) {
        payment.setStatus("pending");
        payment.setTransactionId(generateTransactionId());
        payment.setVerificationCode(generateVerificationCode());
        payment.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(5));
        payment.setVerified(false);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    public boolean verifyPayment(Long paymentId, String code) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        if (payment.getVerified()) {
            throw new RuntimeException("Giao dịch đã được xác thực");
        }

        if (LocalDateTime.now().isAfter(payment.getVerificationExpiresAt())) {
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        if (!payment.getVerificationCode().equals(code)) {
            return false;
        }

        payment.setVerified(true);
        payment.setStatus("processing");
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        return true;
    }

    public Payment completePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        if (!payment.getVerified()) {
            throw new RuntimeException("Giao dịch chưa được xác thực");
        }

        payment.setStatus("completed");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void expireUnverifiedPayments() {
        paymentRepository.findByStatus("pending").stream()
                .filter(p -> p.getVerificationExpiresAt() != null && 
                           LocalDateTime.now().isAfter(p.getVerificationExpiresAt()) &&
                           !p.getVerified())
                .forEach(p -> {
                    p.setStatus("failed");
                    p.setNotes("Mã xác thực hết hạn");
                    p.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(p);
                });
    }
}

