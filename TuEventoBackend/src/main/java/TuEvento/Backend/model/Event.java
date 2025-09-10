package TuEvento.Backend.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name="event")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private int id;
    @ManyToOne
    @JoinColumn(name="locationID",nullable=false)
    private Location locationID;
    @Column(name="eventName", length = 100, nullable = false)
    private String eventName;
    @Column(name="description", length = 500, nullable = false)
    private String description;
    @Column(name="startDate", nullable = false)
    private LocalDate startDate;
    @Column(name="finishDate", nullable = false)
    private LocalDate finishDate;
    @Column(name="status", nullable = false)
    private int status;
    public Event() {}
    public Event(int id, Location locationID, String eventName, String description, LocalDate startDate, LocalDate finishDate, int status) {
        this.id = id;
        this.locationID = locationID;
        this.eventName = eventName;
        this.description = description;
        this.startDate = startDate;
        this.finishDate = finishDate;
        this.status = status;
    }
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public Location getLocationID() {
        return locationID;
    }
    public void setLocationID(Location locationID) {
        this.locationID = locationID;
    }
    public String getEventName() {
        return eventName;
    }
    public void setEventName(String eventName) {
        this.eventName = eventName;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public LocalDate getFinishDate() {
        return finishDate;
    }
    public void setFinishDate(LocalDate finishDate) {
        this.finishDate = finishDate;
    }
    public int getStatus() {
        return status;
    }
    public void setStatus(int status) {
        this.status = status;
    }
}   
