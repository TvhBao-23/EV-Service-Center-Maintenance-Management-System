package spring.api.customerservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.customerservice.domain.*;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.repository.CustomerSubscriptionRepository;
import spring.api.customerservice.repository.PaymentRepository;
import spring.api.customerservice.repository.ServicePackageRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final ServicePackageRepository packageRepository;
    private final CustomerSubscriptionRepository subscriptionRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;

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

        CustomerSubscription savedSubscription = subscriptionRepository.save(subscription);

        // Create pending payment for subscription
        Payment payment = new Payment();
        payment.setSubscriptionId(savedSubscription.getSubscriptionId());
        payment.setCustomerId(customerId);
        payment.setAmount(pkg.getPrice()); // getPrice() already returns BigDecimal
        payment.setPaymentMethod(Payment.PaymentMethod.e_wallet);
        payment.setStatus(Payment.PaymentStatus.pending);
        payment.setTransactionId("SUB_" + savedSubscription.getSubscriptionId() + "_" + System.currentTimeMillis());
        payment.setNotes("Thanh toán cho gói dịch vụ: " + pkg.getName());
        Payment savedPayment = paymentRepository.save(payment);

        System.out.println(
                "[SubscriptionService] Created payment for subscription: " + savedSubscription.getSubscriptionId());
        System.out.println("[SubscriptionService] Payment ID: " + savedPayment.getPaymentId() + ", Amount: "
                + savedPayment.getAmount());

        return savedSubscription;
    }

    @Transactional
    public CustomerSubscription subscribeWithoutAuth(Long packageId) {
        // Development mode: use first customer or create new one
        Customer customer = customerRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setUserId(1L);
                    return customerRepository.save(newCustomer);
                });

        return subscribe(customer.getCustomerId(), packageId);
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
        List<CustomerSubscription> activeSubscriptions = subscriptionRepository.findByStatusAndEndDateBefore(
                SubscriptionStatus.ACTIVE,
                LocalDateTime.now());

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
