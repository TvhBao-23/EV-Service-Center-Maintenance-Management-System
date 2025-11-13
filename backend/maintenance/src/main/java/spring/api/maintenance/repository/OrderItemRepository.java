package spring.api.maintenance.repository;

import spring.api.maintenance.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository cho OrderItem entity
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    /**
     * Tìm các hạng mục theo phiếu bảo dưỡng
     */
    List<OrderItem> findByOrderId(Integer orderId);

    /**
     * Tìm các hạng mục theo dịch vụ
     */
    List<OrderItem> findByServiceId(Integer serviceId);

    /**
     * Tìm các hạng mục theo phụ tùng
     */
    List<OrderItem> findByPartId(Integer partId);

    /**
     * Tìm các hạng mục theo loại
     */
    List<OrderItem> findByType(OrderItem.ItemType type);

    /**
     * Tìm các hạng mục theo phiếu và loại
     */
    List<OrderItem> findByOrderIdAndType(Integer orderId, OrderItem.ItemType type);

    /**
     * Tìm các hạng mục dịch vụ của một phiếu
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderId = :orderId AND oi.type = 'SERVICE'")
    List<OrderItem> findServiceItemsByOrderId(@Param("orderId") Integer orderId);

    /**
     * Tìm các hạng mục phụ tùng của một phiếu
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderId = :orderId AND oi.type = 'PART'")
    List<OrderItem> findPartItemsByOrderId(@Param("orderId") Integer orderId);

    /**
     * Tính tổng giá trị của một phiếu bảo dưỡng
     */
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.orderId = :orderId")
    Double calculateTotalByOrderId(@Param("orderId") Integer orderId);

    /**
     * Đếm số hạng mục theo phiếu
     */
    long countByOrderId(Integer orderId);
}