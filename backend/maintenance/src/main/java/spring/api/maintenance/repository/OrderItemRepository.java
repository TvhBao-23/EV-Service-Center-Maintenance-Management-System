package spring.api.maintenance.repository;

import spring.api.maintenance.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Find order items by order ID
    List<OrderItem> findByOrderId(Long orderId);

    // Find order items by service ID
    List<OrderItem> findByServiceId(Long serviceId);

    // Find order items by part ID
    List<OrderItem> findByPartId(Long partId);

    // Find order items by type
    List<OrderItem> findByType(OrderItem.ItemType type);

    // Find order items by order and type
    List<OrderItem> findByOrderIdAndType(Long orderId, OrderItem.ItemType type);

    // Find order items by quantity range
    List<OrderItem> findByQuantityBetween(Integer minQuantity, Integer maxQuantity);

    // Find order items by unit price range
    List<OrderItem> findByUnitPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Find order items by total price range
    List<OrderItem> findByTotalPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Find order items with details
    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.service LEFT JOIN FETCH oi.part WHERE oi.orderId = :orderId")
    List<OrderItem> findByOrderIdWithDetails(@Param("orderId") Long orderId);

    // Find service items by order
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderId = :orderId AND oi.type = 'SERVICE'")
    List<OrderItem> findServiceItemsByOrderId(@Param("orderId") Long orderId);

    // Find part items by order
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderId = :orderId AND oi.type = 'PART'")
    List<OrderItem> findPartItemsByOrderId(@Param("orderId") Long orderId);

    // Calculate total amount for order
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.orderId = :orderId")
    BigDecimal calculateTotalAmountByOrderId(@Param("orderId") Long orderId);

    // Count order items by type
    long countByType(OrderItem.ItemType type);

    // Count order items by order
    long countByOrderId(Long orderId);

    // Count service items by order
    long countByOrderIdAndType(Long orderId, OrderItem.ItemType type);
}
