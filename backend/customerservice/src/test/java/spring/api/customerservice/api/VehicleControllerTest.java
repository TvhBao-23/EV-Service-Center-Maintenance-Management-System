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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VehicleControllerTest {

    private Object controller;
    private Object customerRepository;
    private Class<?> userRoleClass;
    private Object user;
    private Object customer;

    @BeforeEach
    void setUp() {
        userRoleClass = TestSupport.type("spring.api.customerservice.domain.UserRole");
        user = buildUser();
        customer = buildCustomer();
        customerRepository = customerRepositoryProxy();
        controller = newController(vehicleRepositoryProxyForExistingId(), customerRepository);
    }

    @Test
    void tc04_createVehicle_shouldReturnSavedVehicle() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "createVehicle",
                new Class<?>[]{TestSupport.type("spring.api.customerservice.api.dto.VehicleDto"), Authentication.class},
                validVehicleDto(),
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(TestSupport.getProperty(response.getBody(), "getVehicleId")).isEqualTo(100L);
        assertThat(TestSupport.getProperty(response.getBody(), "getVin")).isEqualTo("1HGCM82633A004352");
        assertThat(TestSupport.getProperty(response.getBody(), "getBrand")).isEqualTo("Tesla");
        assertThat(TestSupport.getProperty(response.getBody(), "getModel")).isEqualTo("Model 3");
    }

    @Test
    void tc05_createVehicle_withDuplicateVin_shouldReturnBadRequest() throws Exception {
        Object duplicateController = newController(vehicleRepositoryProxyDuplicateVin(), customerRepository);

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                duplicateController,
                "createVehicle",
                new Class<?>[]{TestSupport.type("spring.api.customerservice.api.dto.VehicleDto"), Authentication.class},
                validVehicleDto(),
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
        Object emptyController = newController(vehicleRepositoryProxyEmpty(), customerRepositoryProxyEmpty());

        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                emptyController,
                "getAllVehicles",
                new Class<?>[]{Authentication.class},
                authentication(user)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat((List<?>) response.getBody()).isEmpty();
    }

    @Test
    void tc15_getAllVehicles_withoutToken_shouldReturnUnauthorized() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "getAllVehicles",
                new Class<?>[]{Authentication.class},
                authentication(null)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(401);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void tc16_createVehicle_withoutToken_shouldReturnUnauthorized() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "createVehicle",
                new Class<?>[]{TestSupport.type("spring.api.customerservice.api.dto.VehicleDto"), Authentication.class},
                validVehicleDto(),
                authentication(null)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(401);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void tc17_updateVehicle_shouldReturnUpdatedVehicle() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "updateVehicle",
                new Class<?>[]{Long.class, TestSupport.type("spring.api.customerservice.api.dto.VehicleDto")},
                5L,
                updatedVehicleDto()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(TestSupport.getProperty(response.getBody(), "getVin")).isEqualTo("1HGCM82633A004399");
        assertThat(TestSupport.getProperty(response.getBody(), "getModel")).isEqualTo("Model Y");
        assertThat(TestSupport.getProperty(response.getBody(), "getYear")).isEqualTo(2025);
    }

    @Test
    void tc18_updateVehicle_whenNotFound_shouldThrowNotFound() {
        Object notFoundController = newController(vehicleRepositoryProxyNotFound(), customerRepository);

        assertThatThrownBy(() -> TestSupport.invoke(
                notFoundController,
                "updateVehicle",
                new Class<?>[]{Long.class, TestSupport.type("spring.api.customerservice.api.dto.VehicleDto")},
                999999L,
                validVehicleDto()
        )).hasMessageContaining("Xe không tồn tại");
    }

    @Test
    void tc19_patchVehicle_shouldUpdateOdometer() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "patchVehicle",
                new Class<?>[]{Long.class, Map.class},
                5L,
                Map.of("odometerKm", 2000)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(TestSupport.getProperty(response.getBody(), "getOdometerKm")).isEqualTo(2000);
    }

    @Test
    void tc20_patchVehicle_withInvalidOdometerType_shouldThrowBadRequest() {
        assertThatThrownBy(() -> TestSupport.invoke(
                controller,
                "patchVehicle",
                new Class<?>[]{Long.class, Map.class},
                5L,
                Map.of("odometerKm", "hai nghin")
        )).hasMessageContaining("odometerKm phải là số");
    }

    @Test
    void tc21_deleteVehicle_shouldReturnSuccess() throws Exception {
        ResponseEntity<?> response = (ResponseEntity<?>) TestSupport.invoke(
                controller,
                "deleteVehicle",
                new Class<?>[]{Long.class},
                5L
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isInstanceOf(Map.class);
        assertThat(((Map<?, ?>) response.getBody()).get("message").toString()).contains("Xóa xe thành công");
    }

    private Object newController(Object vehicleRepository, Object customerRepository) {
        return TestSupport.newInstance(
                "spring.api.customerservice.api.VehicleController",
                new Class<?>[]{
                        TestSupport.type("spring.api.customerservice.repository.VehicleRepository"),
                        TestSupport.type("spring.api.customerservice.repository.CustomerRepository")
                },
                vehicleRepository,
                customerRepository
        );
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

    private Object updatedVehicleDto() {
        return TestSupport.newInstance(
                "spring.api.customerservice.api.dto.VehicleDto",
                new Class<?>[]{
                        String.class, String.class, String.class, Integer.class,
                        Double.class, Integer.class, LocalDate.class, Integer.class
                },
                "1HGCM82633A004399",
                "Tesla",
                "Model Y",
                2025,
                82.0,
                1500,
                LocalDate.of(2026, 6, 1),
                1200
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
        TestSupport.invoke(v, "setOdometerKm", new Class<?>[]{Integer.class}, 1000);
        return v;
    }

    private Object vehicleRepositoryProxyForExistingId() {
        return TestSupport.proxy("spring.api.customerservice.repository.VehicleRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findById".equals(name)) {
                    return Optional.of(validVehicleEntity());
                }
                if ("findByCustomerId".equals(name)) {
                    return List.of(validVehicleEntity());
                }
                if ("findByVin".equals(name)) {
                    return Optional.empty();
                }
                if ("save".equals(name)) {
                    if (args[0] != null) {
                        TestSupport.invoke(args[0], "setVehicleId", new Class<?>[]{Long.class}, 100L);
                    }
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object vehicleRepositoryProxyDuplicateVin() {
        return TestSupport.proxy("spring.api.customerservice.repository.VehicleRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("findByCustomerId".equals(name)) {
                    return List.of(validVehicleEntity());
                }
                if ("findByVin".equals(name)) {
                    return Optional.of(validVehicleEntity());
                }
                if ("save".equals(name)) {
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
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
                    return args[0];
                }
                return defaultValue(method.getReturnType());
            }
        });
    }

    private Object vehicleRepositoryProxyNotFound() {
        return TestSupport.proxy("spring.api.customerservice.repository.VehicleRepository", new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("findById".equals(method.getName())) {
                    return Optional.empty();
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
