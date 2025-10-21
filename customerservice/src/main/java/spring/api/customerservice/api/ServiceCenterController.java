package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.ServiceCenter;
import spring.api.customerservice.repository.ServiceCenterRepository;

import java.util.List;

@RestController
@RequestMapping("/api/customer/service-centers")
@RequiredArgsConstructor
public class ServiceCenterController {

    private final ServiceCenterRepository serviceCenterRepository;

    @GetMapping
    public ResponseEntity<List<ServiceCenter>> getAllServiceCenters() {
        return ResponseEntity.ok(serviceCenterRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceCenter(@PathVariable Long id) {
        ServiceCenter center = serviceCenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service center not found"));
        return ResponseEntity.ok(center);
    }
}

