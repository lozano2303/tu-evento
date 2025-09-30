package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // Find all root categories (those without parent)
    List<Category> findByParentCategoryIsNull();

    // Find subcategories of a parent category
    List<Category> findByParentCategory_CategoryID(Integer parentId);

    // Find category by name
    List<Category> findByNameContainingIgnoreCase(String name);

    // MÉTODOS AÑADIDOS PARA OPTIMIZAR EL INICIALIZADOR Y EVITAR DUPLICADOS

    //Busca una Categoría Padre por nombre, asegurando que no tenga padre (es raíz).

    Optional<Category> findByNameIgnoreCaseAndParentCategoryIsNull(String name);

    //Verifica eficientemente si ya existe una subcategoría con un nombre específico

    boolean existsByNameIgnoreCaseAndParentCategory(String name, Category parentCategory);
}