package TuEvento.Backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.User;

public class TicketDto {
private int ticketID;
    private Event eventId;

    private User userId;

    private BigDecimal totalPrice;

    private String code;

    private LocalDate ticketDate;

    private int status;
    public TicketDto(){}
    public TicketDto(int ticketID, Event eventId, User userId, BigDecimal totalPrice, String code, LocalDate ticketDate,
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
