package TuEvento.Backend.controller;

import TuEvento.Backend.dto.CategoryDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ResponseDto<CategoryDto>> insertCategory(@RequestBody CategoryDto categoryDto) {
        ResponseDto<CategoryDto> response = categoryService.insertCategory(categoryDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @PutMapping("/{categoryID}")
    public ResponseEntity<ResponseDto<String>> updateCategory(
            @PathVariable int categoryID,
            @RequestBody CategoryDto categoryDto) {
        ResponseDto<String> response = categoryService.updateCategory(categoryID, categoryDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @DeleteMapping("/{categoryID}")
    public ResponseEntity<ResponseDto<String>> deleteCategory(@PathVariable int categoryID) {
        ResponseDto<String> response = categoryService.deleteCategory(categoryID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<CategoryDto>>> getAllCategories() {
        ResponseDto<List<CategoryDto>> response = categoryService.getAllCategories();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/{categoryID}")
    public ResponseEntity<ResponseDto<CategoryDto>> getCategoryById(@PathVariable int categoryID) {
        ResponseDto<CategoryDto> response = categoryService.getCategoryById(categoryID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/root")
    public ResponseEntity<ResponseDto<List<CategoryDto>>> getRootCategories() {
        ResponseDto<List<CategoryDto>> response = categoryService.getRootCategories();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/sub/{parentId}")
    public ResponseEntity<ResponseDto<List<CategoryDto>>> getSubCategories(@PathVariable int parentId) {
        ResponseDto<List<CategoryDto>> response = categoryService.getSubCategories(parentId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ResponseDto<List<CategoryDto>>> searchCategoriesByName(@RequestParam String name) {
        ResponseDto<List<CategoryDto>> response = categoryService.searchCategoriesByName(name);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}