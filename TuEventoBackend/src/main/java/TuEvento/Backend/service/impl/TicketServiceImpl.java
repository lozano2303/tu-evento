package TuEvento.Backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Ticket;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.repository.TicketRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.TicketService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TicketServiceImpl implements TicketService {
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private UserRepository userRepository;

    private TicketDto toDto(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setTicketID(ticket.getTicketID());
        dto.setEventId(ticket.getEventId());
        dto.setUserId(ticket.getUserId());
        dto.setTotalPrice(ticket.getTotalPrice());
        dto.setCode(ticket.getCode());
        dto.setTicketDate(ticket.getTicketDate());
        dto.setStatus(ticket.getStatus());
        return dto;
    }

    private Ticket toEntity(TicketDto dto) {
        Ticket ticket = new Ticket();
        ticket.setTicketID(dto.getTicketID());
        ticket.setEventId(dto.getEventId());
        ticket.setUserId(dto.getUserId());
        ticket.setTotalPrice(dto.getTotalPrice());
        ticket.setCode(dto.getCode());
        ticket.setTicketDate(dto.getTicketDate());
        ticket.setStatus(dto.getStatus());
        return ticket;
    }

    @Override
    public ResponseDto<TicketDto> insertTicket(TicketDto ticketDto) {
        try {
            Ticket ticket = toEntity(ticketDto);
            ticket.setTicketDate(LocalDate.now());
            //1 es activo, 0 inactivo
            ticket.setStatus(1);
            ticketRepository.save(ticket);
            return new ResponseDto<>(true, "Ticket creado exitosamente");
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error al crear el ticket: " + e.getMessage(), null);
        }
    }

    @Override
    public ResponseDto<TicketDto> updateTicket(TicketDto ticketDto) {
        try {
            Optional<Ticket> optionalTicket = ticketRepository.findById(ticketDto.getTicketID());
            if (!optionalTicket.isPresent()) {
                return new ResponseDto<>(false, "Ticket no encontrado", null);
            }
            Ticket ticket = optionalTicket.get();
            ticket.setEventId(ticketDto.getEventId());
            ticket.setUserId(ticketDto.getUserId());
            ticket.setTotalPrice(ticketDto.getTotalPrice());
            ticket.setCode(ticketDto.getCode());
            ticket.setTicketDate(ticketDto.getTicketDate());
            ticket.setStatus(ticketDto.getStatus());
            Ticket updated = ticketRepository.save(ticket);
            return new ResponseDto<>(true, "Ticket actualizado exitosamente", toDto(updated));
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error al actualizar el ticket: " + e.getMessage(), null);
        }
    }

    @Override
    public ResponseDto<TicketDto> deleteTicket(int id) {
        try {
            Optional<Ticket> optionalTicket = ticketRepository.findById(id);
            if (!optionalTicket.isPresent()) {
                return new ResponseDto<>(false, "Ticket no encontrado", null);
            }
            ticketRepository.delete(optionalTicket.get());
            return new ResponseDto<>(true, "Ticket eliminado exitosamente", null);
        } catch (Exception e) {
            return new ResponseDto<>(false, "No se pudo eliminar el Ticket: " + e.getMessage(), null);
        }
    }
    @Override
    public ResponseDto<TicketDto> getTicketById(int id) {
        try {
            Optional<Ticket> optionalTicket = ticketRepository.findById(id);
            if (!optionalTicket.isPresent()) {
                return new ResponseDto<>(false, "Ticket no encontrado", null);
            }
            Ticket ticket = optionalTicket.get();
            return new ResponseDto<>(true, "Ticket encontrado", toDto(ticket));
        } catch (Exception e) {
            return new ResponseDto<>(false, "No se pudo obtener el Ticket: " + e.getMessage(), null);
        }
    }
    @Override
    public ResponseDto<List<TicketDto>> getTicketByEvent(int eventId) {
        try {
            List<Ticket> optionalTicket = ticketRepository.findByEventId(eventRepository.findById(eventId).get());
            if (optionalTicket.isEmpty()) {
                return new ResponseDto<>(false, "Ticket no encontrado", null);
            }
            List<TicketDto> ticketDtos = optionalTicket.stream()
                .map(this::toDto)
                .toList();
            return new ResponseDto<>(true, "Tickets encontrados", ticketDtos);
        } catch (Exception e) {
            return new ResponseDto<>(false, "No se pudo obtener el Ticket: " + e.getMessage(), null);
        }
    }
    @Override
    public ResponseDto<List<TicketDto>> getTicketByUser(int userId) {
        try {
            var userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new ResponseDto<>(false, "Usuario no encontrado", null);
            }

            List<Ticket> tickets = ticketRepository.findByUserId(userOpt.get());
            if (tickets.isEmpty()) {
                return new ResponseDto<>(false, "No hay tickets para este usuario", null);
            }

            List<TicketDto> ticketDtos = tickets.stream()
                    .map(this::toDto)
                    .toList();

            return new ResponseDto<>(true, "Tickets encontrados", ticketDtos);
        } catch (Exception e) {
            return new ResponseDto<>(false, "No se pudo obtener los tickets: " + e.getMessage(), null);
        }
    }

    
}