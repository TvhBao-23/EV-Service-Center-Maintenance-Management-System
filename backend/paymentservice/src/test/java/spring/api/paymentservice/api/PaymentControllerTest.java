package spring.api.paymentservice.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import spring.api.paymentservice.domain.Payment;
import spring.api.paymentservice.domain.User;
import spring.api.paymentservice.domain.UserRole;
import spring.api.paymentservice.repository.PaymentRepository;
import spring.api.paymentservice.service.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentService paymentService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PaymentController paymentController;

    private User customerUser;
    private User adminUser;
    private Payment payment;

    @BeforeEach
    void setUp() {
        customerUser = new User();
        customerUser.setUserId(10L);
        customerUser.setRole(UserRole.customer);

        adminUser = new User();
        adminUser.setUserId(99L);
        adminUser.setRole(UserRole.admin);

        payment = new Payment();
        payment.setPaymentId(100L);
        payment.setAppointmentId(200L);
        payment.setCustomerId(10L);
        payment.setAmount(new BigDecimal("1500.00"));
        payment.setPaymentMethod("card");
        payment.setStatus("pending");
        payment.setVerificationCode("123456");
        payment.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(5));
        payment.setVerified(false);
    }

    @Test
    void initiatePayment_asCustomer_setsCustomerIdFromUserAndReturnsResponse() {
        when(authentication.getPrincipal()).thenReturn(customerUser);
        when(paymentRepository.findCustomerIdByUserId(customerUser.getUserId())).thenReturn(Optional.of(10L));
        when(paymentService.initiatePayment(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment request = new Payment();
        request.setAppointmentId(200L);
        request.setPaymentMethod("card");
        request.setAmount(new BigDecimal("1500.00"));

        ResponseEntity<?> response = paymentController.initiatePayment(request, authentication);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(((Map<?, ?>) response.getBody()).get("payment_id")).isEqualTo(request.getPaymentId());
    }

    @Test
    void initiatePayment_unauthorizedWhenAuthMissing() {
        ResponseEntity<?> response = paymentController.initiatePayment(payment, null);

        assertThat(response.getStatusCodeValue()).isEqualTo(401);
        assertThat(((Map<?, ?>) response.getBody()).get("error")).isEqualTo("Unauthorized");
    }

    @Test
    void verifyPayment_successfulVerificationReturnsPayment() {
        when(paymentService.verifyPayment(100L, "123456")).thenReturn(true);
        when(paymentService.completePayment(100L)).thenReturn(payment);

        ResponseEntity<?> response = paymentController.verifyPayment(Map.of("paymentId", 100, "verificationCode", "123456"), authentication);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(((Map<?, ?>) response.getBody()).get("message")).isEqualTo("Xác thực thành công. Đang xử lý thanh toán");
        assertThat(((Map<?, ?>) response.getBody()).get("payment")).isEqualTo(payment);
    }

    @Test
    void verifyPayment_returnsErrorForInvalidCode() {
        when(paymentService.verifyPayment(100L, "000000")).thenReturn(false);

        ResponseEntity<?> response = paymentController.verifyPayment(Map.of("paymentId", 100, "verificationCode", "000000"), authentication);

        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        assertThat(((Map<?, ?>) response.getBody()).get("error")).isEqualTo("Mã xác thực không đúng");
    }

    @Test
    void getPayment_returnsPaymentForAdmin() {
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(paymentRepository.findById(100L)).thenReturn(Optional.of(payment));

        ResponseEntity<?> response = paymentController.getPayment(100L, authentication);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(payment);
    }

    @Test
    void getMyPayments_returnsPaymentsForCustomer() {
        when(authentication.getPrincipal()).thenReturn(customerUser);
        when(paymentRepository.findCustomerIdByUserId(customerUser.getUserId())).thenReturn(Optional.of(10L));
        when(paymentRepository.findByCustomerIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(payment));

        ResponseEntity<?> response = paymentController.getMyPayments(authentication);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(List.of(payment));
    }

    @Test
    void getPaymentByAppointment_returnsMessageWhenNoPaymentExists() {
        when(paymentRepository.findByAppointmentId(300L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = paymentController.getPaymentByAppointment(300L, authentication);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(((Map<?, ?>) response.getBody()).get("message")).isEqualTo("Chưa có thanh toán cho lịch hẹn này");
    }
}
