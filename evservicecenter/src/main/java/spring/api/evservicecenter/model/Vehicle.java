package spring.api.evservicecenter.model;

import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;


    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true) // Thêm cascade
    private List<ServiceOrder> serviceOrders;

    
    // ... các trường khác (vin, brand, model) và getters/setters
}