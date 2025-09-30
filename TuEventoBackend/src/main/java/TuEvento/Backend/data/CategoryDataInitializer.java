package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.Category;
import TuEvento.Backend.repository.CategoryRepository;

@Component
public class CategoryDataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Verificar y crear categoría padre Música
        final Category musica = categoryRepository.findAll().stream()
                .filter(c -> "Música".equalsIgnoreCase(c.getName()))
                .findFirst().orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName("Música");
                    newCat.setDescription("Categoría para eventos musicales");
                    newCat.setParentCategory(null);
                    return categoryRepository.save(newCat);
                });

        // Verificar y crear categoría padre Juegos
        final Category juegos = categoryRepository.findAll().stream()
                .filter(c -> "Juegos".equalsIgnoreCase(c.getName()))
                .findFirst().orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName("Juegos");
                    newCat.setDescription("Categoría para eventos de juegos");
                    newCat.setParentCategory(null);
                    return categoryRepository.save(newCat);
                });

        // Subcategorías para Música
        if (categoryRepository.findAll().stream().noneMatch(c -> "Rock".equalsIgnoreCase(c.getName()) && musica.equals(c.getParentCategory()))) {
            Category rock = new Category();
            rock.setName("Rock");
            rock.setDescription("Subcategoría de rock");
            rock.setParentCategory(musica);
            categoryRepository.save(rock);
        }

        if (categoryRepository.findAll().stream().noneMatch(c -> "Reguetón".equalsIgnoreCase(c.getName()) && musica.equals(c.getParentCategory()))) {
            Category regueton = new Category();
            regueton.setName("Reguetón");
            regueton.setDescription("Subcategoría de reguetón");
            regueton.setParentCategory(musica);
            categoryRepository.save(regueton);
        }

        // Subcategorías para Juegos
        if (categoryRepository.findAll().stream().noneMatch(c -> "Estrategia".equalsIgnoreCase(c.getName()) && juegos.equals(c.getParentCategory()))) {
            Category estrategia = new Category();
            estrategia.setName("Estrategia");
            estrategia.setDescription("Subcategoría de estrategia");
            estrategia.setParentCategory(juegos);
            categoryRepository.save(estrategia);
        }

        if (categoryRepository.findAll().stream().noneMatch(c -> "Acción".equalsIgnoreCase(c.getName()) && juegos.equals(c.getParentCategory()))) {
            Category accion = new Category();
            accion.setName("Acción");
            accion.setDescription("Subcategoría de acción");
            accion.setParentCategory(juegos);
            categoryRepository.save(accion);
        }
    }
}