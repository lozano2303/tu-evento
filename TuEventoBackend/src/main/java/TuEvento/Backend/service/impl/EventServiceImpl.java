package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseEvent;
import TuEvento.Backend.dto.responses.ResponseEventSearch;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.User;
import TuEvento.Backend.model.Location;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.repository.LocationRepository;
import TuEvento.Backend.service.EventService;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
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
            event.setStatus(0); // Active status
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
    @Transactional
    public ResponseDto<EventDto> CancelEvent(EventDto eventDto) {
        try {
            // Buscar el evento por ID
            Optional<Event> eventOpt = eventRepository.findById(eventDto.getId());
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Event event = eventOpt.get();
            event.setStatus(3); // Cambiar el status a 3 (cancelado)

            Event savedEvent = eventRepository.save(event);
            EventDto resultDto = toDto(savedEvent);

            return ResponseDto.ok("Evento cancelado correctamente", resultDto);
        } catch (Exception e) {
            return ResponseDto.error("Error al cancelar el evento: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<EventDto> publishEvent(EventDto eventDto) {
        try {
            // Buscar el evento por ID
            Optional<Event> eventOpt = eventRepository.findById(eventDto.getId());
            if (!eventOpt.isPresent()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Event event = eventOpt.get();
            event.setStatus(1); // Cambiar el status a 3 (cancelado)

            Event savedEvent = eventRepository.save(event);
            EventDto resultDto = toDto(savedEvent);

            return ResponseDto.ok("Evento publicado correctamente", resultDto);
        } catch (Exception e) {
            return ResponseDto.error("Error al publicar el evento: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<List<EventDto>> filterEvents(String name, LocalDate date, boolean onlyUpcoming, Integer locationId) {
        try {
            List<Event> events = new ArrayList<>();

            if (name != null && !name.isEmpty()) {
                if (onlyUpcoming) {
                    events = eventRepository.findByEventNameContainingIgnoreCaseAndStatusNot(name, 0);
                } else {
                    events = eventRepository.findByEventNameContainingIgnoreCase(name);
                }
            } else if (date != null) {
                if (onlyUpcoming) {
                    events = eventRepository.findByStartDateOrFinishDateAndStatusNot(date, date, 0);
                } else {
                    events = eventRepository.findByStartDateOrFinishDate(date, date);
                }
            } else if (locationId != null) {
                if (onlyUpcoming) {
                    events = eventRepository.findByLocationID_LocationIDAndStatusNot(locationId, 0);
                } else {
                    events = eventRepository.findByLocationID_LocationID(locationId);
                }
            } else if (onlyUpcoming) {
                events = eventRepository.findAllByStatusNot(0);
            } else {
                events = eventRepository.findAll();
            }

            List<EventDto> eventDtos = events.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Eventos filtrados correctamente", eventDtos);

        } catch (Exception e) {
            return ResponseDto.error("Error al filtrar los eventos: " + e.getMessage());
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
            // Return only active events (status = 1)
            List<Event> events = eventRepository.findAllByStatusNot(3);
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
            List<Event> events = eventRepository.findAllByUserID_UserID(userId);
            List<EventDto> eventDtos = events.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Eventos del usuario obtenidos correctamente", eventDtos);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener los eventos del usuario: " + e.getMessage());
        }
    }

}
