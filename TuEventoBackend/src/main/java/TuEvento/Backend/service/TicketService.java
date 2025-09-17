package TuEvento.Backend.service;



import java.util.List;

import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;


public interface TicketService {

    ResponseDto<TicketDto> insertTicket(TicketDto ticketDto);

    ResponseDto<TicketDto> updateTicket(TicketDto ticketDto);

    ResponseDto<TicketDto> deleteTicket(int id);

    ResponseDto<TicketDto> getTicketById(int id);

    ResponseDto<List<TicketDto>> getTicketByEvent(int eventId);

    ResponseDto<List<TicketDto>> getTicketByUser(int userId);

}
