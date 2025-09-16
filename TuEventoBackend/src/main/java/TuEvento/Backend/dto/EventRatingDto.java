package TuEvento.Backend.dto;

import java.time.LocalDateTime;

public class EventRatingDto {
    private int ratingID;
    private int userId;
    private int eventId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;

    public EventRatingDto() {
    }

    public EventRatingDto(int ratingID, int userId, int eventId, int rating, String comment, LocalDateTime createdAt) {
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
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public int getEventId() {
        return eventId;
    }
    public void setEventId(int eventId) {
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
}