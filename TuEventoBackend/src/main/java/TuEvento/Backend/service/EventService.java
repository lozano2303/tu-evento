package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseEvent;
import TuEvento.Backend.dto.responses.ResponseEventSearch;


public interface EventService {
    ResponseDto<EventDto> insertEvent(EventDto eventDto);
    ResponseDto<EventDto> updateEvent(ResponseEvent responseEvent,EventDto eventDto);
    ResponseDto<EventDto> CancelEvent(EventDto eventDto);
    ResponseDto<List<EventDto>> getAllEvent();
    ResponseDto<EventDto> getEvent(ResponseEventSearch responseEventSearch, EventDto eventDto);
}
