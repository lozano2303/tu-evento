package TuEvento.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import TuEvento.Backend.dto.EventDto;

import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.EventService;

@RestController
@RequestMapping("/api/v1/event")
public class EventController {

    @Autowired
    private EventService eventService;
    @PostMapping("/insert")
    public ResponseDto<EventDto> Event(@RequestBody EventDto EventDto) {
        return eventService.insertEvent(EventDto);
    }
    @PutMapping("/update")
    public ResponseDto<EventDto> updateEvent(@RequestBody EventDto eventDto) {
        return eventService.updateEvent(eventDto);
    }
    @DeleteMapping("/cancel")
    public ResponseDto<EventDto> deleteEvent(@RequestBody EventDto eventDto) {
        return eventService.CancelEvent(eventDto);
    }
}
