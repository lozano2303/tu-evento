package TuEvento.Backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name="notification")
public class Notification {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="notificationID", nullable = false)
    private int notificationID;
    @ManyToOne
    @JoinColumn(name="eventID", nullable = false)
    private Event event;
    @Column(name="message", nullable = false)
    private String message;
    @Column(name="sendDate", nullable = false)
    private LocalDateTime sendDate;
    public Notification(){}
    public Notification(int notificationID, Event event, String message, LocalDateTime sendDate) {
        this.notificationID = notificationID;
        this.event = event;
        this.message = message;
        this.sendDate = sendDate;
    }
    public int getNotificationID() {
        return notificationID;
    }
    public void setNotificationID(int notificationID) {
        this.notificationID = notificationID;
    }
    public Event getEventID() {
        return event;
    }
    public void setEventID(Event event) {
        this.event = event;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public LocalDateTime getSendDate() {
        return sendDate;
    }
    public void setSendDate(LocalDateTime sendDate) {
        this.sendDate = sendDate;
    }
}
