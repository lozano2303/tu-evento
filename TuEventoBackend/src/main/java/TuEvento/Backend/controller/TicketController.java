package TuEvento.Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.TicketService;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseDto<TicketDto> insertTicket(@RequestBody TicketDto ticketDto) {
        return ticketService.insertTicket(ticketDto);
    }

    @PutMapping
    public ResponseDto<TicketDto> updateTicket(@RequestBody TicketDto ticketDto) {
        return ticketService.updateTicket(ticketDto);
    }

    @DeleteMapping("/{id}")
    public ResponseDto<TicketDto> deleteTicket(@PathVariable int id) {
        return ticketService.deleteTicket(id);
    }

    @GetMapping("/{id}")
    public ResponseDto<TicketDto> getTicketById(@PathVariable int id) {
        return ticketService.getTicketById(id);
    }

    @GetMapping("/by-event/{eventId}")
    public ResponseDto<List<TicketDto>> getTicketByEvent(@PathVariable int eventId) {
        return ticketService.getTicketByEvent(eventId);
    }

    @GetMapping("/by-user/{userId}")
    public ResponseDto<List<TicketDto>> getTicketByUser(@PathVariable int userId) {
        return ticketService.getTicketByUser(userId);
    }
}
