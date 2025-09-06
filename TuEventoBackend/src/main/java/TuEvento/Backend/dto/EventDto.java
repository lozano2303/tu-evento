package TuEvento.Backend.dto;

import java.time.LocalDate;

import TuEvento.Backend.model.Location;

public class EventDto {
    private int id;
    private Location locationID;
    private String eventName;
    private String description;
    private LocalDate startDate;
    private LocalDate finishDate;
    private boolean status;
    public EventDto() {}
    public EventDto(int id, Location locationID, String eventName, String description, LocalDate startDate, LocalDate finishDate, boolean status) {
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
    public boolean getStatus() {
        return status;
    }
    public void setStatus(boolean status) {
        this.status = status;
    }
}
