package spring.api.customerservice.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import spring.api.customerservice.TestSupport;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class TrackingControllerTest {

    private Object controller;
    private Object customer;

    @BeforeEach
    void setUp() {
        customer = buildCustomer();
        controller = TestSupport.newInstance(
                "spring.api.customerservice.api.TrackingController",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.service.AppointmentService"),
                        TestSupport.type("spring.api.customerservice.repository.CustomerRepository")
                },
                realAppointmentService(),
                customerRepositoryProxy()
        );
    }

    @Test
    void tc23_getAppointmentHistory_withoutToken_shouldReturnUnauthorized() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "getAppointmentHistory",
                new Class<?>[]{Authentication.class},
                new Object[]{null}
        );

        assertThat(response.getStatusCode().value()).isEqualTo(401);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void tc23_getAppointmentHistory_withToken_shouldReturnCompletedAndCancelledAppointments() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "getAppointmentHistory",
                new Class<?>[]{Authentication.class},
                authentication(buildUser())
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isInstanceOf(List.class);
        assertThat((List<?>) response.getBody()).hasSize(1);
    }

    @Test
    void tc24_trackAppointment_withToken_shouldReturnAppointment() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "trackAppointment",
                new Class<?>[]{Authentication.class, Long.class},
                authentication(buildUser()),
                101L
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
    }

    private Object realAppointmentService() {
        return TestSupport.newInstance(
                "spring.api.customerservice.service.AppointmentService",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.AppointmentRepository"),
                        TestSupport.type("spring.api.customerservice.repository.PaymentRepository"),
                        TestSupport.type("spring.api.customerservice.repository.ServiceRepository"),
                        TestSupport.type("spring.api.customerservice.repository.ServiceCenterRepository")
                },
                appointmentRepositoryProxy(),
                paymentRepositoryProxy(),
                serviceRepositoryProxy(),
                serviceCenterRepositoryProxy()
        );
    }

    private Object appointmentRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.AppointmentRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findByCustomerIdAndStatusIn".equals(name)) {
                    return List.of(buildAppointment(201L, 10L, "completed"));
                }
                if ("findByAppointmentIdAndCustomerId".equals(name)) {
                    return Optional.of(buildAppointment(101L, 10L, "pending"));
                }
                if ("findByCustomerId".equals(name)) {
                    return List.of(buildAppointment(201L, 10L, "completed"));
                }
                if ("findById".equals(name)) {
                    return Optional.of(buildAppointment(101L, 10L, "pending"));
                }
                if ("save".equals(name)) {
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object paymentRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.PaymentRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("existsByAppointmentIdAndStatus".equals(method.getName())) {
                    return false;
                }
                if ("save".equals(method.getName())) {
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object serviceRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.ServiceRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object serviceCenterRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.ServiceCenterRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("existsById".equals(method.getName())) {
                    return true;
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object customerRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.CustomerRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("findByUserId".equals(method.getName())) {
                    return Optional.of(customer);
                }
                if ("save".equals(method.getName())) {
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object buildUser() {
        Class<?> userRoleClass = TestSupport.type("spring.api.customerservice.domain.UserRole");
        Object u = TestSupport.newInstance("spring.api.customerservice.domain.User", new Class<?>[]{});
        TestSupport.invoke(u, "setUserId", new Class<?>[]{Long.class}, 1L);
        TestSupport.invoke(u, "setEmail", new Class<?>[]{String.class}, "customer@example.com");
        TestSupport.invoke(u, "setPassword", new Class<?>[]{String.class}, "secret");
        TestSupport.invoke(u, "setFullName", new Class<?>[]{String.class}, "Nguyen Van A");
        TestSupport.invoke(u, "setPhone", new Class<?>[]{String.class}, "0901234567");
        TestSupport.invoke(u, "setRole", new Class<?>[]{userRoleClass}, Enum.valueOf((Class<Enum>) userRoleClass, "customer"));
        TestSupport.invoke(u, "setCreatedAt", new Class<?>[]{LocalDateTime.class}, LocalDateTime.now());
        TestSupport.invoke(u, "setUpdatedAt", new Class<?>[]{LocalDateTime.class}, LocalDateTime.now());
        return u;
    }

    private Object buildCustomer() {
        Object c = TestSupport.newInstance("spring.api.customerservice.domain.Customer", new Class<?>[]{});
        TestSupport.invoke(c, "setCustomerId", new Class<?>[]{Long.class}, 10L);
        TestSupport.invoke(c, "setUserId", new Class<?>[]{Long.class}, 1L);
        TestSupport.invoke(c, "setAddress", new Class<?>[]{String.class}, "Ha Noi");
        TestSupport.invoke(c, "setCreatedAt", new Class<?>[]{LocalDateTime.class}, LocalDateTime.now());
        TestSupport.invoke(c, "setUpdatedAt", new Class<?>[]{LocalDateTime.class}, LocalDateTime.now());
        return c;
    }

    private Object buildAppointment(Long appointmentId, Long customerId, String statusName) {
        Object a = TestSupport.newInstance("spring.api.customerservice.domain.Appointment", new Class<?>[]{});
        TestSupport.invoke(a, "setAppointmentId", new Class<?>[]{Long.class}, appointmentId);
        TestSupport.invoke(a, "setCustomerId", new Class<?>[]{Long.class}, customerId);
        TestSupport.invoke(a, "setVehicleId", new Class<?>[]{Long.class}, 5L);
        TestSupport.invoke(a, "setServiceId", new Class<?>[]{Long.class}, 1L);
        TestSupport.invoke(a, "setCenterId", new Class<?>[]{Long.class}, 1L);
        TestSupport.invoke(a, "setAppointmentDate", new Class<?>[]{LocalDateTime.class}, LocalDateTime.parse("2026-07-10T09:00:00"));
        TestSupport.invoke(a, "setNotes", new Class<?>[]{String.class}, "Bao duong xe");
        TestSupport.invoke(a, "setStatus", new Class<?>[]{TestSupport.type("spring.api.customerservice.domain.AppointmentStatus")},
                Enum.valueOf((Class<Enum>) TestSupport.type("spring.api.customerservice.domain.AppointmentStatus"), statusName));
        return a;
    }

    private Authentication authentication(Object principal) {
        return (Authentication) Proxy.newProxyInstance(
                Authentication.class.getClassLoader(),
                new Class<?>[]{Authentication.class},
                (proxy, method, args) -> {
                    if ("getPrincipal".equals(method.getName())) {
                        return principal;
                    }
                    return defaultValue(method.getReturnType());
                }
        );
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
