package spring.api.evservicecenter.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "service_orders")
public class ServiceOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "decimal_total_price")
    private BigDecimal totalPrice;

    

    // ... các trường khác (status, check_in_time) và getters/setters
}
