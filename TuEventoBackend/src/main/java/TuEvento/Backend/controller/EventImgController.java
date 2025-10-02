package TuEvento.Backend.controller;

import TuEvento.Backend.dto.EventImgRequestDto;
import TuEvento.Backend.dto.EventImgResponseDto;
import TuEvento.Backend.dto.responses.ResponseDto;
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
    public ResponseEntity<?> uploadEventImg(@RequestParam int eventId,
                                              @RequestParam("file") MultipartFile file,
                                              @RequestParam int order) {
        try {
            EventImgRequestDto requestDto = new EventImgRequestDto();
            requestDto.setEventId(eventId);
            requestDto.setFile(file);
            requestDto.setOrder(order);
            EventImgResponseDto response = eventImgService.saveEventImg(requestDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDto.error("Error interno del servidor"));
        }
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEventImgs(@PathVariable int eventId) {
        try {
            List<EventImgResponseDto> responses = eventImgService.getEventImgsByEventId(eventId);
            return new ResponseEntity<>(responses, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error procesado: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{eventImgId}")
    public ResponseEntity<String> deleteEventImg(@PathVariable int eventImgId) {
        try {
            eventImgService.deleteEventImg(eventImgId);
            return new ResponseEntity<>("Image deleted successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error procesado: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}