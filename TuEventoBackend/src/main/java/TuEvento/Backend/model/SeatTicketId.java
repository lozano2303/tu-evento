package TuEvento.Backend.model;

import java.io.Serializable;
import java.util.Objects;

public class SeatTicketId implements Serializable {
    private int seat;
    private int ticket;

    public SeatTicketId() {}

    public SeatTicketId(int seat, int ticket) {
        this.seat = seat;
        this.ticket = ticket;
    }

    public int getSeat() {
        return seat;
    }

    public void setSeat(int seat) {
        this.seat = seat;
    }

    public int getTicket() {
        return ticket;
    }

    public void setTicket(int ticket) {
        this.ticket = ticket;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SeatTicketId)) return false;
        SeatTicketId that = (SeatTicketId) o;
        return seat == that.seat && ticket == that.ticket;
    }

    @Override
    public int hashCode() {
        return Objects.hash(seat, ticket);
    }
}

