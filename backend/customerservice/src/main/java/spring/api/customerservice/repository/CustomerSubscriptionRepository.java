package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.customerservice.domain.CustomerSubscription;
import spring.api.customerservice.domain.SubscriptionStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerSubscriptionRepository extends JpaRepository<CustomerSubscription, Long> {
    List<CustomerSubscription> findByCustomerId(Long customerId);
    
    List<CustomerSubscription> findByCustomerIdAndStatus(Long customerId, SubscriptionStatus status);
    
    List<CustomerSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime date);
}

