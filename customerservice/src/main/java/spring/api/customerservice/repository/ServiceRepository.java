package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.customerservice.domain.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
}

