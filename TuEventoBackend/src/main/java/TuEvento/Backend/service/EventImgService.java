package TuEvento.Backend.service;

import TuEvento.Backend.dto.EventImgRequestDto;
import TuEvento.Backend.dto.EventImgResponseDto;
import TuEvento.Backend.model.EventImg;

import java.util.List;

public interface EventImgService {
    EventImgResponseDto saveEventImg(EventImgRequestDto requestDto);
    List<EventImgResponseDto> getEventImgsByEventId(int eventId);
    void deleteEventImg(int eventImgId);
}