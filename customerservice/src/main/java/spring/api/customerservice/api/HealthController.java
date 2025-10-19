package spring.api.customerservice.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {
    @GetMapping({"/health", "/actuator/health/simple"})
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}


