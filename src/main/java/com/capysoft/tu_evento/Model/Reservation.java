package com.capysoft.tu_evento.Model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "reservation")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservationID", nullable = false)
    private int reservationID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ticketID", referencedColumnName = "ticketID", nullable = false)
    private Ticket ticket;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userID", referencedColumnName = "userID", nullable = false)
    private User user;

    @Column(name = "totalPrice", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "reservationDate", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "status", nullable = false)
    private int status = 0; // 0 = false, 1 = true

    // Constructor sin parámetros
    public Reservation() {}

    // Constructor con todos los campos
    public Reservation(int reservationID, Ticket ticket, User user, BigDecimal totalPrice, LocalDate reservationDate, int status) {
        this.reservationID = reservationID;
        this.ticket = ticket;
        this.user = user;
        this.totalPrice = totalPrice;
        this.reservationDate = reservationDate;
        this.status = status;
    }

    // Getters y Setters
    public int getReservationID() {
        return reservationID;
    }

    public void setReservationID(int reservationID) {
        this.reservationID = reservationID;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}