package spring.api.customerservice.api;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import spring.api.customerservice.TestSupport;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    @Test
    void invalidOdometerType_shouldBeMappedToBadRequest() throws Exception {
        Object handler = TestSupport.newInstance("spring.api.customerservice.api.GlobalExceptionHandler", new Class<?>[]{});
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) TestSupport.invoke(
                handler,
                "handleIllegalArgument",
                new Class<?>[]{IllegalArgumentException.class},
                new IllegalArgumentException("odometerKm phải là số")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("error", "Bad Request");
        assertThat(response.getBody()).containsEntry("message", "odometerKm phải là số");
    }

    @Test
    void resourceNotFound_shouldBeMappedToNotFound() throws Exception {
        Object handler = TestSupport.newInstance("spring.api.customerservice.api.GlobalExceptionHandler", new Class<?>[]{});
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) TestSupport.invoke(
                handler,
                "handleResourceNotFound",
                new Class<?>[]{ResourceNotFoundException.class},
                new ResourceNotFoundException("Xe không tồn tại")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("error", "Not Found");
        assertThat(response.getBody()).containsEntry("message", "Xe không tồn tại");
    }
}
