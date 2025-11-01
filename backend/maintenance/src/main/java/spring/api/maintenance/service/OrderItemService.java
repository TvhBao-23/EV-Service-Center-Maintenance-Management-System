package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.OrderItem;
import spring.api.maintenance.repository.OrderItemRepository;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderItem addServiceItem(Integer orderId, Integer serviceId, Integer quantity, Double unitPrice) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrderId(orderId);
        orderItem.setServiceId(serviceId);
        orderItem.setQuantity(quantity);
        orderItem.setUnitPrice(java.math.BigDecimal.valueOf(unitPrice));
        orderItem.setTotalPrice(java.math.BigDecimal.valueOf(quantity * unitPrice));
        orderItem.setType(OrderItem.ItemType.SERVICE);
        return orderItemRepository.save(orderItem);
    }

    public OrderItem addPartItem(Integer orderId, Integer partId, Integer quantity, Double unitPrice) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrderId(orderId);
        orderItem.setPartId(partId);
        orderItem.setQuantity(quantity);
        orderItem.setUnitPrice(java.math.BigDecimal.valueOf(unitPrice));
        orderItem.setTotalPrice(java.math.BigDecimal.valueOf(quantity * unitPrice));
        orderItem.setType(OrderItem.ItemType.PART);
        return orderItemRepository.save(orderItem);
    }

    public List<OrderItem> getOrderItemsByOrderId(Integer orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public Optional<OrderItem> getOrderItemById(Integer itemId) {
        return orderItemRepository.findById(itemId);
    }

    public OrderItem updateOrderItem(Integer itemId, Integer quantity, Double unitPrice) {
        Optional<OrderItem> optionalOrderItem = orderItemRepository.findById(itemId);
        if (optionalOrderItem.isPresent()) {
            OrderItem orderItem = optionalOrderItem.get();
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(java.math.BigDecimal.valueOf(unitPrice));
            orderItem.setTotalPrice(java.math.BigDecimal.valueOf(quantity * unitPrice));
            return orderItemRepository.save(orderItem);
        }
        throw new RuntimeException("Order item not found with ID: " + itemId);
    }

    public void deleteOrderItem(Integer itemId) {
        orderItemRepository.deleteById(itemId);
    }

    public List<OrderItem> getOrderItemsByType(Integer orderId, String type) {
        OrderItem.ItemType itemType = OrderItem.ItemType.valueOf(type.toUpperCase());
        return orderItemRepository.findByOrderIdAndType(orderId, itemType);
    }
}