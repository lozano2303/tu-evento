package TuEvento.Backend.service.impl;



import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import TuEvento.Backend.dto.EventLayoutDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.EventLayoutService;
import TuEvento.Backend.repository.EventLayoutRepository;
import TuEvento.Backend.model.EventLayout;
import TuEvento.Backend.repository.EventRepository;

@Service
public class EventLayoutServiceImpl implements EventLayoutService {
    @Autowired
    private EventLayoutRepository eventLayoutRepository;
    @Autowired
    private EventRepository eventRepostitory;

    @Override
    public ResponseDto<EventLayoutDto> createEventLayout(EventLayoutDto eventLayoutDto) {
        try {
            EventLayout eventLayout = new EventLayout();
            eventLayout.setEventID(eventLayoutDto.getEventID());
            eventLayout.setLayoutData(eventLayoutDto.getLayoutData());
            eventLayout.setCreatedAt(eventLayoutDto.getCreatedAt());
            eventLayoutRepository.save(eventLayout);
            return new ResponseDto<>(true, "EventLayout creado exitosamente");
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error creando EventLayout"+ e);
        }
    }

    @Override
    public ResponseDto<EventLayoutDto> deleteEventLayout(EventLayoutDto eventLayoutID) {
        try {
                eventLayoutRepository.deleteById(eventLayoutID.getEventLayoutID());
                return new ResponseDto<>(true, "EventLayout eliminado exitosamente");
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error eliminando EventLayout"+ e);
        }
    }

    @Override
    public ResponseDto<EventLayoutDto> getEventLayout(String name, EventLayoutDto eventLayoutID) {
        try {
            Optional<TuEvento.Backend.model.Event> idEvent = eventRepostitory.findByEventNameAndStatusNot(name,0);

            if (idEvent.isPresent()) {
                Optional<EventLayout> eventLayout = eventLayoutRepository.findById(eventLayoutID.getEventLayoutID());

                if (eventLayout.isPresent()) {
                    EventLayout layout = eventLayout.get();

                    EventLayoutDto dto = new EventLayoutDto();
                    dto.setEventLayoutID(layout.getId());
                    dto.setEventID(eventLayout.get().getEventID());
                    dto.setLayoutData(layout.getLayoutData());
                    dto.setCreatedAt(layout.getCreatedAt());

                    return new ResponseDto<>(true, "EventLayout encontrado", dto);
                } else {
                    return new ResponseDto<>(false, "EventLayout con ID " 
                                            + eventLayoutID.getEventLayoutID() + " no encontrado");
                }
            } else {
                return new ResponseDto<>(false, "Evento con nombre '" + name + "' no encontrado");
            }

        } catch (Exception e) {
            return new ResponseDto<>(false, "Error obteniendo EventLayout: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventLayoutDto> updateEventLayout(String name,EventLayoutDto eventLayoutDto) {
        try {
            Optional<TuEvento.Backend.model.Event> idEvent = eventRepostitory.findByEventNameAndStatusNot(name,0);

            if (idEvent.isPresent()) {
                Optional<EventLayout> eventLayout = eventLayoutRepository.findById(eventLayoutDto.getEventLayoutID());

                if (eventLayout.isPresent()) {
                    EventLayout layout = eventLayout.get();

                    EventLayoutDto dto = new EventLayoutDto();
                    dto.setEventLayoutID(layout.getId());
                    dto.setEventID(eventLayout.get().getEventID());
                    dto.setLayoutData(layout.getLayoutData());
                    eventLayoutRepository.save(eventLayout.get());

                    return new ResponseDto<>(true, "EventLayout encontrado", dto);
                } else {
                    return new ResponseDto<>(false, "EventLayout con ID " + eventLayoutDto.getEventLayoutID() + " no encontrado");
                }
            } else {
                return new ResponseDto<>(false, "Evento con nombre '" + name + "' no encontrado");
            }

        } catch (Exception e) {
            return new ResponseDto<>(false, "Error obteniendo EventLayout: " + e.getMessage());
        }
    }

}
