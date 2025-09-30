package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.Category;
import TuEvento.Backend.repository.CategoryRepository;
import java.util.Optional; // Necesario para la búsqueda Optional

@Component
public class CategoryDataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    // Método auxiliar para buscar o crear una categoría padre (Categoría raíz)
    private Category findOrCreateParent(String name, String description) {
        // Usa el método de repositorio optimizado: findByNameIgnoreCaseAndParentCategoryIsNull
        return categoryRepository.findByNameIgnoreCaseAndParentCategoryIsNull(name)
                .orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName(name);
                    newCat.setDescription(description);
                    newCat.setParentCategory(null);
                    return categoryRepository.save(newCat);
                });
    }

    // Método auxiliar para crear una subcategoría solo si no existe
    private void createSubcategoryIfNotExists(String name, String description, Category parent) {
        // Usa el método de repositorio optimizado: existsByNameIgnoreCaseAndParentCategory
        if (!categoryRepository.existsByNameIgnoreCaseAndParentCategory(name, parent)) {
            Category subCat = new Category();
            subCat.setName(name);
            subCat.setDescription(description);
            subCat.setParentCategory(parent);
            categoryRepository.save(subCat);
        }
    }

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Categoría Padre: Música (Busca o Crea)
        final Category musica = findOrCreateParent(
            "Música", 
            "Categoría para eventos musicales"
        );

        // 2. Categoría Padre: Juegos (Busca o Crea)
        final Category juegos = findOrCreateParent(
            "Juegos", 
            "Categoría para eventos de juegos"
        );

        // 3. Subcategorías para Música (Verifica y Crea)
        createSubcategoryIfNotExists("Rock", "Subcategoría de rock", musica);
        createSubcategoryIfNotExists("Reguetón", "Subcategoría de reguetón", musica);

        // 4. Subcategorías para Juegos (Verifica y Crea)
        createSubcategoryIfNotExists("Estrategia", "Subcategoría de estrategia", juegos);
        createSubcategoryIfNotExists("Acción", "Subcategoría de acción", juegos);
    }
}