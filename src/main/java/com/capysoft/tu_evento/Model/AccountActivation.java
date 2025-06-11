package com.capysoft.tu_evento.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "accountActivation")
public class AccountActivation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "accountActivationID", nullable = false)
    private int accountActivationID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userID", referencedColumnName = "userID", nullable = false)
    private User user;

    @Column(name = "activationCode", length = 6, nullable = false)
    private String activationCode;

    @Column(name = "activation", nullable = false, columnDefinition = "boolean default false")
    private boolean activation;

    @Column(name = "expires", nullable = false)
    private LocalDateTime expires;

    // Constructor sin parámetros
    public AccountActivation() {}

    // Constructor con todos los campos
    public AccountActivation(int accountActivationID, User user, String activationCode, boolean activation, LocalDateTime expires) {
        this.accountActivationID = accountActivationID;
        this.user = user;
        this.activationCode = activationCode;
        this.activation = activation;
        this.expires = expires;
    }

    // Getters y Setters
    public int getAccountActivationID() {
        return accountActivationID;
    }

    public void setAccountActivationID(int accountActivationID) {
        this.accountActivationID = accountActivationID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }

    public boolean isActivation() {
        return activation;
    }

    public void setActivation(boolean activation) {
        this.activation = activation;
    }

    public LocalDateTime getExpires() {
        return expires;
    }

    public void setExpires(LocalDateTime expires) {
        this.expires = expires;
    }
}