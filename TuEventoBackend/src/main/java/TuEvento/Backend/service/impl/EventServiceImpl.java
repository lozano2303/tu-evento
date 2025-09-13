package TuEvento.Backend.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseEvent;
import TuEvento.Backend.dto.responses.ResponseEventSearch;
import TuEvento.Backend.model.Event;

import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.EventService;
import jakarta.transaction.Transactional;
@Service
public class EventServiceImpl implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Override
    //@Transactional
    public ResponseDto<EventDto> insertEvent(EventDto eventDto) {
            try {

                Event entity = new Event();
                entity.setUserID(eventDto.getUserID());
                entity.setLocationID(eventDto.getLocationID());
                entity.setEventName(eventDto.getEventName());
                entity.setDescription(eventDto.getDescription());
                entity.setStartDate(eventDto.getStartDate());
                entity.setFinishDate(eventDto.getFinishDate());
                entity.setStatus(eventDto.getStatus());
                eventRepository.save(entity);

                return ResponseDto.ok("Evento insertado exitosamente");
            } catch (DataAccessException e) {
                return ResponseDto.error("Error de la base de datos");    
            } catch (Exception e) {
                return ResponseDto.error("Error inesperado al insertar Recover_password");
            }
    }
    @Override

    public ResponseDto<EventDto> updateEvent(ResponseEvent  responseEvent,EventDto eventDto) {
        try {
            Event entity = eventRepository.findByEventNameAndStatusNot(responseEvent.getEventNameOld(),0)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            entity.setUserID(eventDto.getUserID());
            entity.setLocationID(eventDto.getLocationID());
            entity.setEventName(eventDto.getEventName());
            entity.setDescription(eventDto.getDescription());
            entity.setStartDate(eventDto.getStartDate());
            entity.setFinishDate(eventDto.getFinishDate());
            entity.setStatus(eventDto.getStatus());
            eventRepository.save(entity);
            return ResponseDto.ok("Actualizado exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar Evento" + e);
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
            // Cargar filtros desde responseEventSearch
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

            Event entity;

            // Verificar cuántos filtros llegaron
            boolean hasName = eventDto.getEventName() != null;
            boolean hasStart = eventDto.getStartDate() != null;
            boolean hasFinish = eventDto.getFinishDate() != null;
            boolean hasStatus = eventDto.getStatus() != 0;

            int filterCount = (hasName ? 1 : 0) + (hasStart ? 1 : 0) + (hasFinish ? 1 : 0) + (hasStatus ? 1 : 0);

            switch (filterCount) {
                case 1:
                    if (hasName) {
                        entity = eventRepository.findByEventNameAndStatusNot(eventDto.getEventName(),0)
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por nombre"));
                    } else if (hasStart) {
                        entity = eventRepository.findByStartDateAndStatusNot(eventDto.getStartDate(),0)
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por fecha inicio"));
                    } else if (hasFinish) {
                        entity = eventRepository.findByFinishDateAndStatusNot(eventDto.getFinishDate(),0)
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por fecha fin"));
                    } else {
                        entity = eventRepository.findByStatus(eventDto.getStatus())
                                .orElseThrow(() -> new RuntimeException("Evento no encontrado por estado"));
                    }
                    break;

                default: // Si hay más de un criterio → buscar por todos
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
