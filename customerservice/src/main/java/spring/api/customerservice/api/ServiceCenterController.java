package spring.api.customerservice.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spring.api.customerservice.domain.ServiceCenter;
import spring.api.customerservice.repository.ServiceCenterRepository;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class ServiceCenterController {
    
    private final ServiceCenterRepository serviceCenterRepository;
    
    public ServiceCenterController(ServiceCenterRepository serviceCenterRepository) {
        this.serviceCenterRepository = serviceCenterRepository;
    }
    
    @GetMapping("/service-centers")
    public List<ServiceCenter> listServiceCenters() {
        return serviceCenterRepository.findAll();
    }
}
