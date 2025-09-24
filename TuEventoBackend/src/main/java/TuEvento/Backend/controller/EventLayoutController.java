package TuEvento.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import TuEvento.Backend.dto.EventLayoutDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.EventLayoutService;

@RestController
@RequestMapping("/api/v1/eventLayout")
public class EventLayoutController {

    @Autowired
    private EventLayoutService eventLayoutService;

    // Crear un nuevo layout para un evento
    @PostMapping
    public ResponseDto<EventLayoutDto> createEventLayout(@RequestBody EventLayoutDto eventLayoutDto) {
        return eventLayoutService.createEventLayout(eventLayoutDto);
    }

    // Obtener layout por ID
    @GetMapping("/{id}")
    public ResponseDto<EventLayoutDto> getEventLayoutById(@PathVariable("id") int eventLayoutId) {
        return eventLayoutService.getEventLayoutById(eventLayoutId);
    }

    // Obtener layout por ID de evento
    @GetMapping("/event/{eventId}")
    public ResponseDto<EventLayoutDto> getEventLayoutByEventId(@PathVariable("eventId") int eventId) {
        return eventLayoutService.getEventLayoutByEventId(eventId);
    }

    // Actualizar layout
    @PutMapping("/{id}")
    public ResponseDto<EventLayoutDto> updateEventLayout(@PathVariable("id") int eventLayoutId, @RequestBody EventLayoutDto eventLayoutDto) {
        return eventLayoutService.updateEventLayout(eventLayoutId, eventLayoutDto);
    }

    // Eliminar layout
    @DeleteMapping("/{id}")
    public ResponseDto<String> deleteEventLayout(@PathVariable("id") int eventLayoutId) {
        return eventLayoutService.deleteEventLayout(eventLayoutId);
    }

    // Verificar si evento tiene layout
    @GetMapping("/exists/event/{eventId}")
    public ResponseDto<Boolean> hasEventLayout(@PathVariable("eventId") int eventId) {
        return eventLayoutService.hasEventLayout(eventId);
    }
}
