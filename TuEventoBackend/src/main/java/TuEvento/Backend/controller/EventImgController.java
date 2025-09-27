package TuEvento.Backend.controller;

import TuEvento.Backend.dto.EventImgRequestDto;
import TuEvento.Backend.dto.EventImgResponseDto;
import TuEvento.Backend.service.EventImgService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/event-img")
@RequiredArgsConstructor
public class EventImgController {

    private final EventImgService eventImgService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<EventImgResponseDto> uploadEventImg(@RequestParam int eventId,
                                                               @RequestParam("file") MultipartFile file,
                                                               @RequestParam int order) {
        EventImgRequestDto requestDto = new EventImgRequestDto(eventId, file, order);
        EventImgResponseDto response = eventImgService.saveEventImg(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<List<EventImgResponseDto>> getEventImgs(@PathVariable int eventId) {
        List<EventImgResponseDto> responses = eventImgService.getEventImgsByEventId(eventId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @DeleteMapping("/{eventImgId}")
    public ResponseEntity<String> deleteEventImg(@PathVariable int eventImgId) {
        eventImgService.deleteEventImg(eventImgId);
        return new ResponseEntity<>("Image deleted successfully", HttpStatus.OK);
    }
}