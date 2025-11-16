package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.ServicePartCategory;

import java.util.List;

@Repository
public interface ServicePartCategoryRepository extends JpaRepository<ServicePartCategory, Long> {
    
    /**
     * Find all part categories for a given service category
     */
    List<ServicePartCategory> findByServiceCategory(String serviceCategory);
    
    /**
     * Get distinct part categories for a service category, ordered by priority
     * Fixed: Include priority in SELECT to make ORDER BY compatible with DISTINCT
     */
    @Query("SELECT spc.partCategory FROM ServicePartCategory spc " +
           "WHERE spc.serviceCategory = :serviceCategory " +
           "GROUP BY spc.partCategory " +
           "ORDER BY MIN(spc.priority) ASC")
    List<String> findPartCategoriesByServiceCategory(@Param("serviceCategory") String serviceCategory);
}

