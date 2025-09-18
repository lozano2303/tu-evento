package TuEvento.Backend.model;

import jakarta.persistence.*;

@Entity(name = "seat_ticket")
@IdClass(SeatTicketId.class)
public class SeatTicket {

    @Id
    @ManyToOne
    @JoinColumn(name = "seatID", referencedColumnName = "seatID")
    private Seat seat;

    @Id
    @ManyToOne
    @JoinColumn(name = "ticketID", referencedColumnName = "ticketID")
    private Ticket ticket;

    public SeatTicket() {}

    public SeatTicket(Seat seat, Ticket ticket) {
        this.seat = seat;
        this.ticket = ticket;
    }

    public Seat getSeat() {
        return seat;
    }

    public void setSeat(Seat seat) {
        this.seat = seat;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
}

