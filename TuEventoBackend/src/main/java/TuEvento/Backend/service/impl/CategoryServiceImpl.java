package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.responses.ResponseDto;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.CategoryDto;
import TuEvento.Backend.model.Category;
import TuEvento.Backend.repository.CategoryRepository;
import TuEvento.Backend.service.CategoryService;
import jakarta.transaction.Transactional;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    private CategoryDto toDto(Category category) {
        Integer dadID = category.getParentCategory() != null ? category.getParentCategory().getCategoryID() : null;
        return new CategoryDto(category.getName(), category.getDescription(), dadID);
    }

    private Category toEntity(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());

        // Handle parent category
        if (categoryDto.getDadID() != null) {
            Optional<Category> parentOpt = categoryRepository.findById(categoryDto.getDadID());
            if (parentOpt.isPresent()) {
                category.setParentCategory(parentOpt.get());
            }
        }

        return category;
    }

    @Override
    @Transactional
    public ResponseDto<CategoryDto> insertCategory(CategoryDto categoryDto) {
        try {
            // Validate name is not empty
            if (categoryDto.getName() == null || categoryDto.getName().trim().isEmpty()) {
                return ResponseDto.error("El nombre de la categoría es obligatorio");
            }

            Category category = toEntity(categoryDto);
            category.setCategoryID(null); // Let database generate ID
            Category savedCategory = categoryRepository.save(category);

            CategoryDto savedDto = toDto(savedCategory);
            return ResponseDto.ok("Categoría insertada correctamente", savedDto);
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar la categoría: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateCategory(int categoryID, CategoryDto categoryDto) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryID);
        if (!categoryOpt.isPresent()) {
            return ResponseDto.error("Categoría no encontrada");
        }

        try {
            // Validate name is not empty
            if (categoryDto.getName() == null || categoryDto.getName().trim().isEmpty()) {
                return ResponseDto.error("El nombre de la categoría es obligatorio");
            }

            // Check for circular reference
            if (categoryDto.getDadID() != null && categoryDto.getDadID().equals(categoryID)) {
                return ResponseDto.error("Una categoría no puede ser padre de sí misma");
            }

            Category category = categoryOpt.get();
            category.setName(categoryDto.getName());
            category.setDescription(categoryDto.getDescription());

            // Handle parent category
            if (categoryDto.getDadID() != null) {
                Optional<Category> parentOpt = categoryRepository.findById(categoryDto.getDadID());
                if (parentOpt.isPresent()) {
                    category.setParentCategory(parentOpt.get());
                } else {
                    return ResponseDto.error("Categoría padre no encontrada");
                }
            } else {
                category.setParentCategory(null);
            }

            categoryRepository.save(category);
            return ResponseDto.ok("Categoría actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la categoría: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteCategory(int categoryID) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryID);
        if (!categoryOpt.isPresent()) {
            return ResponseDto.error("Categoría no encontrada");
        }

        try {
            // Check if category has subcategories
            List<Category> subCategories = categoryRepository.findByParentCategory_CategoryID(categoryID);
            if (!subCategories.isEmpty()) {
                return ResponseDto.error("No se puede eliminar la categoría porque tiene subcategorías");
            }

            categoryRepository.deleteById(categoryID);
            return ResponseDto.ok("Categoría eliminada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al eliminar la categoría: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar la categoría: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<CategoryDto> getCategoryById(int categoryID) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryID);
        if (!categoryOpt.isPresent()) {
            return ResponseDto.error("Categoría no encontrada");
        }

        CategoryDto categoryDto = toDto(categoryOpt.get());
        return ResponseDto.ok("Categoría encontrada", categoryDto);
    }

    @Override
    public ResponseDto<List<CategoryDto>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();

        if (categories.isEmpty()) {
            return ResponseDto.error("No hay categorías registradas");
        }

        List<CategoryDto> categoriesDto = categories.stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return ResponseDto.ok("Categorías encontradas", categoriesDto);
    }

    @Override
    public ResponseDto<List<CategoryDto>> getRootCategories() {
        List<Category> rootCategories = categoryRepository.findByParentCategoryIsNull();

        if (rootCategories.isEmpty()) {
            return ResponseDto.error("No hay categorías raíz registradas");
        }

        List<CategoryDto> rootCategoriesDto = rootCategories.stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return ResponseDto.ok("Categorías raíz encontradas", rootCategoriesDto);
    }

    @Override
    public ResponseDto<List<CategoryDto>> getSubCategories(int parentId) {
        Optional<Category> parentOpt = categoryRepository.findById(parentId);
        if (!parentOpt.isPresent()) {
            return ResponseDto.error("Categoría padre no encontrada");
        }

        List<Category> subCategories = categoryRepository.findByParentCategory_CategoryID(parentId);

        List<CategoryDto> subCategoriesDto = subCategories.stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return ResponseDto.ok("Subcategorías encontradas", subCategoriesDto);
    }

    @Override
    public ResponseDto<List<CategoryDto>> searchCategoriesByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseDto.error("El nombre de búsqueda es obligatorio");
        }

        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name);

        List<CategoryDto> categoriesDto = categories.stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return ResponseDto.ok("Búsqueda completada", categoriesDto);
    }
}