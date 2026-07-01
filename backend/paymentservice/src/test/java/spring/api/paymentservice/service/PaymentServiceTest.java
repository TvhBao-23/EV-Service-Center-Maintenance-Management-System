package spring.api.paymentservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import spring.api.paymentservice.domain.Payment;
import spring.api.paymentservice.repository.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        payment = new Payment();
        payment.setAppointmentId(10L);
        payment.setCustomerId(20L);
        payment.setAmount(new BigDecimal("1200.00"));
        payment.setPaymentMethod("card");
    }

    @Test
    void initiatePayment_populatesPaymentProperties() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment saved = paymentService.initiatePayment(payment);

        assertThat(saved.getStatus()).isEqualTo("pending");
        assertThat(saved.getTransactionId()).startsWith("TXN");
        assertThat(saved.getVerificationCode()).hasSize(6);
        assertThat(saved.getVerified()).isFalse();
        assertThat(saved.getVerificationExpiresAt()).isAfter(LocalDateTime.now());
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        verify(paymentRepository, times(1)).save(saved);
    }

    @Test
    void verifyPayment_successfulWhenCodeMatches() {
        payment.setVerified(false);
        payment.setStatus("pending");
        payment.setVerificationCode("123456");
        payment.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(5));
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean verified = paymentService.verifyPayment(1L, "123456");

        assertThat(verified).isTrue();
        assertThat(payment.getVerified()).isTrue();
        assertThat(payment.getStatus()).isEqualTo("processing");
        verify(paymentRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    void verifyPayment_returnsFalseWhenCodeDoesNotMatch() {
        payment.setVerified(false);
        payment.setStatus("pending");
        payment.setVerificationCode("123456");
        payment.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(5));
        when(paymentRepository.findById(2L)).thenReturn(Optional.of(payment));

        boolean verified = paymentService.verifyPayment(2L, "000000");

        assertThat(verified).isFalse();
        assertThat(payment.getVerified()).isFalse();
        assertThat(payment.getStatus()).isEqualTo("pending");
        verify(paymentRepository, times(1)).findById(2L);
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void verifyPayment_throwsWhenPaymentNotFound() {
        when(paymentRepository.findById(3L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.verifyPayment(3L, "123456"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy giao dịch");
    }

    @Test
    void verifyPayment_throwsWhenAlreadyVerified() {
        payment.setVerified(true);
        payment.setVerificationCode("123456");
        payment.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(5));
        when(paymentRepository.findById(4L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.verifyPayment(4L, "123456"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Giao dịch đã được xác thực");
    }

    @Test
    void verifyPayment_throwsWhenCodeExpired() {
        payment.setVerified(false);
        payment.setVerificationCode("123456");
        payment.setVerificationExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(paymentRepository.findById(5L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.verifyPayment(5L, "123456"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Mã xác thực đã hết hạn");
    }

    @Test
    void completePayment_updatesStatusToCompleted() {
        payment.setVerified(true);
        payment.setStatus("processing");
        when(paymentRepository.findById(6L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = paymentService.completePayment(6L);

        assertThat(result.getStatus()).isEqualTo("completed");
        assertThat(result.getPaymentDate()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    void completePayment_throwsWhenNotVerified() {
        payment.setVerified(false);
        payment.setStatus("pending");
        when(paymentRepository.findById(7L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.completePayment(7L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Giao dịch chưa được xác thực");
    }
}
