package TuEvento.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

import TuEvento.Backend.dto.EventDto;

import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseEvent;

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
    public ResponseDto<EventDto> updateEvent(@RequestBody ResponseEvent responseEvent, EventDto eventDto) {
        return eventService.updateEvent(responseEvent,eventDto);
    }
    @DeleteMapping("/cancel")
    public ResponseDto<EventDto> deleteEvent(@RequestBody EventDto eventDto) {
        return eventService.CancelEvent(eventDto);
    }
    @GetMapping("/{id}")
    public ResponseDto<EventDto> getEvent(@PathVariable int id) {
        return eventService.getEventById(id);
    }
    @GetMapping("/getAll")
    public ResponseDto<List<EventDto>> getAllEvent(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userID");
        if (userId == null) {
            return ResponseDto.error("Usuario no autenticado");
        }
        return eventService.getAllEvent(userId);
    }
}
