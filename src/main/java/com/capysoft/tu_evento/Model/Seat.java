package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "seat")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seatID", nullable = false)
    private int seatID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sectionID", referencedColumnName = "sectionID", nullable = false)
    private Section section;

    @ManyToOne(optional = false)
    @JoinColumn(name = "eventLayoutID", referencedColumnName = "eventLayoutID", nullable = false)
    private EventLayout eventLayout;

    @Column(name = "seatNumber", nullable = false)
    private int seatNumber;

    @Column(name = "status", nullable = false)
    private int status = 0; // 0 = false, 1 = true

    // Constructor sin parámetros
    public Seat() {}

    // Constructor con todos los campos
    public Seat(int seatID, Section section, EventLayout eventLayout, int seatNumber, int status) {
        this.seatID = seatID;
        this.section = section;
        this.eventLayout = eventLayout;
        this.seatNumber = seatNumber;
        this.status = status;
    }

    // Getters y Setters
    public int getSeatID() {
        return seatID;
    }

    public void setSeatID(int seatID) {
        this.seatID = seatID;
    }

    public Section getSection() {
        return section;
    }

    public void setSection(Section section) {
        this.section = section;
    }

    public EventLayout getEventLayout() {
        return eventLayout;
    }

    public void setEventLayout(EventLayout eventLayout) {
        this.eventLayout = eventLayout;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(int seatNumber) {
        this.seatNumber = seatNumber;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}