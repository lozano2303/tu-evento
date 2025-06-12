package com.capysoft.tu_evento.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "eventLayout")
public class EventLayout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eventLayoutID", nullable = false)
    private int eventLayoutID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "eventID", referencedColumnName = "eventID", nullable = false)
    private Event event;

    @Column(name = "layoutData", columnDefinition = "jsonb", nullable = false)
    private String layoutData;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    // Constructor sin parámetros
    public EventLayout() {}

    // Constructor con todos los campos
    public EventLayout(int eventLayoutID, Event event, String layoutData, LocalDateTime createdAt) {
        this.eventLayoutID = eventLayoutID;
        this.event = event;
        this.layoutData = layoutData;
        this.createdAt = createdAt;
    }

    // Getters y Setters
    public int getEventLayoutID() {
        return eventLayoutID;
    }

    public void setEventLayoutID(int eventLayoutID) {
        this.eventLayoutID = eventLayoutID;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getLayoutData() {
        return layoutData;
    }

    public void setLayoutData(String layoutData) {
        this.layoutData = layoutData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}