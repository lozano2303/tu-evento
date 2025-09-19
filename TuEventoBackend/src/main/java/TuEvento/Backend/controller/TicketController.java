package TuEvento.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.TicketService;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // ✅ Crear ticket con múltiples asientos
    @PostMapping("/create-with-seats")
    public ResponseEntity<ResponseDto<String>> createTicketWithSeats(@RequestBody TicketDto ticketDto) {
        ResponseDto<String> response = ticketService.createTicketWithSeats(ticketDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    // ✅ Cancelar ticket manualmente
    @DeleteMapping("/cancel/{ticketID}")
    public ResponseEntity<ResponseDto<String>> cancelTicket(@PathVariable int ticketID) {
        ResponseDto<String> response = ticketService.cancelTicket(ticketID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // ✅ Obtener ticket por ID
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<TicketDto>> getTicketById(@PathVariable int id) {
        ResponseDto<TicketDto> response = ticketService.getTicketById(id);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // ✅ Obtener tickets por evento
    @GetMapping("/by-event/{eventId}")
    public ResponseEntity<ResponseDto<List<TicketDto>>> getTicketByEvent(@PathVariable int eventId) {
        ResponseDto<List<TicketDto>> response = ticketService.getTicketByEvent(eventId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // ✅ Obtener tickets por usuario
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ResponseDto<List<TicketDto>>> getTicketByUser(@PathVariable int userId) {
        ResponseDto<List<TicketDto>> response = ticketService.getTicketByUser(userId);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}
