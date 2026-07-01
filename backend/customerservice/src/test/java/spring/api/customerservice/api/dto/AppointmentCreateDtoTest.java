package spring.api.customerservice.api.dto;

import org.junit.jupiter.api.Test;
import spring.api.customerservice.TestSupport;

import java.time.format.DateTimeParseException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AppointmentCreateDtoTest {

    @Test
    void tc13_invalidAppointmentDateFormat_shouldThrowDateTimeParseException() {
        Object dto = TestSupport.newInstance("spring.api.customerservice.api.dto.AppointmentCreateDto", new Class<?>[]{});
        TestSupport.invoke(dto, "setAppointmentDate", new Class<?>[]{String.class}, "01/07/2026 09:00");

        assertThatThrownBy(() -> TestSupport.invoke(dto, "getAppointmentDateAsLocalDateTime", new Class<?>[]{}))
                .hasCauseInstanceOf(DateTimeParseException.class);
    }
}
