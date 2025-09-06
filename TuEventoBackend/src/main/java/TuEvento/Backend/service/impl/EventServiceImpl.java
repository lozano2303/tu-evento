package TuEvento.Backend.service.impl;

import org.hibernate.sql.ast.tree.expression.Over;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;


import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Event;

import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.EventService;
import jakarta.transaction.Transactional;

public class EventServiceImpl implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Override
    @Transactional
    public ResponseDto<String> insertEvent(EventDto eventDto) {
            try {
                Event entity = new Event();
                entity.setLocationID(eventDto.getLocationID());
                entity.setEventName(eventDto.getEventName());
                entity.setDescription(eventDto.getDescription());
                entity.setStartDate(eventDto.getStartDate());
                entity.setFinishDate(eventDto.getFinishDate());
                entity.setStatus(eventDto.getStatus());
                eventRepository.save(entity);

                return ResponseDto.ok("Recover_password insertada exitosamente");
            } catch (DataAccessException e) {
                return ResponseDto.error("Error de la base de datos");
            } catch (Exception e) {
                return ResponseDto.error("Error inesperado al insertar Recover_password");
            }
    }
    @Override
    @Transactional
    public ResponseDto<String> updateEvent(int eventID, EventDto eventDto) {
        try {
            Event entity = eventRepository.findById(eventID)
                .orElseThrow(() -> new RuntimeException("Código no encontrado"));
            entity.setLocationID(eventDto.getLocationID());
            entity.setEventName(eventDto.getEventName());
            entity.setDescription(eventDto.getDescription());
            entity.setStartDate(eventDto.getStartDate());
            entity.setFinishDate(eventDto.getFinishDate());
            entity.setStatus(eventDto.getStatus());
            eventRepository.save(entity);
            return ResponseDto.ok("Recover_password actualizado exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar Recover_password");
        }
    }
}
