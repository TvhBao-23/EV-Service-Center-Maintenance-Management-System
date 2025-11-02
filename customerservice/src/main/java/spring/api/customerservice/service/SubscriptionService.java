package spring.api.customerservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.customerservice.domain.*;
import spring.api.customerservice.repository.CustomerSubscriptionRepository;
import spring.api.customerservice.repository.ServicePackageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final ServicePackageRepository packageRepository;
    private final CustomerSubscriptionRepository subscriptionRepository;
    
    public List<ServicePackage> getAllActivePackages() {
        return packageRepository.findByActiveTrue();
    }
    
    public ServicePackage getPackageById(Long packageId) {
        return packageRepository.findById(packageId)
            .orElseThrow(() -> new RuntimeException("Package not found"));
    }
    
    @Transactional
    public CustomerSubscription subscribe(Long customerId, Long packageId) {
        ServicePackage pkg = getPackageById(packageId);
        
        CustomerSubscription subscription = new CustomerSubscription();
        subscription.setCustomerId(customerId);
        subscription.setServicePackage(pkg);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(pkg.getDurationMonths()));
        subscription.setServicesUsed(0);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        
        return subscriptionRepository.save(subscription);
    }
    
    public List<CustomerSubscription> getCustomerSubscriptions(Long customerId) {
        return subscriptionRepository.findByCustomerId(customerId);
    }
    
    public List<CustomerSubscription> getActiveSubscriptions(Long customerId) {
        return subscriptionRepository.findByCustomerIdAndStatus(customerId, SubscriptionStatus.ACTIVE);
    }
    
    @Transactional
    public void useService(Long subscriptionId) {
        CustomerSubscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new RuntimeException("Subscription not found"));
        
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new RuntimeException("Subscription is not active");
        }
        
        subscription.setServicesUsed(subscription.getServicesUsed() + 1);
        
        // Check if all services are used
        if (subscription.getServicesUsed() >= subscription.getServicePackage().getServicesIncluded()) {
            subscription.setStatus(SubscriptionStatus.EXHAUSTED);
        }
        
        subscriptionRepository.save(subscription);
    }
    
    @Transactional
    public void checkAndExpireSubscriptions() {
        List<CustomerSubscription> activeSubscriptions = 
            subscriptionRepository.findByStatusAndEndDateBefore(
                SubscriptionStatus.ACTIVE, 
                LocalDateTime.now()
            );
        
        for (CustomerSubscription sub : activeSubscriptions) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);
        }
    }
    
    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        CustomerSubscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new RuntimeException("Subscription not found"));
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscriptionRepository.save(subscription);
    }
}

