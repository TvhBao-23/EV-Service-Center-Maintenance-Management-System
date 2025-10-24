package spring.api.evservicecenter.entity;

import spring.api.evservicecenter.entity.User;
import spring.api.evservicecenter.enums.StaffPosition;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "staffs")
@Getter
@Setter
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private Integer staffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false)
    private StaffPosition position;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    // --- Relationships ---

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // (Bạn có thể thêm OneToMany cho service_orders, chat_messages, service_checklists ở đây)
}