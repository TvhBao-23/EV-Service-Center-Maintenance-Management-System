package spring.api.evservicecenter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import spring.api.evservicecenter.dto.CustomerAdminViewDto;
import spring.api.evservicecenter.model.Customer;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Lấy danh sách khách hàng và thông tin tổng hợp cho trang Admin.
     * Sử dụng các subquery (truy vấn con) để đếm số xe, số đơn hàng
     * và tính tổng chi phí cho mỗi khách hàng.
     */
    @Query("SELECT new com.example.project.dto.CustomerAdminViewDto(" +
           "c.customerId, " +
           "u.name, " +
           "u.email, " +
           "(SELECT COUNT(v.id) FROM Vehicle v WHERE v.customer.id = c.id), " +
           "(SELECT COUNT(so.id) FROM ServiceOrder so WHERE so.customer.id = c.id), " +
           "COALESCE((SELECT SUM(so.totalPrice) FROM ServiceOrder so WHERE so.customer.id = c.id), 0.0)) " +
           "FROM Customer c JOIN c.user u")
    List<CustomerAdminViewDto> findCustomerAdminView();
}