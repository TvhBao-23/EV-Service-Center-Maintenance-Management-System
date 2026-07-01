package spring.api.customerservice.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import spring.api.customerservice.TestSupport;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleControllerTest {

    private Object controller;
    private Object vehicleRepository;
    private Object customerRepository;
    private Class<?> userRoleClass;
    private Object user;
    private Object customer;

    @BeforeEach
    void setUp() {
        userRoleClass = TestSupport.type("spring.api.customerservice.domain.UserRole");
        user = buildUser();
        customer = buildCustomer();
        vehicleRepository = vehicleRepositoryProxy();
        customerRepository = customerRepositoryProxy();
        controller = TestSupport.newInstance(
                "spring.api.customerservice.api.VehicleController",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.VehicleRepository"),
                        TestSupport.type("spring.api.customerservice.repository.CustomerRepository")
                },
                vehicleRepository,
                customerRepository
        );
    }

    @Test
    void tc04_createVehicle_shouldReturnSavedVehicle() throws Exception {
        Object dto = validVehicleDto();

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "createVehicle",
                new Class<?>[]{TestSupport.type("spring.api.customerservice.api.dto.VehicleDto"), Authentication.class},
                dto,
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        Object body = response.getBody();
        assertThat(TestSupport.getProperty(body, "getVehicleId")).isEqualTo(100L);
        assertThat(TestSupport.getProperty(body, "getVin")).isEqualTo("1HGCM82633A004352");
        assertThat(TestSupport.getProperty(body, "getBrand")).isEqualTo("Tesla");
        assertThat(TestSupport.getProperty(body, "getModel")).isEqualTo("Model 3");
    }

    @Test
    void tc05_createVehicle_withDuplicateVin_shouldReturnBadRequest() throws Exception {
        Object dto = validVehicleDto();
        Object duplicateVehicleRepository = vehicleRepositoryProxy(true);
        Object duplicateController = TestSupport.newInstance(
                "spring.api.customerservice.api.VehicleController",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.VehicleRepository"),
                        TestSupport.type("spring.api.customerservice.repository.CustomerRepository")
                },
                duplicateVehicleRepository,
                customerRepository
        );

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                duplicateController,
                "createVehicle",
                new Class<?>[]{TestSupport.type("spring.api.customerservice.api.dto.VehicleDto"), Authentication.class},
                dto,
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isInstanceOf(Map.class);
    }

    @Test
    void tc09_getAllVehicles_shouldReturnCustomerVehicles() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "getAllVehicles",
                new Class<?>[]{Authentication.class},
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        List<?> body = (List<?>) response.getBody();
        assertThat(body).hasSize(1);
        assertThat(TestSupport.getProperty(body.get(0), "getVehicleId")).isEqualTo(5L);
    }

    @Test
    void tc10_getAllVehicles_shouldReturnEmptyListWhenNoVehicles() throws Exception {
        customer = null;
        customerRepository = customerRepositoryProxyEmpty();
        Object emptyVehicleRepository = vehicleRepositoryProxyEmpty();
        controller = TestSupport.newInstance(
                "spring.api.customerservice.api.VehicleController",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.VehicleRepository"),
                        TestSupport.type("spring.api.customerservice.repository.CustomerRepository")
                },
                emptyVehicleRepository,
                customerRepository
        );

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "getAllVehicles",
                new Class<?>[]{Authentication.class},
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat((List<?>) response.getBody()).isEmpty();
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

    private Object validVehicleDto() {
        return TestSupport.newInstance(
                "spring.api.customerservice.api.dto.VehicleDto",
                new Class<?>[]{
                        String.class, String.class, String.class, Integer.class,
                        Double.class, Integer.class, LocalDate.class, Integer.class
                },
                "1HGCM82633A004352",
                "Tesla",
                "Model 3",
                2024,
                75.0,
                1000,
                LocalDate.of(2026, 6, 1),
                900
        );
    }

    private Object validVehicleEntity() {
        Object v = TestSupport.newInstance("spring.api.customerservice.domain.Vehicle", new Class<?>[]{});
        TestSupport.invoke(v, "setVehicleId", new Class<?>[]{Long.class}, 5L);
        TestSupport.invoke(v, "setCustomerId", new Class<?>[]{Long.class}, 10L);
        TestSupport.invoke(v, "setVin", new Class<?>[]{String.class}, "1HGCM82633A004352");
        TestSupport.invoke(v, "setBrand", new Class<?>[]{String.class}, "Tesla");
        TestSupport.invoke(v, "setModel", new Class<?>[]{String.class}, "Model 3");
        TestSupport.invoke(v, "setYear", new Class<?>[]{Integer.class}, 2024);
        return v;
    }

    private Object vehicleRepositoryProxy() {
        return vehicleRepositoryProxy(false);
    }

    private Object vehicleRepositoryProxyEmpty() {
        return TestSupport.proxy("spring.api.customerservice.repository.VehicleRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findByCustomerId".equals(name)) {
                    return List.of();
                }
                if ("findByVin".equals(name)) {
                    return Optional.empty();
                }
                if ("save".equals(name)) {
                    Object vehicle = args[0];
                    try {
                        TestSupport.invoke(vehicle, "setVehicleId", new Class<?>[]{Long.class}, 100L);
                    } catch (Exception ignored) {
                    }
                    return vehicle;
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object vehicleRepositoryProxy(boolean duplicateVin) {
        return TestSupport.proxy("spring.api.customerservice.repository.VehicleRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findByCustomerId".equals(name)) {
                    return List.of(validVehicleEntity());
                }
                if ("findByVin".equals(name)) {
                    return duplicateVin ? Optional.of(validVehicleEntity()) : Optional.empty();
                }
                if ("save".equals(name)) {
                    Object vehicle = args[0];
                    try {
                        TestSupport.invoke(vehicle, "setVehicleId", new Class<?>[]{Long.class}, 100L);
                    } catch (Exception ignored) {
                    }
                    return vehicle;
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

    private Object customerRepositoryProxyEmpty() {
        return TestSupport.proxy("spring.api.customerservice.repository.CustomerRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findByUserId".equals(name)) {
                    return Optional.empty();
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
