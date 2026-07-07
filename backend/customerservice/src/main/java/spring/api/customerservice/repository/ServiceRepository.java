package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import spring.api.customerservice.domain.Service;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    /**
     * Find all services by category
     */
    List<Service> findByCategory(String category);
    
    /**
     * Get distinct categories from services table
     */
    @Query("SELECT DISTINCT s.category FROM Service s WHERE s.category IS NOT NULL ORDER BY s.category")
    List<String> findDistinctCategories();
}

