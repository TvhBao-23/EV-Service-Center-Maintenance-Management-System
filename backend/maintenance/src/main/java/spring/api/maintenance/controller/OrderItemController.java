package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.OrderItem;
import spring.api.maintenance.service.OrderItemService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/service-orders/{orderId}/items")
@CrossOrigin(origins = "*")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    /**
     * Thêm dịch vụ vào phiếu
     */
    @PostMapping("/service")
    public ResponseEntity<?> addServiceItem(@PathVariable Integer orderId,
            @RequestBody ServiceItemRequest request) {
        try {
            OrderItem orderItem = orderItemService.addServiceItem(orderId, request.getServiceId(),
                    request.getQuantity(), request.getUnitPrice());
            return ResponseEntity.status(HttpStatus.CREATED).body(orderItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error adding service item: " + e.getMessage());
        }
    }

    /**
     * Thêm phụ tùng vào phiếu
     */
    @PostMapping("/part")
    public ResponseEntity<?> addPartItem(@PathVariable Integer orderId,
            @RequestBody PartItemRequest request) {
        try {
            OrderItem orderItem = orderItemService.addPartItem(orderId, request.getPartId(),
                    request.getQuantity(), request.getUnitPrice());
            return ResponseEntity.status(HttpStatus.CREATED).body(orderItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error adding part item: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách items trong phiếu
     */
    @GetMapping
    public ResponseEntity<?> getOrderItems(@PathVariable Integer orderId) {
        try {
            List<OrderItem> orderItems = orderItemService.getOrderItemsByOrderId(orderId);
            return ResponseEntity.ok(orderItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving order items: " + e.getMessage());
        }
    }

    /**
     * Lấy item theo ID
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<?> getOrderItemById(@PathVariable Integer orderId, @PathVariable Integer itemId) {
        try {
            Optional<OrderItem> orderItem = orderItemService.getOrderItemById(itemId);
            if (orderItem.isPresent()) {
                return ResponseEntity.ok(orderItem.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Order item not found with ID: " + itemId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving order item: " + e.getMessage());
        }
    }

    /**
     * Cập nhật item
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateOrderItem(@PathVariable Integer orderId,
            @PathVariable Integer itemId,
            @RequestBody OrderItemUpdateRequest request) {
        try {
            OrderItem orderItem = orderItemService.updateOrderItem(itemId, request.getQuantity(),
                    request.getUnitPrice());
            return ResponseEntity.ok(orderItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating order item: " + e.getMessage());
        }
    }

    /**
     * Xóa item
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteOrderItem(@PathVariable Integer orderId, @PathVariable Integer itemId) {
        try {
            orderItemService.deleteOrderItem(itemId);
            return ResponseEntity.ok("Order item deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting order item: " + e.getMessage());
        }
    }

    /**
     * Lấy items theo loại
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getOrderItemsByType(@PathVariable Integer orderId, @PathVariable String type) {
        try {
            List<OrderItem> orderItems = orderItemService.getOrderItemsByType(orderId, type);
            return ResponseEntity.ok(orderItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving order items: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class ServiceItemRequest {
        private Integer serviceId;
        private Integer quantity;
        private Double unitPrice;

        public Integer getServiceId() {
            return serviceId;
        }

        public void setServiceId(Integer serviceId) {
            this.serviceId = serviceId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }
    }

    public static class PartItemRequest {
        private Integer partId;
        private Integer quantity;
        private Double unitPrice;

        public Integer getPartId() {
            return partId;
        }

        public void setPartId(Integer partId) {
            this.partId = partId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }
    }

    public static class OrderItemUpdateRequest {
        private Integer quantity;
        private Double unitPrice;

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}