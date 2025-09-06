package TuEvento.Backend.service;

import TuEvento.Backend.dto.EventDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface EventService {

    ResponseDto<String> insertEvent(EventDto eventDto);

    ResponseDto<String> updateEvent(int eventID, EventDto eventDto);

}
