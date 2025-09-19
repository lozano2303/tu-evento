package TuEvento.Backend.dto;

import java.util.List;

public class TicketDto {
    private int ticketID;
    private int eventId;
    private int userId;
    private String code;
    private int status;
    private List<Integer> seatIDs;

    public TicketDto() {}

    public TicketDto(int ticketID, int eventId, int userId, String code, int status, List<Integer> seatIDs) {
        this.ticketID = ticketID;
        this.eventId = eventId;
        this.userId = userId;
        this.code = code;
        this.status = status;
        this.seatIDs = seatIDs;
    }

    public int getTicketID() {
        return ticketID;
    }

    public void setTicketID(int ticketID) {
        this.ticketID = ticketID;
    }

    public int getEventId() {
        return eventId;
    }

    public void setEventId(int eventId) {
        this.eventId = eventId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public List<Integer> getSeatIDs() {
        return seatIDs;
    }

    public void setSeatIDs(List<Integer> seatIDs) {
        this.seatIDs = seatIDs;
    }
}
