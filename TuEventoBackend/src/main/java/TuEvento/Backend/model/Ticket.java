package TuEvento.Backend.model;


import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name="ticket")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ticketID", nullable = false)
    private int ticketID;
    @ManyToOne
    @JoinColumn(name="eventID", nullable = false)
    private Event eventId;
    @ManyToOne
    @JoinColumn(name="userID", nullable = false)
    private User userId;
    @Column(name="totalPrice", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalPrice;
    @Column(name="code",length = 10, nullable = false)
    private String code;
    @Column(name="ticketDate", nullable = false)
    private LocalDate ticketDate;
    @Column(name="status", nullable = false)
    private int status;
    public Ticket(){}
    public Ticket(int ticketID, Event eventId, User userId, BigDecimal totalPrice, String code, LocalDate ticketDate,
            int status) {
        this.ticketID = ticketID;
        this.eventId = eventId;
        this.userId = userId;
        this.totalPrice = totalPrice;
        this.code = code;
        this.ticketDate = ticketDate;
        this.status = status;
    }
    public int getTicketID() {
        return ticketID;
    }
    public void setTicketID(int ticketID) {
        this.ticketID = ticketID;
    }
    public Event getEventId() {
        return eventId;
    }
    public void setEventId(Event eventId) {
        this.eventId = eventId;
    }
    public User getUserId() {
        return userId;
    }
    public void setUserId(User userId) {
        this.userId = userId;
    }
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
    public LocalDate getTicketDate() {
        return ticketDate;
    }
    public void setTicketDate(LocalDate ticketDate) {
        this.ticketDate = ticketDate;
    }
    public int getStatus() {
        return status;
    }
    public void setStatus(int status) {
        this.status = status;
    }
}
