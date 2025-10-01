package TuEvento.Backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    @DeleteMapping("/cancel/{eventId}")
    public ResponseDto<EventDto> deleteEvent(@PathVariable int eventId, HttpServletRequest request) {
        try {
            Integer userId = (Integer) request.getAttribute("userID");
            if (userId == null) {
                return ResponseDto.error("Usuario no autenticado");
            }

            EventDto eventDto = new EventDto();
            eventDto.setId(eventId);
            return eventService.CancelEvent(eventDto, userId);
        } catch (RuntimeException e) {
            return ResponseDto.error(e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error interno del servidor");
        }
    }
    @PutMapping("/publish/{id}")
    public ResponseDto<EventDto> publishEvent(@PathVariable int id) {
        EventDto eventDto = new EventDto();
        eventDto.setId(id);
        return eventService.publishEvent(eventDto);
    }
    @GetMapping("/{id}")
    public ResponseDto<EventDto> getEvent(@PathVariable int id) {
        return eventService.getEventById(id);
    }
    @GetMapping("/getAllbyUser")
    public ResponseDto<List<EventDto>> getAllEvent(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userID");
        if (userId == null) {
            return ResponseDto.error("Usuario no autenticado");
        }
        return eventService.getAllEventIdUser(userId);
    }
    @GetMapping("/getAll")
    public ResponseDto<List<EventDto>> getAllEvent() {
        return eventService.getAllEvent();
    }
    @GetMapping("/filter")
    public ResponseDto<List<EventDto>> filterEvents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "false") boolean onlyUpcoming,
            @RequestParam(required = false) Integer locationId) {
        return eventService.filterEvents(name, date, onlyUpcoming, locationId);
    }
    @PutMapping("/complete/{eventId}")
    public ResponseDto<EventDto> completeEvent(@PathVariable int eventId) {
        return eventService.completeEvent(eventId);
    }
}
