package TuEvento.Backend.service;

import java.util.List;
import TuEvento.Backend.dto.CategoryEventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Category;

public interface CategoryEventService {
    ResponseDto<CategoryEventDto> assignCategoryToEvent(CategoryEventDto categoryEventDto);
    ResponseDto<String> removeCategoryFromEvent(int categoryId, int eventId);
    ResponseDto<List<CategoryEventDto>> getCategoriesByEvent(int eventId);
    ResponseDto<List<CategoryEventDto>> getEventsByCategory(int categoryId);
    ResponseDto<String> removeAllCategoriesFromEvent(int eventId);
    ResponseDto<String> removeAllEventsFromCategory(int categoryId);
}