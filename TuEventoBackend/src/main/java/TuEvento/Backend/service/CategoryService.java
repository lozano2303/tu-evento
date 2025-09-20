package TuEvento.Backend.service;

import java.util.List;
import TuEvento.Backend.dto.CategoryDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface CategoryService {
    ResponseDto<CategoryDto> insertCategory(CategoryDto categoryDto);
    ResponseDto<String> updateCategory(int categoryID, CategoryDto categoryDto);
    ResponseDto<String> deleteCategory(int categoryID);
    ResponseDto<List<CategoryDto>> getAllCategories();
    ResponseDto<CategoryDto> getCategoryById(int categoryID);
    ResponseDto<List<CategoryDto>> getRootCategories();
    ResponseDto<List<CategoryDto>> getSubCategories(int parentId);
    ResponseDto<List<CategoryDto>> searchCategoriesByName(String name);
}