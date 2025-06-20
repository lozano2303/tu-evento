package com.capysoft.tu_evento.Model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "event")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eventID", nullable = false)
    private int eventID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "locationID", referencedColumnName = "locationID", nullable = false)
    private Location location;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userID", referencedColumnName = "userID", nullable = false)
    private User user;

    @Column(name = "eventName", length = 50, nullable = false)
    private String eventName;

    @Column(name = "description", length = 255, nullable = false)
    private String description;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "finishDate", nullable = false)
    private LocalDate finishDate;

    @Column(name = "status", nullable = false)
    private int status;

    // Constructor sin parámetros
    public Event() {}

    // Constructor con todos los campos
    public Event(int eventID, Location location, User user, String eventName, String description, LocalDate startDate, LocalDate finishDate, int status) {
        this.eventID = eventID;
        this.location = location;
        this.user = user;
        this.eventName = eventName;
        this.description = description;
        this.startDate = startDate;
        this.finishDate = finishDate;
        this.status = status;
    }

    // Getters y Setters
    public int getEventID() {
        return eventID;
    }

    public void setEventID(int eventID) {
        this.eventID = eventID;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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