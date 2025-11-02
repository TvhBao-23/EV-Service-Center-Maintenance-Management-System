package spring.api.customerservice.domain;

public enum SubscriptionStatus {
    ACTIVE,      // Currently active
    EXPIRED,     // Expired by time
    EXHAUSTED,   // All services used
    CANCELLED    // Cancelled by user
}

