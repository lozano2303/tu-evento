package TuEvento.Backend.dto;

import java.time.LocalDateTime;

public class NotificationDto {
    private int notificationID;
    private int EventID;
    private String message;
    private LocalDateTime sendDate;
    public NotificationDto(){}
    public NotificationDto(int notificationID, int EventID, String message, LocalDateTime sendDate) {
        this.notificationID = notificationID;
        this.EventID = EventID;
        this.message = message;
        this.sendDate = sendDate;
    }
    public int getNotificationID() {
        return notificationID;
    }
    public void setNotificationID(int notificationID) {
        this.notificationID = notificationID;
    }
    public int getEventID() {
        return EventID;
    }
    public void setEventID(int EventID) {
        this.EventID = EventID;
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
