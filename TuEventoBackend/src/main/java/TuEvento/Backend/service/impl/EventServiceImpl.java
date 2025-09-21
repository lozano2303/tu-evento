package TuEvento.Backend.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

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
import jakarta.transaction.Transactional;
@Service
public class EventServiceImpl implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    // Validation patterns
    private static final Pattern EVENT_NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ0-9\\s\\-_.&()]+$");

    // Validation methods
    private String validateEventName(String eventName) {
        if (eventName == null || eventName.trim().isEmpty()) {
            return "El nombre del evento es obligatorio";
        }

        eventName = eventName.trim();

        if (eventName.length() < 3) {
            return "El nombre del evento debe tener al menos 3 caracteres";
        }

        if (eventName.length() > 100) { // Según modelo Event.java
            return "El nombre del evento no puede tener más de 100 caracteres";
        }

        if (!EVENT_NAME_PATTERN.matcher(eventName).matches()) {
            return "El nombre del evento contiene caracteres no permitidos";
        }

        return null; // Valid
    }

    private String validateDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return "La descripción del evento es obligatoria";
        }

        description = description.trim();

        if (description.length() < 10) {
            return "La descripción del evento debe tener al menos 10 caracteres";
        }

        if (description.length() > 500) { // Según modelo Event.java
            return "La descripción del evento no puede tener más de 500 caracteres";
        }

        return null; // Valid
    }

    private String validateDates(LocalDate startDate, LocalDate finishDate) {
        if (startDate == null) {
            return "La fecha de inicio del evento es obligatoria";
        }

        if (finishDate == null) {
            return "La fecha de fin del evento es obligatoria";
        }

        LocalDate today = LocalDate.now();

        if (startDate.isBefore(today)) {
            return "La fecha de inicio del evento no puede ser anterior a hoy";
        }

        if (finishDate.isBefore(startDate) || finishDate.isEqual(startDate)) {
            return "La fecha de fin del evento debe ser posterior a la fecha de inicio";
        }

        // Validar que no sea demasiado lejano (máximo 2 años)
        if (startDate.isAfter(today.plusYears(2))) {
            return "La fecha de inicio del evento no puede ser más de 2 años en el futuro";
        }

        return null; // Valid
    }

    private String validateStatus(Integer status) {
        if (status == null) {
            return "El estado del evento es obligatorio";
        }

        if (status < 0 || status > 2) { // Asumiendo estados: 0=cancelado, 1=activo, 2=borrador
            return "El estado del evento debe ser 0 (cancelado), 1 (activo) o 2 (borrador)";
        }

        return null; // Valid
    }

    private String validateUser(User user) {
        if (user == null) {
            return "El usuario del evento es obligatorio";
        }

        if (!user.isActivated()) {
            return "El usuario debe estar activado para gestionar eventos";
        }

        if (!user.isStatus()) {
            return "El usuario debe estar activo para gestionar eventos";
        }

        if (!user.isOrganicer()) {
            return "El usuario debe ser organizador para gestionar eventos";
        }

        return null; // Valid
    }

    private String validateLocation(Location location) {
        if (location == null) {
            return "La ubicación del evento es obligatoria";
        }

        return null; // Valid
    }

    @Override
    @Transactional
    public ResponseDto<EventDto> insertEvent(EventDto eventDto) {
        try {
            // === VALIDACIONES DE ENTRADA ===

            // Validar nombre del evento
            String eventNameError = validateEventName(eventDto.getEventName());
            if (eventNameError != null) {
                return ResponseDto.error(eventNameError);
            }

            // Validar descripción
            String descriptionError = validateDescription(eventDto.getDescription());
            if (descriptionError != null) {
                return ResponseDto.error(descriptionError);
            }

            // Validar fechas
            String datesError = validateDates(eventDto.getStartDate(), eventDto.getFinishDate());
            if (datesError != null) {
                return ResponseDto.error(datesError);
            }

            // Validar estado
            String statusError = validateStatus(eventDto.getStatus());
            if (statusError != null) {
                return ResponseDto.error(statusError);
            }

            // === VALIDACIONES DE RELACIONES ===

            // Validar usuario
            if (eventDto.getUserID() == null) {
                return ResponseDto.error("El usuario del evento es obligatorio");
            }

            Optional<User> userOpt = userRepository.findById(eventDto.getUserID().getUserID());
            if (userOpt.isEmpty()) {
                return ResponseDto.error("Usuario no encontrado");
            }

            User user = userOpt.get();
            String userError = validateUser(user);
            if (userError != null) {
                return ResponseDto.error(userError);
            }

            // Validar ubicación
            if (eventDto.getLocationID() == null) {
                return ResponseDto.error("La ubicación del evento es obligatoria");
            }

            Optional<Location> locationOpt = locationRepository.findById(eventDto.getLocationID().getLocationID());
            if (locationOpt.isEmpty()) {
                return ResponseDto.error("Ubicación no encontrada");
            }

            Location location = locationOpt.get();
            String locationError = validateLocation(location);
            if (locationError != null) {
                return ResponseDto.error(locationError);
            }

            // === VALIDACIONES DE NEGOCIO ===

            // Verificar que no exista un evento con el mismo nombre activo
            Optional<Event> existingEvent = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(), 0);
            if (existingEvent.isPresent()) {
                return ResponseDto.error("Ya existe un evento activo con este nombre");
            }

            // === CREACIÓN DE ENTIDAD ===
            Event entity = new Event();
            entity.setUserID(user);
            entity.setLocationID(location);
            entity.setEventName(eventDto.getEventName().trim());
            entity.setDescription(eventDto.getDescription().trim());
            entity.setStartDate(eventDto.getStartDate());
            entity.setFinishDate(eventDto.getFinishDate());
            entity.setStatus(eventDto.getStatus());

            eventRepository.save(entity);

            return ResponseDto.ok("Evento creado exitosamente");

        } catch (DataAccessException e) {
            System.err.println("Error de base de datos en creación de evento: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos al crear el evento");
        } catch (Exception e) {
            System.err.println("Error inesperado en creación de evento: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error interno del servidor al crear el evento");
        }
    }
    @Override
    @Transactional
    public ResponseDto<EventDto> updateEvent(ResponseEvent responseEvent, EventDto eventDto) {
        try {
            // Buscar evento existente
            Event entity = eventRepository.findByEventNameAndStatusNot(responseEvent.getEventNameOld(), 0)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

            // === VALIDACIONES DE ENTRADA ===

            // Validar nombre del evento (solo si cambió)
            if (!entity.getEventName().equals(eventDto.getEventName())) {
                String eventNameError = validateEventName(eventDto.getEventName());
                if (eventNameError != null) {
                    return ResponseDto.error(eventNameError);
                }

                // Verificar que no exista otro evento con el nuevo nombre
                Optional<Event> existingEvent = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(), 0);
                if (existingEvent.isPresent() && existingEvent.get().getId() != entity.getId()) {
                    return ResponseDto.error("Ya existe otro evento activo con este nombre");
                }
            }

            // Validar descripción
            String descriptionError = validateDescription(eventDto.getDescription());
            if (descriptionError != null) {
                return ResponseDto.error(descriptionError);
            }

            // Validar fechas
            String datesError = validateDates(eventDto.getStartDate(), eventDto.getFinishDate());
            if (datesError != null) {
                return ResponseDto.error(datesError);
            }

            // Validar estado
            String statusError = validateStatus(eventDto.getStatus());
            if (statusError != null) {
                return ResponseDto.error(statusError);
            }

            // === VALIDACIONES DE RELACIONES ===

            // Validar usuario si cambió
            User user = entity.getUserID();
            if (eventDto.getUserID() != null && eventDto.getUserID().getUserID() != user.getUserID()) {
                Optional<User> userOpt = userRepository.findById(eventDto.getUserID().getUserID());
                if (userOpt.isEmpty()) {
                    return ResponseDto.error("Usuario no encontrado");
                }
                user = userOpt.get();
                String userError = validateUser(user);
                if (userError != null) {
                    return ResponseDto.error(userError);
                }
            }

            // Validar ubicación si cambió
            Location location = entity.getLocationID();
            if (eventDto.getLocationID() != null && eventDto.getLocationID().getLocationID() != location.getLocationID()) {
                Optional<Location> locationOpt = locationRepository.findById(eventDto.getLocationID().getLocationID());
                if (locationOpt.isEmpty()) {
                    return ResponseDto.error("Ubicación no encontrada");
                }
                location = locationOpt.get();
            }

            // === ACTUALIZACIÓN ===
            entity.setUserID(user);
            entity.setLocationID(location);
            entity.setEventName(eventDto.getEventName().trim());
            entity.setDescription(eventDto.getDescription().trim());
            entity.setStartDate(eventDto.getStartDate());
            entity.setFinishDate(eventDto.getFinishDate());
            entity.setStatus(eventDto.getStatus());

            eventRepository.save(entity);
            return ResponseDto.ok("Evento actualizado exitosamente");

        } catch (DataAccessException e) {
            System.err.println("Error de base de datos en actualización de evento: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos al actualizar el evento");
        } catch (Exception e) {
            System.err.println("Error inesperado en actualización de evento: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error interno del servidor al actualizar el evento");
        }
    }
    @Override
    @Transactional
    public ResponseDto<EventDto> CancelEvent(EventDto eventDto) {
        try {       
            Event entity = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(),1)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            entity.setStatus(0);
            eventRepository.save(entity);
            return ResponseDto.ok("Actualizado exitosamente");
        } catch (Exception e) {
           return ResponseDto.error("Error inesperado al actualizar Recover_password"+ e);
        }
    }
    @Override
    public ResponseDto<EventDto> getEvent(ResponseEventSearch responseEventSearch, EventDto eventDto) {
        try {
            // Aplicar filtros desde responseEventSearch
            if (responseEventSearch.getEventName() != null) {
                eventDto.setEventName(responseEventSearch.getEventName());
            }
            if (responseEventSearch.getStartDate() != null) {
                eventDto.setStartDate(responseEventSearch.getStartDate());
            }
            if (responseEventSearch.getFinishDate() != null) {
                eventDto.setFinishDate(responseEventSearch.getFinishDate());
            }
            if (responseEventSearch.getStatus() != 0) {
                eventDto.setStatus(responseEventSearch.getStatus());
            }

            // Determinar filtros activos
            boolean hasName = eventDto.getEventName() != null;
            boolean hasStart = eventDto.getStartDate() != null;
            boolean hasFinish = eventDto.getFinishDate() != null;
            boolean hasStatus = eventDto.getStatus() != 0;

            int filterCount = (hasName ? 1 : 0) + (hasStart ? 1 : 0) + (hasFinish ? 1 : 0) + (hasStatus ? 1 : 0);

            Event entity;
            switch (filterCount) {
                case 1:
                    if (hasName) {
                        entity = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(), 0)
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por nombre"));
                    } else if (hasStart) {
                        entity = eventRepository.findByStartDateAndStatusNot(eventDto.getStartDate(), 0)
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por fecha inicio"));
                    } else if (hasFinish) {
                        entity = eventRepository.findByFinishDateAndStatusNot(eventDto.getFinishDate(), 0)
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por fecha fin"));
                    } else {
                        entity = eventRepository.findByStatus(eventDto.getStatus())
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por estado"));
                    }
                    break;

                default:
                    entity = eventRepository.findByEventNameAndStartDateAndFinishDateAndStatus(
                                    eventDto.getEventName(),
                                    eventDto.getStartDate(),
                                    eventDto.getFinishDate(),
                                    eventDto.getStatus()
                            )
                            .orElseThrow(() -> new RuntimeException("Evento no encontrado con los filtros combinados"));
                    break;
            }

            // Convertir entidad → DTO
            EventDto dto = new EventDto();
            dto.setUserID(entity.getUserID());
            dto.setLocationID(entity.getLocationID());
            dto.setEventName(entity.getEventName());
            dto.setDescription(entity.getDescription());
            dto.setStartDate(entity.getStartDate());
            dto.setFinishDate(entity.getFinishDate());
            dto.setStatus(entity.getStatus());

            return ResponseDto.ok("Evento encontrado", dto);

        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al obtener evento: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<EventDto> getEventById(int id) {
        try {
            Optional<Event> event = eventRepository.findById(id);
            if (event.isPresent()) {
                EventDto dto = new EventDto();
                dto.setUserID(event.get().getUserID());
                dto.setLocationID(event.get().getLocationID());
                dto.setEventName(event.get().getEventName());
                dto.setDescription(event.get().getDescription());
                dto.setStartDate(event.get().getStartDate());
                dto.setFinishDate(event.get().getFinishDate());
                dto.setStatus(event.get().getStatus());
                return ResponseDto.ok("Evento encontrado", dto);
            } else {
                return ResponseDto.error("Evento no encontrado");
            }
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al obtener evento: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<List<EventDto>> getAllEvent() {
        try {
            List<Event> entityList = eventRepository.findAllByStatusNot(0);
            List<EventDto> dtoList = new ArrayList<>();

            for (Event e : entityList) {
                EventDto dtoEvent = new EventDto();
                dtoEvent.setUserID(e.getUserID());
                dtoEvent.setLocationID(e.getLocationID());
                dtoEvent.setEventName(e.getEventName());
                dtoEvent.setDescription(e.getDescription());
                dtoEvent.setStartDate(e.getStartDate());
                dtoEvent.setFinishDate(e.getFinishDate());
                dtoEvent.setStatus(e.getStatus());
                dtoList.add(dtoEvent);
            }

            return ResponseDto.ok("Eventos encontrados", dtoList);

        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al obtener eventos: " + e.getMessage());
        }
    }

}
