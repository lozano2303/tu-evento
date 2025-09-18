package TuEvento.Backend.dto;

public class SeatDto {

    private int sectionID;

    private int eventLayoutID;

    private int seatNumber;

    private boolean status;

    public SeatDto() {
    }

    public SeatDto(int sectionID, int eventLayoutID, int seatNumber, boolean status) {
        this.sectionID = sectionID;
        this.eventLayoutID = eventLayoutID;
        this.seatNumber = seatNumber;
        this.status = status;
    }

    public int getSectionID() {
        return sectionID;
    }

    public void setSectionID(int sectionID) {
        this.sectionID = sectionID;
    }

    public int getEventLayoutID() {
        return eventLayoutID;
    }

    public void setEventLayoutID(int eventLayoutID) {
        this.eventLayoutID = eventLayoutID;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(int seatNumber) {
        this.seatNumber = seatNumber;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}
