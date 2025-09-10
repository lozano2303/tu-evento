package TuEvento.Backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Event;

import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.EventService;
import jakarta.transaction.Transactional;
@Service
public class EventServiceImpl implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Override
    @Transactional
    public ResponseDto<EventDto> insertEvent(EventDto eventDto) {
            try {
                Event entity = new Event();
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
    @Transactional
    public ResponseDto<EventDto> updateEvent(EventDto eventDto) {
        try {
            Event entity = eventRepository.findByEventName(eventDto.getEventName())
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
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
            return ResponseDto.error("Error inesperado al actualizar Recover_password");
        }
    }
    @Override
    @Transactional
    public ResponseDto<EventDto> CancelEvent(EventDto eventDto) {
        try {       
            Event entity = eventRepository.findByEventName(eventDto.getEventName())
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            entity.setLocationID(eventDto.getLocationID());
            entity.setEventName(eventDto.getEventName());
            entity.setDescription(eventDto.getDescription());
            entity.setStartDate(eventDto.getStartDate());
            entity.setFinishDate(eventDto.getFinishDate());
            entity.setStatus(0);
            eventRepository.save(entity);
            return ResponseDto.ok("Actualizado exitosamente");
        } catch (Exception e) {
           return ResponseDto.error("Error inesperado al actualizar Recover_password"+ e);
        }
    }
}
