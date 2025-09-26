package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.EventRatingDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface EventRatingService {
    ResponseDto<EventRatingDto> insertEventRating(int userId,int eventId,EventRatingDto eventRatingDto);
    ResponseDto<EventRatingDto> updateEventRating(EventRatingDto eventRatingDto);
    ResponseDto<EventRatingDto> getEventRating(EventRatingDto eventRatingDto);
    ResponseDto<EventRatingDto> deleteEventRating(EventRatingDto eventRatingDto);
    ResponseDto<List<EventRatingDto>> getEventRatingByEvent(EventRatingDto eventRatingDto);
    ResponseDto<EventRatingDto> getEventRatingByUser(EventRatingDto eventRatingDto);
}
