package TuEvento.Backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
@Entity(name = "event_layout")
public class EventLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eventLayoutID", nullable = false)
    private int eventLayoutID;
    @ManyToOne
    @JoinColumn(name = "eventID", nullable = false)
    private Event eventID;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", name = "layoutData", nullable = false) 
    private JsonNode layoutData;
    @Column(name="createdAt",nullable = false)
    private LocalDateTime createdAt;
    public EventLayout() {}
    public EventLayout(int eventLayoutID, Event eventID, JsonNode layoutData, LocalDateTime createdAt) {
        this.eventLayoutID = eventLayoutID;
        this.eventID = eventID;
        this.layoutData = layoutData;
        this.createdAt = createdAt;
    }
    public int getId() {
        return eventLayoutID;
    }
    public void setId(int eventLayoutID) {
        this.eventLayoutID = eventLayoutID;
    }
    public Event getEventID() {
        return eventID;
    }
    public void setEventID(Event eventID) {
        this.eventID = eventID;
    }
    public JsonNode getLayoutData() {
        return layoutData;
    }
    public void setLayoutData(JsonNode layoutData) {
        this.layoutData = layoutData;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
