package spring.api.customerservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import spring.api.customerservice.TestSupport;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AppointmentServiceTest {

    private Object appointmentRepository;
    private Object paymentRepository;
    private Object serviceRepository;
    private Object serviceCenterRepository;
    private Object service;

    @BeforeEach
    void setUp() {
        appointmentRepository = appointmentRepositoryProxy();
        paymentRepository = paymentRepositoryProxy();
        serviceRepository = serviceRepositoryProxy();
        serviceCenterRepository = serviceCenterRepositoryProxy(true);
        service = TestSupport.newInstance(
                "spring.api.customerservice.service.AppointmentService",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.AppointmentRepository"),
                        TestSupport.type("spring.api.customerservice.repository.PaymentRepository"),
                        TestSupport.type("spring.api.customerservice.repository.ServiceRepository"),
                        TestSupport.type("spring.api.customerservice.repository.ServiceCenterRepository")
                },
                appointmentRepository,
                paymentRepository,
                serviceRepository,
                serviceCenterRepository
        );
    }

    @Test
    void tc11_createAppointment_shouldSavePendingAppointment() throws Exception {
        Object appointment = TestSupport.invoke(
                service,
                "createAppointment",
                new Class<?>[]{Long.class, Long.class, Long.class, Long.class, LocalDateTime.class, String.class},
                1L,
                2L,
                5L,
                3L,
                LocalDateTime.parse("2026-07-01T09:00:00"),
                "Bao duong xe"
        );

        assertThat(TestSupport.getProperty(appointment, "getCustomerId")).isEqualTo(1L);
        assertThat(TestSupport.getProperty(appointment, "getVehicleId")).isEqualTo(2L);
        assertThat(TestSupport.getProperty(appointment, "getServiceId")).isEqualTo(5L);
        assertThat(TestSupport.getProperty(appointment, "getCenterId")).isEqualTo(3L);
        assertThat(TestSupport.getProperty(appointment, "getStatus").toString()).isEqualTo("pending");
    }

    @Test
    void tc12_createAppointment_withInvalidCenter_shouldThrow() {
        serviceCenterRepository = serviceCenterRepositoryProxy(false);
        service = TestSupport.newInstance(
                "spring.api.customerservice.service.AppointmentService",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.AppointmentRepository"),
                        TestSupport.type("spring.api.customerservice.repository.PaymentRepository"),
                        TestSupport.type("spring.api.customerservice.repository.ServiceRepository"),
                        TestSupport.type("spring.api.customerservice.repository.ServiceCenterRepository")
                },
                appointmentRepository,
                paymentRepository,
                serviceRepository,
                serviceCenterRepository
        );

        assertThatThrownBy(() -> TestSupport.invoke(
                service,
                "createAppointment",
                new Class<?>[]{Long.class, Long.class, Long.class, Long.class, LocalDateTime.class, String.class},
                1L,
                2L,
                5L,
                999999L,
                LocalDateTime.parse("2026-07-02T10:00:00"),
                "Test center khong ton tai"
        )).hasMessageContaining("Trung tam dich vu khong ton tai");
    }

    private Object appointmentRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.AppointmentRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("save".equals(method.getName())) {
                    Object appointment = args[0];
                    try {
                        TestSupport.invoke(appointment, "setAppointmentId", new Class<?>[]{Long.class}, 99L);
                    } catch (Exception ignored) {
                    }
                    return appointment;
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object paymentRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.PaymentRepository", (proxy, method, args) -> defaultValue(method.getReturnType()));
    }

    private Object serviceRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.ServiceRepository", (proxy, method, args) -> defaultValue(method.getReturnType()));
    }

    private Object serviceCenterRepositoryProxy(boolean exists) {
        return TestSupport.proxy("spring.api.customerservice.repository.ServiceCenterRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("existsById".equals(method.getName())) {
                    return exists;
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object defaultValue(Class<?> returnType) {
        if (!returnType.isPrimitive()) {
            return null;
        }
        if (returnType == boolean.class) return false;
        if (returnType == byte.class) return (byte) 0;
        if (returnType == short.class) return (short) 0;
        if (returnType == int.class) return 0;
        if (returnType == long.class) return 0L;
        if (returnType == float.class) return 0f;
        if (returnType == double.class) return 0d;
        if (returnType == char.class) return '\0';
        return null;
    }
}
