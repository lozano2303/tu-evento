package com.capysoft.tu_evento.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "recoverPassword")
public class RecoverPassword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recoverPasswordID", nullable = false)
    private int recoverPasswordID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userID", referencedColumnName = "userID", nullable = false)
    private User user;

    @Column(name = "code", length = 6, nullable = false)
    private String code;

    @Column(name = "codeStatus", nullable = false, columnDefinition = "boolean default false")
    private boolean codeStatus;

    @Column(name = "expires", nullable = false)
    private LocalDateTime expires;

    // Constructor sin parámetros
    public RecoverPassword() {}

    // Constructor con todos los campos
    public RecoverPassword(int recoverPasswordID, User user, String code, boolean codeStatus, LocalDateTime expires) {
        this.recoverPasswordID = recoverPasswordID;
        this.user = user;
        this.code = code;
        this.codeStatus = codeStatus;
        this.expires = expires;
    }

    // Getters y Setters
    public int getRecoverPasswordID() {
        return recoverPasswordID;
    }

    public void setRecoverPasswordID(int recoverPasswordID) {
        this.recoverPasswordID = recoverPasswordID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public boolean isCodeStatus() {
        return codeStatus;
    }

    public void setCodeStatus(boolean codeStatus) {
        this.codeStatus = codeStatus;
    }

    public LocalDateTime getExpires() {
        return expires;
    }

    public void setExpires(LocalDateTime expires) {
        this.expires = expires;
    }
}