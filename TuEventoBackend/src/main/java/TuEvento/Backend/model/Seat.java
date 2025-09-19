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

    @Column(name="status",nullable=false, columnDefinition= "boolean default false")
    private boolean status;

    public Seat() {
    }

    public Seat(int seatID, Section sectionID, EventLayout eventLayoutID, int seatNumber, boolean status) {
        this.seatID = seatID;
        this.sectionID = sectionID;
        this.eventLayoutID = eventLayoutID;
        this.seatNumber = seatNumber;
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

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}
