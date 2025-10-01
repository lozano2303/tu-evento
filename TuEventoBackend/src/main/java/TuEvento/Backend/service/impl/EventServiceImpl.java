package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseEvent;
import TuEvento.Backend.dto.responses.ResponseEventSearch;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.User;
import TuEvento.Backend.model.Location;
import TuEvento.Backend.model.EventImg;
import TuEvento.Backend.model.CategoryEvent;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.repository.LocationRepository;
import TuEvento.Backend.repository.EventImgRepository;
import TuEvento.Backend.repository.CategoryEventRepository;
import TuEvento.Backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private EventImgRepository eventImgRepository;

    @Autowired
    private CategoryEventRepository categoryEventRepository;

    private EventDto toDto(Event event) {
        return new EventDto(
            event.getId(),
            event.getUserID(),
            event.getLocationID(),
            event.getEventName(),
            event.getDescription(),
            event.getStartDate(),
            event.getFinishDate(),
            event.getStatus()
        );
    }

    private Event toEntity(EventDto eventDto) {
        Event event = new Event();
        // Don't set id for new events, let @GeneratedValue handle it
        if (eventDto.getId() != 0) {
            event.setId(eventDto.getId());
        }
        event.setUserID(eventDto.getUserID());
        event.setLocationID(eventDto.getLocationID());
        event.setEventName(eventDto.getEventName());
        event.setDescription(eventDto.getDescription());
        event.setStartDate(eventDto.getStartDate());
        event.setFinishDate(eventDto.getFinishDate());
        event.setStatus(eventDto.getStatus());
        return event;
    }

    @Override
    @Transactional
    public ResponseDto<EventDto> insertEvent(EventDto eventDto) {
        try {
            // Validate input
            if (eventDto.getUserID() == null || eventDto.getLocationID() == null) {
                return ResponseDto.error("Usuario y ubicación son obligatorios");
            }

            // Check if user exists
            Optional<User> userOpt = userRepository.findById(eventDto.getUserID().getUserID());
            if (!userOpt.isPresent()) {
                return ResponseDto.error("Usuario no encontrado");
            }

            // Check if location exists
            Optional<Location> locationOpt = locationRepository.findById(eventDto.getLocationID().getLocationID());
            if (!locationOpt.isPresent()) {
                return ResponseDto.error("Ubicación no encontrada");
            }

            // Check for duplicate event name
            Optional<Event> existingEvent = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(), 0);
            if (existingEvent.isPresent()) {
                return ResponseDto.error("Ya existe un evento con este nombre");
            }

            // Create and save event
            Event event = toEntity(eventDto);
            event.setUserID(userOpt.get());
            event.setLocationID(locationOpt.get());
            event.setStatus(0); // Draft status - will be changed to 1 after completing all steps
            Event savedEvent = eventRepository.save(event);

            EventDto resultDto = toDto(savedEvent);
            return ResponseDto.ok("Evento creado correctamente", resultDto);

        } catch (Exception e) {
            return ResponseDto.error("Error al crear el evento: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<EventDto> updateEvent(ResponseEvent responseEvent, EventDto eventDto) {
        try {
            // Find the event by ID
            Optional<Event> eventOpt = eventRepository.findById(eventDto.getId());
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Event event = eventOpt.get();

            // Update fields if provided
            if (eventDto.getEventName() != null && !eventDto.getEventName().isEmpty()) {
                // Simple duplicate check (can be improved)
                Optional<Event> existingEvent = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(), 0);
                if (existingEvent.isPresent() && existingEvent.get().getId() != eventDto.getId()) {
                    return ResponseDto.error("Ya existe otro evento con este nombre");
                }
                event.setEventName(eventDto.getEventName());
            }

            if (eventDto.getDescription() != null) {
                event.setDescription(eventDto.getDescription());
            }

            if (eventDto.getStartDate() != null) {
                event.setStartDate(eventDto.getStartDate());
            }

            if (eventDto.getFinishDate() != null) {
                event.setFinishDate(eventDto.getFinishDate());
            }

            // Status is int, so we can update it directly
            event.setStatus(eventDto.getStatus());

            // Validate location if provided
            if (eventDto.getLocationID() != null) {
                Optional<Location> locationOpt = locationRepository.findById(eventDto.getLocationID().getLocationID());
                if (!locationOpt.isPresent()) {
                    return ResponseDto.error("Ubicación no encontrada");
                }
                event.setLocationID(locationOpt.get());
            }

            // Validate user if provided
            if (eventDto.getUserID() != null) {
                Optional<User> userOpt = userRepository.findById(eventDto.getUserID().getUserID());
                if (!userOpt.isPresent()) {
                    return ResponseDto.error("Usuario no encontrado");
                }
                event.setUserID(userOpt.get());
            }

            Event savedEvent = eventRepository.save(event);
            EventDto resultDto = toDto(savedEvent);

            return ResponseDto.ok("Evento actualizado correctamente", resultDto);

        } catch (Exception e) {
            return ResponseDto.error("Error al actualizar el evento: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public ResponseDto<EventDto> CancelEvent(EventDto eventDto, int userId) {
        System.out.println("CancelEvent called for eventId: " + eventDto.getId() + " by userId: " + userId);
        try {
            // Find the event by ID
            Optional<Event> eventOpt = eventRepository.findById(eventDto.getId());
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Event event = eventOpt.get();

            // Check if the authenticated user is the owner of the event
            if (event.getUserID().getUserID() != userId) {
                return ResponseDto.error("No tienes permisos para eliminar este evento");
            }

            // Delete associated images first
            int imagesCount = eventImgRepository.findAllByEventIdOrderByOrderAsc(eventDto.getId()).size();
            System.out.println("Found " + imagesCount + " images for event " + eventDto.getId());
            if (imagesCount > 0) {
                eventImgRepository.deleteByEventId(eventDto.getId());
                System.out.println("Deleted " + imagesCount + " images for event " + eventDto.getId());
            }

            // Delete associated category relationships
            List<CategoryEvent> categoriesToDelete = categoryEventRepository.findByEvent_Id(eventDto.getId());
            System.out.println("Found " + categoriesToDelete.size() + " category relationships for event " + eventDto.getId());
            if (!categoriesToDelete.isEmpty()) {
                categoryEventRepository.deleteAll(categoriesToDelete);
                categoryEventRepository.flush();
                System.out.println("Deleted " + categoriesToDelete.size() + " category relationships for event " + eventDto.getId());
            }

            // Finally delete the event
            eventRepository.deleteById(eventDto.getId());
            System.out.println("Event " + eventDto.getId() + " deleted successfully");

            return ResponseDto.ok("Evento eliminado correctamente", null);

        } catch (Exception e) {
            return ResponseDto.error("Error al eliminar el evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventDto> getEvent(ResponseEventSearch responseEventSearch, EventDto eventDto) {
        try {
            // Simple implementation: find by name if provided
            if (responseEventSearch.getEventName() != null && !responseEventSearch.getEventName().isEmpty()) {
                Optional<Event> eventOpt = eventRepository.findByEventNameAndStatusNot(responseEventSearch.getEventName(), 0);
                if (eventOpt.isPresent()) {
                    EventDto resultDto = toDto(eventOpt.get());
                    return ResponseDto.ok("Evento encontrado", resultDto);
                } else {
                    return ResponseDto.error("Evento no encontrado");
                }
            }
            return ResponseDto.error("Nombre del evento requerido para la búsqueda");
        } catch (Exception e) {
            return ResponseDto.error("Error al buscar el evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventDto> getEventById(int id) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(id);
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            EventDto eventDto = toDto(eventOpt.get());
            return ResponseDto.ok("Evento encontrado", eventDto);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener el evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<List<EventDto>> getAllEvent() {
        try {
            // Return all events - filtering is done in frontend
            List<Event> events = eventRepository.findAll();
            List<EventDto> eventDtos = events.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Eventos obtenidos correctamente", eventDtos);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener los eventos: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<List<EventDto>> getAllEventIdUser(int userId) {
        try {
            List<Event> events = eventRepository.findAllByUserID_UserIDAndStatusNot(userId, 0);
            List<EventDto> eventDtos = events.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Eventos del usuario obtenidos correctamente", eventDtos);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener los eventos del usuario: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<EventDto> completeEvent(int eventId) {
        try {
            // Find the event
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Event event = eventOpt.get();

            // Check if event is already completed
            if (event.getStatus() == 1) {
                return ResponseDto.error("El evento ya está completado");
            }

            // Check if event has images
            List<EventImg> images = eventImgRepository.findByEventId(eventId);
            if (images.isEmpty()) {
                return ResponseDto.error("El evento debe tener al menos una imagen antes de completarse");
            }

            // Check if event has categories
            List<CategoryEvent> categories = categoryEventRepository.findByEvent_Id(eventId);
            if (categories.isEmpty()) {
                return ResponseDto.error("El evento debe tener al menos una categoría antes de completarse");
            }

            // Mark event as completed
            event.setStatus(1);
            Event savedEvent = eventRepository.save(event);

            EventDto resultDto = toDto(savedEvent);
            return ResponseDto.ok("Evento completado correctamente", resultDto);

        } catch (Exception e) {
            return ResponseDto.error("Error al completar el evento: " + e.getMessage());
        }
    }
}
