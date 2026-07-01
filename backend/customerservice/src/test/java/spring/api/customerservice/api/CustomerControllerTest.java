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
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomerControllerTest {

    private Object controller;
    private Object userRepository;
    private Object customerRepository;
    private Class<?> userRoleClass;
    private Object user;
    private Object customer;

    @BeforeEach
    void setUp() {
        userRoleClass = TestSupport.type("spring.api.customerservice.domain.UserRole");
        user = buildUser();
        customer = buildCustomer();
        userRepository = userRepositoryProxy();
        customerRepository = customerRepositoryProxy();
        controller = TestSupport.newInstance(
                "spring.api.customerservice.api.CustomerController",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.UserRepository"),
                        TestSupport.type("spring.api.customerservice.repository.CustomerRepository")
                },
                userRepository,
                customerRepository
        );
    }

    @Test
    void tc01_getProfile_shouldReturnCustomerProfile() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "getProfile",
                new Class<?>[]{Authentication.class},
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertThat(body.get("user_id")).isEqualTo(1L);
        assertThat(body.get("email")).isEqualTo("customer@example.com");
        assertThat(body.get("full_name")).isEqualTo("Nguyen Van A");
        assertThat(body.get("phone")).isEqualTo("0901234567");
        assertThat(body.get("customer_id")).isEqualTo(10L);
        assertThat(body.get("address")).isEqualTo("Ha Noi");
    }

    @Test
    void tc02_updateProfile_shouldUpdateAllFields() throws Exception {
        Map<String, String> updates = new HashMap<>();
        updates.put("full_name", "Nguyen Van B");
        updates.put("phone", "0988888888");
        updates.put("address", "Da Nang");

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "updateProfile",
                new Class<?>[]{Authentication.class, Map.class},
                authentication(user),
                updates
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(TestSupport.getProperty(user, "getFullName")).isEqualTo("Nguyen Van B");
        assertThat(TestSupport.getProperty(user, "getPhone")).isEqualTo("0988888888");
        assertThat(TestSupport.getProperty(customer, "getAddress")).isEqualTo("Da Nang");
    }

    @Test
    void tc03_updateProfile_shouldUpdateOnlyPhone() throws Exception {
        Map<String, String> updates = Map.of("phone", "0911111111");

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "updateProfile",
                new Class<?>[]{Authentication.class, Map.class},
                authentication(user),
                updates
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(TestSupport.getProperty(user, "getFullName")).isEqualTo("Nguyen Van A");
        assertThat(TestSupport.getProperty(user, "getPhone")).isEqualTo("0911111111");
        assertThat(TestSupport.getProperty(customer, "getAddress")).isEqualTo("Ha Noi");
    }

    private Authentication authentication(Object principal) {
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        return auth;
    }

    private Object buildUser() {
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

    private Object userRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.UserRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findById".equals(name)) {
                    return Optional.of(user);
                }
                if ("save".equals(name)) {
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object customerRepositoryProxy() {
        return TestSupport.proxy("spring.api.customerservice.repository.CustomerRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findByUserId".equals(name)) {
                    return Optional.of(customer);
                }
                if ("save".equals(name)) {
                    return args[0];
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
