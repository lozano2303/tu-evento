package TuEvento.Backend.service;

import TuEvento.Backend.dto.EventLayoutDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface EventLayoutService {
    // Crear un nuevo layout para un evento
    ResponseDto<EventLayoutDto> createEventLayout(EventLayoutDto eventLayoutDto);

    // Obtener layout por ID de layout
    ResponseDto<EventLayoutDto> getEventLayoutById(int eventLayoutId);

    // Obtener layout por ID de evento
    ResponseDto<EventLayoutDto> getEventLayoutByEventId(int eventId);

    // Actualizar layout existente
    ResponseDto<EventLayoutDto> updateEventLayout(int eventLayoutId, EventLayoutDto eventLayoutDto);

    // Eliminar layout
    ResponseDto<String> deleteEventLayout(int eventLayoutId);

    // Verificar si un evento ya tiene layout
    ResponseDto<Boolean> hasEventLayout(int eventId);
}
 