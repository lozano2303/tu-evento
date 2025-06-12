package com.capysoft.tu_evento.Model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "purchase")
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchaseID", nullable = false)
    private int purchaseID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reservationID", referencedColumnName = "reservationID", nullable = false)
    private Reservation reservation;

    @Column(name = "purchaseDate", nullable = false)
    private LocalDate purchaseDate;

    // Constructor sin parámetros
    public Purchase() {}

    // Constructor con todos los campos
    public Purchase(int purchaseID, Reservation reservation, LocalDate purchaseDate) {
        this.purchaseID = purchaseID;
        this.reservation = reservation;
        this.purchaseDate = purchaseDate;
    }

    // Getters y Setters
    public int getPurchaseID() {
        return purchaseID;
    }

    public void setPurchaseID(int purchaseID) {
        this.purchaseID = purchaseID;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}