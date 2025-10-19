package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.customerservice.domain.ServiceItem;

public interface ServiceRepository extends JpaRepository<ServiceItem, Integer> {
}
