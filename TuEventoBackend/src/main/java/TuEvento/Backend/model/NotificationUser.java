package TuEvento.Backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "notification_user")
public class NotificationUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notificationUserId;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;
    public NotificationUser(int notificationUserId, User user, Notification notification) {
        this.notificationUserId = notificationUserId;
        this.user = user;
        this.notification = notification;
    }
    public NotificationUser() {
    }
    public int getNotificationUserId() {
        return notificationUserId;
    }
    public void setNotificationUserId(int notificationUserId) {
        this.notificationUserId = notificationUserId;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public Notification getNotification() {
        return notification;
    }
    public void setNotification(Notification notification) {
        this.notification = notification;
    }
}
