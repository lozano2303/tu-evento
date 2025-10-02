package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import TuEvento.Backend.model.CategoryEvent;
import TuEvento.Backend.model.CategoryEventId;
import java.util.List;

public interface CategoryEventRepository extends JpaRepository<CategoryEvent, CategoryEventId> {

    // Find all categories for a specific event
    @EntityGraph(attributePaths = {"category", "category.parentCategory"})
    List<CategoryEvent> findByEvent_Id(int eventId);

    // Find all events for a specific category
    List<CategoryEvent> findByCategory_CategoryID(int categoryId);

    // Check if a specific category-event relationship exists
    boolean existsByCategory_CategoryIDAndEvent_Id(int categoryId, int eventId);

    // Delete all category-event relationships for a specific event
    void deleteByEvent_Id(int eventId);

    // Delete all category-event relationships for a specific category
    void deleteByCategory_CategoryID(int categoryId);
}