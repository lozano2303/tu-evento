package TuEvento.Backend.model;


import java.time.LocalDateTime;

import jakarta.persistence.Column;    
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "eventRating")
public class EventRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ratingID", nullable = false)
    private int ratingID;
    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User userId;
    @ManyToOne
    @JoinColumn(name = "eventId", nullable = false)
    private Event eventId;
    @Column(name = "rating", nullable = false)
    private int rating;
    @Column(name = "comment",length = 500, nullable = false)
    private String comment;
    @Column(name = "createdAt",nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;
    public EventRating() {
    }
    public EventRating(int ratingID, User userId, Event eventId, int rating, String comment, LocalDateTime createdAt) {
        this.ratingID = ratingID;
        this.userId = userId;
        this.eventId = eventId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }
    public int getRatingID() {
        return ratingID;
    }

    public void setRatingID(int ratingID) {
        this.ratingID = ratingID;
    }

    public User getUserId() {
        return userId;
    }

    public void setUserId(User userId) {
        this.userId = userId;
    }

    public Event getEventId() {
        return eventId;
    }

    public void setEventId(Event eventId) {
        this.eventId = eventId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


}
