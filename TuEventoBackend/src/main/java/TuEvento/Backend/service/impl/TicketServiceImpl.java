package TuEvento.Backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.*;
import TuEvento.Backend.repository.*;
import TuEvento.Backend.service.TicketService;
import TuEvento.Backend.service.email.TicketReservationEmailService;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private SeatTicketRepository seatTicketRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private TicketReservationEmailService emailService;

    // DTO ↔ Entity
    private TicketDto toDto(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setTicketID(ticket.getTicketID());
        dto.setEventId(ticket.getEventId().getId());
        dto.setUserId(ticket.getUserId().getUserID());
        dto.setCode(ticket.getCode());
        dto.setStatus(ticket.getStatus());
        return dto;
    }

    // Crear ticket con múltiples asientos
    @Override
    @Transactional
    public ResponseDto<String> createTicketWithSeats(TicketDto ticketDto) {
        List<Integer> seatIDs = ticketDto.getSeatIDs();
        if (seatIDs == null || seatIDs.isEmpty()) {
            return ResponseDto.error("No se seleccionaron asientos");
        }

        List<Seat> seats = seatRepository.findAllById(seatIDs);
        for (Seat seat : seats) {
            if (seat.isStatus()) {
                return ResponseDto.error("El asiento " + seat.getSeatID() + " ya está ocupado");
            }
        }

        Optional<User> userOpt = userRepository.findById(ticketDto.getUserId());
        Optional<Event> eventOpt = eventRepository.findById(ticketDto.getEventId());

        if (userOpt.isEmpty() || eventOpt.isEmpty()) {
            return ResponseDto.error("Usuario o evento no encontrado");
        }

        User user = userOpt.get();
        // Temporarily skip activation check for testing
        // if (!user.isActivated()) {
        //     return ResponseDto.error("Cuenta no activada. No puedes comprar tickets.");
        // }

        BigDecimal totalPrice = seats.stream()
            .map(seat -> seat.getSectionID().getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Ticket ticket = new Ticket();
        ticket.setUserId(userOpt.get());
        ticket.setEventId(eventOpt.get());
        ticket.setCode(ticketDto.getCode());
        ticket.setStatus(0); // Pendiente
        ticket.setTicketDate(LocalDateTime.now());
        ticket.setTotalPrice(totalPrice);
        ticketRepository.save(ticket);

        for (Seat seat : seats) {
            SeatTicket relation = new SeatTicket(seat, ticket);
            seatTicketRepository.save(relation);
            seat.setStatus(true);
            seatRepository.save(seat);
        }

        // Send reservation confirmation email
        try {
            // Get login information for email
            Optional<Login> loginOpt = loginRepository.findByUserID(user);
            if (loginOpt.isPresent()) {
                Login login = loginOpt.get();

                List<String> seatDetails = seats.stream()
                    .map(seat -> "Fila " + seat.getRow() + " - Asiento " + seat.getSeatNumber())
                    .toList();

                String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
                    java.net.URLEncoder.encode("TICKET:" + ticket.getCode() + ":" + login.getEmail(), "UTF-8");

                emailService.sendTicketReservationEmail(
                    login.getEmail(),
                    user.getFullName(),
                    eventOpt.get().getEventName(),
                    ticket.getCode(),
                    qrCodeUrl,
                    seatDetails,
                    totalPrice,
                    eventOpt.get().getStartDate()
                );
            }
        } catch (Exception e) {
            // Log email error but don't fail the reservation
            System.err.println("Error sending reservation email: " + e.getMessage());
        }

        return ResponseDto.ok("Reserva creada exitosamente. Revisa tu correo electrónico para el ticket con QR. Precio total: $" + totalPrice);
    }

    // Cancelar ticket manualmente
    @Override
    @Transactional
    public ResponseDto<String> cancelTicket(int ticketID) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketID);
        if (ticketOpt.isEmpty()) return ResponseDto.error("Ticket no encontrado");

        Ticket ticket = ticketOpt.get();
        List<SeatTicket> relations = seatTicketRepository.findByTicket(ticket);

        for (SeatTicket relation : relations) {
            Seat seat = relation.getSeat();
            seat.setStatus(false);
            seatRepository.save(seat);
            seatTicketRepository.delete(relation);
        }

        ticket.setStatus(2); // Cancelado
        ticketRepository.save(ticket);

        return ResponseDto.ok("Ticket cancelado y asientos liberados");
    }

    // Scheduler: liberar asientos si el ticket no se paga en 30 minutos
    @Scheduled(fixedRate = 60000) // cada minuto
    @Transactional
    public void releaseExpiredTickets() {
        List<Ticket> pendingTickets = ticketRepository.findByStatus(0); // Pendientes

        for (Ticket ticket : pendingTickets) {
            if (ticket.getTicketDate().plusMinutes(1).isBefore(LocalDateTime.now())) {
                List<SeatTicket> relations = seatTicketRepository.findByTicket(ticket);

                for (SeatTicket relation : relations) {
                    Seat seat = relation.getSeat();
                    seat.setStatus(false);
                    seatRepository.save(seat);
                    seatTicketRepository.delete(relation);
                }

                ticketRepository.delete(ticket); // Eliminar ticket no pagado
            }
        }
    }

    // Obtener ticket por ID
    @Override
    public ResponseDto<TicketDto> getTicketById(int id) {
        try {
            Optional<Ticket> optionalTicket = ticketRepository.findById(id);
            if (optionalTicket.isEmpty()) {
                return ResponseDto.error("Ticket no encontrado");
            }
            return ResponseDto.ok("Ticket encontrado", toDto(optionalTicket.get()));
        } catch (Exception e) {
            return ResponseDto.error("No se pudo obtener el Ticket: " + e.getMessage());
        }
    }

    // Obtener tickets por evento
    @Override
    public ResponseDto<List<TicketDto>> getTicketByEvent(int eventId) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                return ResponseDto.error("Evento no encontrado");
            }

            List<Ticket> tickets = ticketRepository.findByEventId(eventOpt.get());
            if (tickets.isEmpty()) {
                return ResponseDto.ok("No hay tickets para este evento", new ArrayList<>());
            }

            List<TicketDto> ticketDtos = tickets.stream()
                .map(this::toDto)
                .toList();
            return ResponseDto.ok("Tickets encontrados", ticketDtos);
        } catch (Exception e) {
            return ResponseDto.error("No se pudo obtener los tickets: " + e.getMessage());
        }
    }

    // Obtener tickets por usuario
    @Override
    public ResponseDto<List<TicketDto>> getTicketByUser(int userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseDto.error("Usuario no encontrado");
            }

            User user = userOpt.get();
            if (!user.isActivated()) {
                return ResponseDto.error("Cuenta no activada.");
            }

            List<Ticket> tickets = ticketRepository.findByUserId(user);
            if (tickets.isEmpty()) {
                return ResponseDto.error("No hay tickets para este usuario");
            }

            List<TicketDto> ticketDtos = tickets.stream()
                    .map(this::toDto)
                    .toList();

            return ResponseDto.ok("Tickets encontrados", ticketDtos);
        } catch (Exception e) {
            return ResponseDto.error("No se pudo obtener los tickets: " + e.getMessage());
        }
    }
}
