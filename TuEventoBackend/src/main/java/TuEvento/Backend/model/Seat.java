package TuEvento.Backend.model;

import jakarta.persistence.*;

@Entity(name="seat")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="seatID")
    private int seatID;

    @ManyToOne
    @JoinColumn(name="sectionID", nullable = false)
    private Section sectionID;

    @ManyToOne
    @JoinColumn(name="eventLayoutID", nullable=false)
    private EventLayout eventLayoutID;

    @Column(name="seatNumber", nullable=false)
    private int seatNumber;

    @Column(name="row", nullable=false)
    private String row;

    @Column(name="x", precision = 10)
    private double x;

    @Column(name="y", precision = 10)
    private double y;

    @Column(name="status",nullable=false, columnDefinition= "boolean default false")
    private boolean status;

    public Seat() {
    }

    public Seat(int seatID, Section sectionID, EventLayout eventLayoutID, int seatNumber, String row, double x, double y, boolean status) {
        this.seatID = seatID;
        this.sectionID = sectionID;
        this.eventLayoutID = eventLayoutID;
        this.seatNumber = seatNumber;
        this.row = row;
        this.x = x;
        this.y = y;
        this.status = status;
    }

    public int getSeatID() {
        return seatID;
    }

    public void setSeatID(int seatID) {
        this.seatID = seatID;
    }

    public Section getSectionID() {
        return sectionID;
    }

    public void setSectionID(Section sectionID) {
        this.sectionID = sectionID;
    }

    public EventLayout getEventLayoutID() {
        return eventLayoutID;
    }

    public void setEventLayoutID(EventLayout eventLayoutID) {
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

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}
