package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.ServiceEntity;
import spring.api.maintenance.repository.ServiceRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    public Optional<ServiceEntity> getServiceById(Integer serviceId) {
        return serviceRepository.findById(serviceId);
    }

    public ServiceEntity createService(ServiceEntity service) {
        return serviceRepository.save(service);
    }

    public ServiceEntity updateService(Integer serviceId, ServiceEntity serviceDetails) {
        Optional<ServiceEntity> optionalService = serviceRepository.findById(serviceId);
        if (optionalService.isPresent()) {
            ServiceEntity service = optionalService.get();
            service.setName(serviceDetails.getName());
            service.setDescription(serviceDetails.getDescription());
            service.setEstimatedDurationMinutes(serviceDetails.getEstimatedDurationMinutes());
            service.setBasePrice(serviceDetails.getBasePrice());
            service.setType(serviceDetails.getType());
            service.setIsPackage(serviceDetails.getIsPackage());
            service.setValidityDays(serviceDetails.getValidityDays());
            return serviceRepository.save(service);
        }
        throw new RuntimeException("Service not found with ID: " + serviceId);
    }

    public List<ServiceEntity> getServicesByType(String type) {
        return serviceRepository.findByType(type);
    }

    public List<ServiceEntity> getPackageServices() {
        return serviceRepository.findByIsPackageTrue();
    }

    public List<ServiceEntity> searchServicesByName(String name) {
        return serviceRepository.findByNameContainingIgnoreCase(name);
    }
}
