package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.customerservice.domain.ServiceCenter;

public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, Integer> {
}


