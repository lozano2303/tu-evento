package TuEvento.Backend.model;

import java.time.LocalDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity(name="event")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eventID", unique = true, nullable = false)
    private int id;
    @ManyToOne
    @JoinColumn(name="userID",nullable=false)
    private User userID;
    @ManyToOne
    @JoinColumn(name="locationID",nullable=false)
    private Location locationID;

    @OneToMany(mappedBy = "event", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<EventImg> images;

    @OneToMany(mappedBy = "event", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<CategoryEvent> categories;
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
    public Event() {
        this.images = new ArrayList<>();
        this.categories = new ArrayList<>();
    }
    public Event(int id,User userID, Location locationID, String eventName, String description, LocalDate startDate, LocalDate finishDate, int status) {
        this.id = id;
        this.userID = userID;
        this.locationID = locationID;
        this.eventName = eventName;
        this.description = description;
        this.startDate = startDate;
        this.finishDate = finishDate;
        this.status = status;
        this.images = new ArrayList<>();
        this.categories = new ArrayList<>();
    }

    public List<EventImg> getImages() {
        return images;
    }

    public void setImages(List<EventImg> images) {
        this.images = images;
    }

    public List<CategoryEvent> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryEvent> categories) {
        this.categories = categories;
    }
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
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
