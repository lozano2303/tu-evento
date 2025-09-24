package TuEvento.Backend.dto;

import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;
import TuEvento.Backend.model.Event;


public class EventLayoutDto {
    private int eventLayoutID;
    private int eventId; // Changed from Event eventID to int eventId
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode layoutData;
    private LocalDateTime createdAt;
    public EventLayoutDto() {}
    public EventLayoutDto(int eventLayoutID, int eventId, JsonNode layoutData, LocalDateTime createdAt) {
        this.eventLayoutID = eventLayoutID;
        this.eventId = eventId;
        this.layoutData = layoutData;
        this.createdAt = createdAt;
    }
    public int getEventLayoutID() {
        return eventLayoutID;
    }
    public void setEventLayoutID(int eventLayoutID) {
        this.eventLayoutID = eventLayoutID;
    }
    public int getEventId() {
        return eventId;
    }
    public void setEventId(int eventId) {
        this.eventId = eventId;
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
