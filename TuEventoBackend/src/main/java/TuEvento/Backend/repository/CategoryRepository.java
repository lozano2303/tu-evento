package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.Category;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // Find all root categories (those without parent)
    List<Category> findByParentCategoryIsNull();

    // Find subcategories of a parent category
    List<Category> findByParentCategory_CategoryID(Integer parentId);

    // Find category by name
    List<Category> findByNameContainingIgnoreCase(String name);
}