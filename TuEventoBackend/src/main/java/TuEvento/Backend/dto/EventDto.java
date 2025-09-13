package TuEvento.Backend.dto;

import java.time.LocalDate;

import TuEvento.Backend.model.Location;
import TuEvento.Backend.model.User;

public class EventDto {
    private User userID;
    private Location locationID;
    private String eventName;
    private String description;
    private LocalDate startDate;
    private LocalDate finishDate;
    private int status;
    public EventDto() {}
    public EventDto(User userID, Location locationID, String eventName, String description, LocalDate startDate, LocalDate finishDate, int status) {
        this.userID = userID;
        this.locationID = locationID;
        this.eventName = eventName;
        this.description = description;
        this.startDate = startDate;
        this.finishDate = finishDate;
        this.status = status;
    }
    public User getUserID() {
        return userID;
    }
    public void setUserID(User userID) {
        this.userID = userID;
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
