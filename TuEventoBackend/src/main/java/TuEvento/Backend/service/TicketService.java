package TuEvento.Backend.service;

import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.List;

public interface TicketService {

    // Crear ticket con múltiples asientos
    ResponseDto<String> createTicketWithSeats(TicketDto ticketDto);

    // Cancelar ticket manualmente
    ResponseDto<String> cancelTicket(int ticketID);

    // Obtener ticket por ID
    ResponseDto<TicketDto> getTicketById(int id);

    // Obtener tickets por evento
    ResponseDto<List<TicketDto>> getTicketByEvent(int eventId);

    // Obtener tickets por usuario
    ResponseDto<List<TicketDto>> getTicketByUser(int userId);
}
