package spring.api.customerservice.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spring.api.customerservice.domain.ServiceItem;
import spring.api.customerservice.repository.ServiceRepository;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class ServiceController {
    
    private final ServiceRepository serviceRepository;
    
    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    
    @GetMapping("/services")
    public List<ServiceItem> listServices() {
        return serviceRepository.findAll();
    }
}
