package TuEvento.Backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.NotificationDto;
import TuEvento.Backend.dto.NotificationUserDto;
import TuEvento.Backend.dto.TicketDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.*;
import TuEvento.Backend.repository.*;
import TuEvento.Backend.service.impl.NotificationUserServiceImpl;
import TuEvento.Backend.service.TicketService;
import TuEvento.Backend.service.email.TicketReservationEmailService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @Autowired
    private EventLayoutRepository eventLayoutRepository;

    @Autowired
    private NotificationServiceImpl notificationRepository;

    @Autowired
    private NotificationUserServiceImpl notificationUserService;


    private final ObjectMapper objectMapper = new ObjectMapper();

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
        System.out.println("Creating ticket with seats: " + ticketDto);
        List<Integer> seatIDs = ticketDto.getSeatIDs();
        System.out.println("Seat IDs: " + seatIDs);
        if (seatIDs == null || seatIDs.isEmpty()) {
            System.out.println("No seats selected");
            return ResponseDto.error("No se seleccionaron asientos");
        }

        List<Seat> seats = seatRepository.findAllById(seatIDs);
        System.out.println("Found seats: " + seats.size() + " for requested: " + seatIDs.size());
        if (seats.size() != seatIDs.size()) {
            System.out.println("Some seats not found. Requested: " + seatIDs + ", Found: " + seats.stream().map(Seat::getSeatID).toList());
            return ResponseDto.error("Algunos asientos no existen");
        }

        // Validar que los asientos estén disponibles
        //for (Seat seat : seats) {
            //if (!seat.isStatus()) {
                //System.out.println("Seat " + seat.getSeatID() + " is already occupied");
                //return ResponseDto.error("Uno o más asientos ya están ocupados");
            //}
        //}

        System.out.println("User ID: " + ticketDto.getUserId() + ", Event ID: " + ticketDto.getEventId());
        Optional<User> userOpt = userRepository.findById(ticketDto.getUserId());
        Optional<Event> eventOpt = eventRepository.findById(ticketDto.getEventId());
        System.out.println("User found: " + userOpt.isPresent() + ", Event found: " + eventOpt.isPresent());

        if (userOpt.isEmpty() || eventOpt.isEmpty()) {
            System.out.println("User or event not found");
            return ResponseDto.error("Usuario o evento no encontrado");
        }

        User user = userOpt.get();
        System.out.println("User activated: " + user.isActivated());
        // Temporarily skip activation check for testing
        // if (!user.isActivated()) {
        //     return ResponseDto.error("Cuenta no activada. No puedes comprar tickets.");
        // }

        // Check if user is the organizer of the event
        if (user.getUserID() == eventOpt.get().getUserID().getUserID()) {
            return ResponseDto.error("El organizador no puede comprar tickets en su propio evento.");
        }

        BigDecimal totalPrice = seats.stream()
                .map(seat -> seat.getSectionID().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        System.out.println("Calculated total price: " + totalPrice);

        System.out.println("Creating ticket with total price: " + totalPrice);
        Ticket ticket = new Ticket();
        ticket.setUserId(userOpt.get());
        ticket.setEventId(eventOpt.get());
        ticket.setCode(ticketDto.getCode());
        ticket.setStatus(0); // Pendiente
        ticket.setTicketDate(LocalDateTime.now());
        ticket.setTotalPrice(totalPrice);
        System.out.println("Saving ticket...");
        ticketRepository.save(ticket);
        System.out.println("Ticket saved with ID: " + ticket.getTicketID());

        for (Seat seat : seats) {
            System.out.println("Processing seat " + seat.getSeatID() + ", current status: " + seat.isStatus());
            SeatTicket relation = new SeatTicket(seat, ticket);
            seatTicketRepository.save(relation);
            seat.setStatus(false);
            Seat savedSeat = seatRepository.saveAndFlush(seat); // Save and flush immediately
            System.out.println("Saved seat " + savedSeat.getSeatID() + " with status: " + savedSeat.isStatus());
            System.out.println("Associated seat " + seat.getSeatID() + " to ticket " + ticket.getTicketID());
        }

        // Actualizar el layout del evento para marcar asientos como ocupados
        try {
            System.out.println("Updating event layout...");
            Optional<EventLayout> layoutOpt = eventLayoutRepository.findByEventID(eventOpt.get());
            System.out.println("Layout found: " + layoutOpt.isPresent());
            if (!layoutOpt.isPresent()) {
                System.out.println("No layout found for event " + eventOpt.get().getId() + ", skipping layout update");
            }
            if (layoutOpt.isPresent()) {
                EventLayout layout = layoutOpt.get();
                JsonNode data = layout.getLayoutData();
                System.out.println("Layout data before update: " + data);
                if (data != null && data.isObject()) {
                    if (data.has("elements")) {
                        System.out.println("Has elements");
                        for (Seat selectedSeat : seats) {
                             String row = selectedSeat.getRow();
                             int seatNumber = selectedSeat.getSeatNumber();
                             data.get("elements").forEach(element -> {
                                 if ("chair".equals(element.get("type").asText()) &&
                                     row.equals(element.get("row").asText()) &&
                                     seatNumber == element.get("seatNumber").asInt()) {
                                     ((ObjectNode) element).put("status", "OCCUPIED");
                                     System.out.println("Updated layout status for seat " + selectedSeat.getSeatID() + " (row " + row + ", seat " + seatNumber + ") to OCCUPIED");
                                 } else if ("seatRow".equals(element.get("type").asText()) && element.has("seatPositions")) {
                                     element.get("seatPositions").forEach(pos -> {
                                         if (row.equals(pos.get("row").asText()) &&
                                             seatNumber == pos.get("seatNumber").asInt()) {
                                             ((ObjectNode) pos).put("status", "OCCUPIED");
                                             System.out.println("Updated layout status for seatRow position " + selectedSeat.getSeatID() + " (row " + row + ", seat " + seatNumber + ") to OCCUPIED");
                                         }
                                     });
                                 }
                             });
                         }
                    } else {
                        System.out.println("No elements in layout");
                    }
                } else {
                    System.out.println("Layout data is not an object or null");
                }
                layout.setLayoutData(data);
                EventLayout savedLayout = eventLayoutRepository.save(layout);
                System.out.println("Event layout updated for selected seats");
                System.out.println("Layout data after update: " + data);
                System.out.println("Saved layout ID: " + savedLayout.getId() + ", Event ID: " + savedLayout.getEventID().getId());
                System.out.println("Layout data after update: " + data);
            }
        } catch (Exception e) {
            System.err.println("Error updating event layout: " + e.getMessage());
            e.printStackTrace();
        }

        // Send reservation confirmation email
        try {
            // Get login information for email
            Optional<Login> loginOpt = loginRepository.findByUserID(user);
            // Crear notificación
            NotificationDto notificationDto = new NotificationDto();
            notificationDto.setEventID(eventOpt.get().getId());
            notificationDto.setMessage("Este es un recordatorio de tu reserva al evento " + eventOpt.get().getEventName() + ". Se hará dentro de 2 días. ¡Nos vemos en el evento!");
            notificationDto.setSendDate(LocalDateTime.now());
            notificationRepository.insertNotification(notificationDto);
            ResponseDto<NotificationDto> notificationResponse = notificationRepository.insertNotification(notificationDto);
            // Crear notificación para usuario
            if (notificationResponse.isSuccess()) {
                NotificationDto savedNotification = notificationResponse.getData();

                // Crear notificación para usuario
                NotificationUserDto notificationUserDto = new NotificationUserDto();
                notificationUserDto.setUser(ticket.getUserId().getUserID());
                notificationUserDto.setNotification(savedNotification.getNotificationID());
                notificationUserService.insertNotificationUser(notificationUserDto);
            }
            if (loginOpt.isPresent()) {
                Login login = loginOpt.get();

                List<String> seatDetails = seats.stream()
                        .map(seat -> "Fila " + seat.getRow() + " - Asiento " + seat.getSeatNumber())
                        .toList();

                String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
                        URLEncoder.encode("TICKET:" + ticket.getTicketID() + ":" + login.getEmail(),
                                StandardCharsets.UTF_8);

                emailService.sendTicketReservationEmail(
                        login.getEmail(),
                        user.getFullName(),
                        eventOpt.get().getEventName(),
                        ticket.getCode(),
                        qrCodeUrl,
                        seatDetails,
                        totalPrice,
                        eventOpt.get().getStartDate());
            }
        } catch (Exception e) {
            // Log email error but don't fail the reservation
            System.err.println("Error sending reservation email: " + e.getMessage());
        }

        return ResponseDto
                .ok("Reserva creada exitosamente. Revisa tu correo electrónico para el ticket con QR. Precio total: $"
                        + totalPrice);
    }

    // Cancelar ticket manualmente
    @Override
    @Transactional
    public ResponseDto<String> cancelTicket(int ticketID) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketID);
        if (ticketOpt.isEmpty())
            return ResponseDto.error("Ticket no encontrado");

        if (ticketOpt.get().getStatus() != 0)
            return ResponseDto.error("Ticket ya pagado");
        Ticket ticket = ticketOpt.get();
        System.out.println("Cancelling ticket: " + ticketID);
        List<SeatTicket> relations = seatTicketRepository.findByTicket(ticket);

        for (SeatTicket relation : relations) {
            Seat seat = relation.getSeat();
            System.out.println("Releasing seat " + seat.getSeatID() + ", current status: " + seat.isStatus());
            seat.setStatus(true);
            Seat savedSeat = seatRepository.saveAndFlush(seat);
            System.out.println("Released seat " + savedSeat.getSeatID() + " with status: " + savedSeat.isStatus());
            seatTicketRepository.delete(relation);
        }

        // Actualizar el layout del evento para liberar asientos
        try {
            Optional<EventLayout> layoutOpt = eventLayoutRepository.findByEventID(ticket.getEventId());
            if (layoutOpt.isPresent()) {
                EventLayout layout = layoutOpt.get();
                JsonNode data = layout.getLayoutData();
                if (data != null && data.isObject() && data.has("elements")) {
                    for (SeatTicket relation : relations) {
                         Seat seat = relation.getSeat();
                         String row = seat.getRow();
                         int seatNumber = seat.getSeatNumber();
                         data.get("elements").forEach(element -> {
                             if ("chair".equals(element.get("type").asText()) &&
                                 row.equals(element.get("row").asText()) &&
                                 seatNumber == element.get("seatNumber").asInt()) {
                                 ((ObjectNode) element).put("status", "AVAILABLE");
                                 System.out.println("Updated layout status for seat " + seat.getSeatID() + " (row " + row + ", seat " + seatNumber + ") to AVAILABLE");
                             } else if ("seatRow".equals(element.get("type").asText()) && element.has("seatPositions")) {
                                 element.get("seatPositions").forEach(pos -> {
                                     if (row.equals(pos.get("row").asText()) &&
                                         seatNumber == pos.get("seatNumber").asInt()) {
                                         ((ObjectNode) pos).put("status", "AVAILABLE");
                                         System.out.println("Updated layout status for seatRow position " + seat.getSeatID() + " (row " + row + ", seat " + seatNumber + ") to AVAILABLE");
                                     }
                                 });
                             }
                         });
                     }
                }
                layout.setLayoutData(data);
                eventLayoutRepository.save(layout);
                System.out.println("Event layout updated for cancelled seats");
            }
        } catch (Exception e) {
            System.err.println("Error updating event layout on cancel: " + e.getMessage());
        }

        ticket.setStatus(1); // Cancelado
        ticketRepository.save(ticket);

        return ResponseDto.ok("Ticket pagado con éxito");
    }

    // Scheduler: liberar asientos si el ticket no se paga en 30 minutos
    @Scheduled(fixedRate = 60000) // cada minuto
    @Transactional
    public void releaseExpiredTickets() {
        List<Ticket> pendingTickets = ticketRepository.findByStatus(0); // Pendientes
        System.out.println("Checking " + pendingTickets.size() + " pending tickets for expiration");

        for (Ticket ticket : pendingTickets) {
            if (ticket.getTicketDate().plusMinutes(30).isBefore(LocalDateTime.now())) {
                System.out.println("Releasing expired ticket: " + ticket.getTicketID());
                List<SeatTicket> relations = seatTicketRepository.findByTicket(ticket);

                for (SeatTicket relation : relations) {
                    Seat seat = relation.getSeat();
                    System.out.println("Releasing expired seat " + seat.getSeatID() + ", current status: " + seat.isStatus());
                    seat.setStatus(true);
                    Seat savedSeat = seatRepository.saveAndFlush(seat);
                    System.out.println("Released expired seat " + savedSeat.getSeatID() + " with status: " + savedSeat.isStatus());
                    seatTicketRepository.delete(relation);
                }

                // Actualizar el layout del evento para liberar asientos expirados
                try {
                    Optional<EventLayout> layoutOpt = eventLayoutRepository.findByEventID(ticket.getEventId());
                    if (layoutOpt.isPresent()) {
                        EventLayout layout = layoutOpt.get();
                        JsonNode data = layout.getLayoutData();
                        if (data != null && data.isObject() && data.has("elements")) {
                            for (SeatTicket relation : relations) {
                                 Seat seat = relation.getSeat();
                                 String row = seat.getRow();
                                 int seatNumber = seat.getSeatNumber();
                                 data.get("elements").forEach(element -> {
                                     if ("chair".equals(element.get("type").asText()) &&
                                         row.equals(element.get("row").asText()) &&
                                         seatNumber == element.get("seatNumber").asInt()) {
                                         ((ObjectNode) element).put("status", "AVAILABLE");
                                         System.out.println("Updated layout status for expired seat " + seat.getSeatID() + " (row " + row + ", seat " + seatNumber + ") to AVAILABLE");
                                     } else if ("seatRow".equals(element.get("type").asText()) && element.has("seatPositions")) {
                                         element.get("seatPositions").forEach(pos -> {
                                             if (row.equals(pos.get("row").asText()) &&
                                                 seatNumber == pos.get("seatNumber").asInt()) {
                                                 ((ObjectNode) pos).put("status", "AVAILABLE");
                                                 System.out.println("Updated layout status for expired seatRow position " + seat.getSeatID() + " (row " + row + ", seat " + seatNumber + ") to AVAILABLE");
                                             }
                                         });
                                     }
                                 });
                             }
                        }
                        layout.setLayoutData(data);
                        eventLayoutRepository.save(layout);
                        System.out.println("Event layout updated for expired seats");
                    }
                } catch (Exception e) {
                    System.err.println("Error updating event layout on expiration: " + e.getMessage());
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
