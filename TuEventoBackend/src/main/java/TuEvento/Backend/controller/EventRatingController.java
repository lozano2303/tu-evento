package TuEvento.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import TuEvento.Backend.dto.EventRatingDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.EventRatingService;

@RestController
@RequestMapping("/api/v1/eventRating")
public class EventRatingController {
    @Autowired
    private EventRatingService eventRatingService;

    @PostMapping("/insert/{userId}/{eventId}")
    public ResponseDto<EventRatingDto> insertEventRating(
            @PathVariable("userId") int userId,
            @PathVariable("eventId") int eventId,
            @RequestBody EventRatingDto eventRatingDto) {
        return eventRatingService.insertEventRating(userId, eventId, eventRatingDto);
    }

    @PutMapping("/update")
    public ResponseDto<EventRatingDto> updateEventRating(@RequestBody EventRatingDto eventRatingDto) {
        return eventRatingService.updateEventRating(eventRatingDto);
    }

    @GetMapping("/get")
    public ResponseDto<EventRatingDto> getEventRating(@RequestParam String comment) {
        EventRatingDto dto = new EventRatingDto();
        dto.setComment(comment);
        return eventRatingService.getEventRating(dto);
    }

    @DeleteMapping("/delete")
    public ResponseDto<EventRatingDto> deleteEventRating(@RequestParam int id) {
        EventRatingDto dto = new EventRatingDto();
        dto.setRatingID(id);
        return eventRatingService.deleteEventRating(dto);
    }

    @GetMapping("/getByEvent/{eventId}")
    public ResponseDto<List<EventRatingDto>> getEventRatingByEvent(@PathVariable int eventId) {
        EventRatingDto dto = new EventRatingDto();
        dto.setEventId(eventId);
        return eventRatingService.getEventRatingByEvent(dto);
    }

    @GetMapping("/getByUser/{userId}")
    public ResponseDto<EventRatingDto> getEventRatingByUser(@PathVariable int userId) {
        EventRatingDto dto = new EventRatingDto();
        dto.setUserId(userId);
        return eventRatingService.getEventRatingByUser(dto);
    }
}