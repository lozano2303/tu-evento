package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.responses.ResponseDto;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.CategoryEventDto;
import TuEvento.Backend.model.Category;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.CategoryEvent;
import TuEvento.Backend.model.CategoryEventId;
import TuEvento.Backend.repository.CategoryEventRepository;
import TuEvento.Backend.repository.CategoryRepository;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.CategoryEventService;
import jakarta.transaction.Transactional;

@Service
public class CategoryEventServiceImpl implements CategoryEventService {

    @Autowired
    private CategoryEventRepository categoryEventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EventRepository eventRepository;

    private CategoryEventDto toDto(CategoryEvent categoryEvent) {
        return new CategoryEventDto(
            categoryEvent.getCategory().getCategoryID(),
            categoryEvent.getEvent().getId()
        );
    }

    @Override
    @Transactional
    public ResponseDto<CategoryEventDto> assignCategoryToEvent(CategoryEventDto categoryEventDto) {
        try {
            // Validate input
            if (categoryEventDto.getCategoryID() == null || categoryEventDto.getEventID() == null) {
                return ResponseDto.error("Los IDs de categoría y evento son obligatorios");
            }

            // Check if category exists
            Optional<Category> categoryOpt = categoryRepository.findById(categoryEventDto.getCategoryID());
            if (!categoryOpt.isPresent()) {
                return ResponseDto.error("Categoría no encontrada");
            }

            // Check if event exists
            Optional<Event> eventOpt = eventRepository.findById(categoryEventDto.getEventID());
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            // Check if relationship already exists
            if (categoryEventRepository.existsByCategory_CategoryIDAndEvent_Id(
                    categoryEventDto.getCategoryID(), categoryEventDto.getEventID())) {
                return ResponseDto.error("Esta categoría ya está asignada a este evento");
            }

            // Create and save the relationship
            CategoryEvent categoryEvent = new CategoryEvent(categoryOpt.get(), eventOpt.get());
            CategoryEvent savedRelation = categoryEventRepository.save(categoryEvent);

            CategoryEventDto resultDto = toDto(savedRelation);
            return ResponseDto.ok("Categoría asignada al evento correctamente", resultDto);

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al asignar categoría al evento: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> removeCategoryFromEvent(int categoryId, int eventId) {
        try {
            // Check if relationship exists
            if (!categoryEventRepository.existsByCategory_CategoryIDAndEvent_Id(categoryId, eventId)) {
                return ResponseDto.error("La relación entre esta categoría y evento no existe");
            }

            // Create composite key and delete
            CategoryEventId id = new CategoryEventId(categoryId, eventId);
            categoryEventRepository.deleteById(id);

            return ResponseDto.ok("Categoría removida del evento correctamente");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al remover categoría del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<List<CategoryEventDto>> getCategoriesByEvent(int eventId) {
        try {
            // Check if event exists
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            List<CategoryEvent> categoryEvents = categoryEventRepository.findByEvent_Id(eventId);

            if (categoryEvents.isEmpty()) {
                return ResponseDto.error("No hay categorías asignadas a este evento");
            }

            List<CategoryEventDto> categoryEventDtos = categoryEvents.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Categorías del evento encontradas", categoryEventDtos);

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al obtener categorías del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<List<CategoryEventDto>> getEventsByCategory(int categoryId) {
        try {
            // Check if category exists
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (!categoryOpt.isPresent()) {
                return ResponseDto.error("Categoría no encontrada");
            }

            List<CategoryEvent> categoryEvents = categoryEventRepository.findByCategory_CategoryID(categoryId);

            if (categoryEvents.isEmpty()) {
                return ResponseDto.error("No hay eventos asignados a esta categoría");
            }

            List<CategoryEventDto> categoryEventDtos = categoryEvents.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Eventos de la categoría encontrados", categoryEventDtos);

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al obtener eventos de la categoría: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> removeAllCategoriesFromEvent(int eventId) {
        try {
            // Check if event exists
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            categoryEventRepository.deleteByEvent_Id(eventId);
            return ResponseDto.ok("Todas las categorías han sido removidas del evento");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al remover categorías del evento: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> removeAllEventsFromCategory(int categoryId) {
        try {
            // Check if category exists
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (!categoryOpt.isPresent()) {
                return ResponseDto.error("Categoría no encontrada");
            }

            categoryEventRepository.deleteByCategory_CategoryID(categoryId);
            return ResponseDto.ok("Todos los eventos han sido removidos de la categoría");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al remover eventos de la categoría: " + e.getMessage());
        }
    }

}