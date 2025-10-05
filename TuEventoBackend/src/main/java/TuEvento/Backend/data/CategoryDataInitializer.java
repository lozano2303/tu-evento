package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.Category;
import TuEvento.Backend.repository.CategoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
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
        // Verificar si ya hay categorías para evitar duplicados
        if (categoryRepository.count() > 0) {
            System.out.println("Categorías ya existen. Saltando inicialización.");
            return;
        }

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ClassPathResource("data/categorias.xlsx").getInputStream())) {
            // Mapa para cachear categorías padres por nombre
            Map<String, Category> parentCategories = new HashMap<>();

            // Leer categorías principales desde Hoja2 (A-2 a A-13)
            Sheet hoja2 = workbook.getSheet("Hoja2");
            if (hoja2 != null) {
                for (int i = 1; i <= 12; i++) { // Filas 1 a 12 (0-indexed: 1-12 para A-2 a A-13)
                    Row row = hoja2.getRow(i);
                    if (row != null) {
                        Cell cell = row.getCell(0); // Columna A
                        if (cell != null && cell.getCellType() == CellType.STRING) {
                            String categoryName = cell.getStringCellValue().trim();
                            if (!categoryName.isEmpty()) {
                                Category parent = findOrCreateParent(categoryName, "Categoría principal: " + categoryName);
                                parentCategories.put(categoryName, parent);
                            }
                        }
                    }
                }
            }

            // Leer subcategorías desde Sheet1
            Sheet sheet1 = workbook.getSheet("Sheet1");
            if (sheet1 != null) {
                for (int i = 1; i <= sheet1.getLastRowNum(); i++) { // Desde fila 1 (A-2)
                    Row row = sheet1.getRow(i);
                    if (row != null) {
                        Cell parentCell = row.getCell(0); // Columna A: Categoría padre
                        Cell subCell = row.getCell(1); // Columna B: Subcategoría
                        if (parentCell != null && parentCell.getCellType() == CellType.STRING &&
                            subCell != null && subCell.getCellType() == CellType.STRING) {
                            String parentName = parentCell.getStringCellValue().trim();
                            String subName = subCell.getStringCellValue().trim();
                            if (!parentName.isEmpty() && !subName.isEmpty()) {
                                Category parent = parentCategories.get(parentName);
                                if (parent != null) {
                                    createSubcategoryIfNotExists(subName, "Subcategoría de " + subName, parent);
                                }
                            }
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo Excel de categorías", e);
        }
    }
}