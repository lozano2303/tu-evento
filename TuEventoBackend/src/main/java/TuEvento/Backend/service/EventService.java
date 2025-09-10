package TuEvento.Backend.service;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;


public interface EventService {
    ResponseDto<EventDto> insertEvent(EventDto eventDto);
    ResponseDto<EventDto> updateEvent(EventDto eventDto);
    ResponseDto<EventDto> CancelEvent(EventDto eventDto);
}
