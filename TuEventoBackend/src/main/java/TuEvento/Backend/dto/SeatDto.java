package TuEvento.Backend.dto;

public class SeatDto {

    private int id;

    private int sectionID;

    private int eventLayoutID;

    private int seatNumber;

    private String row;

    private double x;

    private double y;

    private String status;

    public SeatDto() {
    }

    public SeatDto(int id, int sectionID, int eventLayoutID, int seatNumber, String row, double x, double y, String status) {
        this.id = id;
        this.sectionID = sectionID;
        this.eventLayoutID = eventLayoutID;
        this.seatNumber = seatNumber;
        this.row = row;
        this.x = x;
        this.y = y;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getRow() {
        return row;
    }

    public void setRow(String row) {
        this.row = row;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
