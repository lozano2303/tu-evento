package TuEvento.Backend.service;



import TuEvento.Backend.dto.EventLayoutDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface EventLayoutService {
    ResponseDto<EventLayoutDto>getEventLayout(String name,EventLayoutDto eventLayoutID);
    ResponseDto<EventLayoutDto>createEventLayout(EventLayoutDto eventLayoutDto);
    ResponseDto<EventLayoutDto>updateEventLayout(String name,EventLayoutDto eventLayoutDto);
    ResponseDto<EventLayoutDto>deleteEventLayout( String name,EventLayoutDto eventLayoutDto);
}
 