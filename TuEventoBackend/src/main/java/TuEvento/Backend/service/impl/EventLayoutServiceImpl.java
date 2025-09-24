package TuEvento.Backend.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import TuEvento.Backend.dto.EventLayoutDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.EventLayout;
import TuEvento.Backend.repository.EventLayoutRepository;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.EventLayoutService;

@Service
public class EventLayoutServiceImpl implements EventLayoutService {

    @Autowired
    private EventLayoutRepository eventLayoutRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    @Transactional
    public ResponseDto<EventLayoutDto> createEventLayout(EventLayoutDto eventLayoutDto) {
        try {
            // Validar que el evento existe
            if (eventLayoutDto.getEventId() <= 0) {
                return ResponseDto.error("El ID del evento es obligatorio");
            }

            Optional<Event> eventOpt = eventRepository.findById(eventLayoutDto.getEventId());
            if (eventOpt.isEmpty()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Event event = eventOpt.get();

            // Verificar que no exista ya un layout para este evento
            Optional<EventLayout> existingLayout = eventLayoutRepository.findByEventID(event);
            if (existingLayout.isPresent()) {
                return ResponseDto.error("Ya existe un layout para este evento");
            }

            // Crear el nuevo layout
            EventLayout eventLayout = new EventLayout();
            eventLayout.setEventID(event);
            eventLayout.setLayoutData(eventLayoutDto.getLayoutData());
            eventLayout.setCreatedAt(eventLayoutDto.getCreatedAt() != null ?
                eventLayoutDto.getCreatedAt() : LocalDateTime.now());

            EventLayout savedLayout = eventLayoutRepository.save(eventLayout);

            // Convertir a DTO para respuesta
            EventLayoutDto responseDto = new EventLayoutDto();
            responseDto.setEventLayoutID(savedLayout.getId());
            responseDto.setEventId(savedLayout.getEventID().getId());
            responseDto.setLayoutData(savedLayout.getLayoutData());
            responseDto.setCreatedAt(savedLayout.getCreatedAt());

            return ResponseDto.ok("Layout del evento creado exitosamente", responseDto);

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al crear el layout: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error interno del servidor al crear el layout: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventLayoutDto> getEventLayoutById(int eventLayoutId) {
        try {
            Optional<EventLayout> layoutOpt = eventLayoutRepository.findById(eventLayoutId);
            if (layoutOpt.isEmpty()) {
                return ResponseDto.error("Layout no encontrado");
            }

            EventLayout layout = layoutOpt.get();

            EventLayoutDto dto = new EventLayoutDto();
            dto.setEventLayoutID(layout.getId());
            dto.setEventId(layout.getEventID().getId());
            dto.setLayoutData(layout.getLayoutData());
            dto.setCreatedAt(layout.getCreatedAt());

            return ResponseDto.ok("Layout encontrado", dto);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener el layout: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventLayoutDto> getEventLayoutByEventId(int eventId) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                return ResponseDto.error("Evento no encontrado");
            }

            Optional<EventLayout> layoutOpt = eventLayoutRepository.findByEventID(eventOpt.get());
            if (layoutOpt.isEmpty()) {
                return ResponseDto.error("No se encontró layout para este evento");
            }

            EventLayout layout = layoutOpt.get();

            EventLayoutDto dto = new EventLayoutDto();
            dto.setEventLayoutID(layout.getId());
            dto.setEventId(layout.getEventID().getId());
            dto.setLayoutData(layout.getLayoutData());
            dto.setCreatedAt(layout.getCreatedAt());

            return ResponseDto.ok("Layout del evento encontrado", dto);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener el layout del evento: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<EventLayoutDto> updateEventLayout(int eventLayoutId, EventLayoutDto eventLayoutDto) {
        try {
            Optional<EventLayout> layoutOpt = eventLayoutRepository.findById(eventLayoutId);
            if (layoutOpt.isEmpty()) {
                return ResponseDto.error("Layout no encontrado");
            }

            EventLayout layout = layoutOpt.get();

            // Actualizar los datos
            if (eventLayoutDto.getLayoutData() != null) {
                layout.setLayoutData(eventLayoutDto.getLayoutData());
            }

            // No actualizar createdAt, mantener el original
            EventLayout savedLayout = eventLayoutRepository.save(layout);

            // Convertir a DTO para respuesta
            EventLayoutDto responseDto = new EventLayoutDto();
            responseDto.setEventLayoutID(savedLayout.getId());
            responseDto.setEventId(savedLayout.getEventID().getId());
            responseDto.setLayoutData(savedLayout.getLayoutData());
            responseDto.setCreatedAt(savedLayout.getCreatedAt());

            return ResponseDto.ok("Layout actualizado exitosamente", responseDto);

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al actualizar el layout: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error interno del servidor al actualizar el layout: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteEventLayout(int eventLayoutId) {
        try {
            Optional<EventLayout> layoutOpt = eventLayoutRepository.findById(eventLayoutId);
            if (layoutOpt.isEmpty()) {
                return ResponseDto.error("Layout no encontrado");
            }

            eventLayoutRepository.deleteById(eventLayoutId);
            return ResponseDto.ok("Layout eliminado exitosamente");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al eliminar el layout: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error interno del servidor al eliminar el layout: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<Boolean> hasEventLayout(int eventId) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                return ResponseDto.error("Evento no encontrado");
            }

            boolean hasLayout = eventLayoutRepository.findByEventID(eventOpt.get()).isPresent();
            return ResponseDto.ok("Verificación completada", hasLayout);

        } catch (Exception e) {
            return ResponseDto.error("Error al verificar el layout del evento: " + e.getMessage());
        }
    }
}
