package TuEvento.Backend.dto;
public class NotificationUserDto {
    private int notificationUserId;
    private int user;
    private int notification;
    public NotificationUserDto(int notificationUserId, int user, int notification) {
        this.notificationUserId = notificationUserId;
        this.user = user;
        this.notification = notification;
    }
    public NotificationUserDto() {
    }
    public int getNotificationUserId() {
        return notificationUserId;
    }
    public void setNotificationUserId(int notificationUserId) {
        this.notificationUserId = notificationUserId;
    }
    public int getUser() {
        return user;
    }
    public void setUser(int user) {
        this.user = user;
    }
    public int getNotification() {
        return notification;
    }
    public void setNotification(int notification) {
        this.notification = notification;
    }
}
