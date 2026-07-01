package spring.api.customerservice.api.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import spring.api.customerservice.TestSupport;

import java.lang.reflect.Constructor;
import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleDtoValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDownValidator() {
        if (factory != null) {
            factory.close();
        }
    }

    @Test
    void tc06_vinWithInvalidLength_shouldHaveVinViolation() throws Exception {
        Object dto = buildDto("123", "Tesla", "Model Y", 2024);
        Set<ConstraintViolation<Object>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> "vin".equals(v.getPropertyPath().toString()));
    }

    @Test
    void tc07_missingRequiredFields_shouldHaveBrandAndModelViolations() throws Exception {
        Object dto = buildDto("1HGCM82633A004352", null, "", 2024);
        Set<ConstraintViolation<Object>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> "brand".equals(v.getPropertyPath().toString()));
        assertThat(violations).anyMatch(v -> "model".equals(v.getPropertyPath().toString()));
    }

    @Test
    void tc08_yearBelowMinimum_shouldHaveYearViolation() throws Exception {
        Object dto = buildDto("1HGCM82633A004352", "Tesla", "Model 3", 1999);
        Set<ConstraintViolation<Object>> violations = validator.validate(dto);
        assertThat(violations).anyMatch(v -> "year".equals(v.getPropertyPath().toString()));
    }

    private Object buildDto(String vin, String brand, String model, Integer year) throws Exception {
        Class<?> dtoClass = TestSupport.type("spring.api.customerservice.api.dto.VehicleDto");
        Constructor<?> ctor = dtoClass.getDeclaredConstructor(
                String.class, String.class, String.class, Integer.class,
                Double.class, Integer.class, LocalDate.class, Integer.class
        );
        return ctor.newInstance(
                vin,
                brand,
                model,
                year,
                75.0,
                1000,
                LocalDate.of(2026, 6, 1),
                900
        );
    }
}
