package TuEvento.Backend.controller;

import TuEvento.Backend.dto.CategoryEventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.CategoryEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/category-events")
public class CategoryEventController {

    @Autowired
    private CategoryEventService categoryEventService;

    @PostMapping("/assign")
    public ResponseEntity<ResponseDto<CategoryEventDto>> assignCategoryToEvent(@RequestBody CategoryEventDto categoryEventDto) {
        ResponseDto<CategoryEventDto> response = categoryEventService.assignCategoryToEvent(categoryEventDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @DeleteMapping("/remove/{categoryId}/{eventId}")
    public ResponseEntity<ResponseDto<String>> removeCategoryFromEvent(
            @PathVariable int categoryId,
            @PathVariable int eventId) {
        ResponseDto<String> response = categoryEventService.removeCategoryFromEvent(categoryId, eventId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ResponseDto<List<CategoryEventDto>>> getCategoriesByEvent(@PathVariable int eventId) {
        ResponseDto<List<CategoryEventDto>> response = categoryEventService.getCategoriesByEvent(eventId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ResponseDto<List<CategoryEventDto>>> getEventsByCategory(@PathVariable int categoryId) {
        ResponseDto<List<CategoryEventDto>> response = categoryEventService.getEventsByCategory(categoryId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @DeleteMapping("/event/{eventId}/all")
    public ResponseEntity<ResponseDto<String>> removeAllCategoriesFromEvent(@PathVariable int eventId) {
        ResponseDto<String> response = categoryEventService.removeAllCategoriesFromEvent(eventId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @DeleteMapping("/category/{categoryId}/all")
    public ResponseEntity<ResponseDto<String>> removeAllEventsFromCategory(@PathVariable int categoryId) {
        ResponseDto<String> response = categoryEventService.removeAllEventsFromCategory(categoryId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
}