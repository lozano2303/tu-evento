package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "ticket")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticketID", nullable = false)
    private int ticketID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "eventID", referencedColumnName = "eventID", nullable = false)
    private Event event;

    @ManyToOne(optional = false)
    @JoinColumn(name = "seatID", referencedColumnName = "seatID", nullable = false)
    private Seat seat;

    @Column(name = "code", length = 10, nullable = false)
    private String code;

    // Constructor sin parámetros
    public Ticket() {}

    // Constructor con todos los campos
    public Ticket(int ticketID, Event event, Seat seat, String code) {
        this.ticketID = ticketID;
        this.event = event;
        this.seat = seat;
        this.code = code;
    }

    // Getters y Setters
    public int getTicketID() {
        return ticketID;
    }

    public void setTicketID(int ticketID) {
        this.ticketID = ticketID;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Seat getSeat() {
        return seat;
    }

    public void setSeat(Seat seat) {
        this.seat = seat;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}