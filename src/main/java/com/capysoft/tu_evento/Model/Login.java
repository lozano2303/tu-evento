package com.capysoft.tu_evento.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity(name = "login")
public class Login {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="loginID")
    private int loginID;

    @OneToOne
    @JoinColumn(name = "userID", referencedColumnName = "userID", nullable = false)
    private User userID;

    @Column(name="password", length=20, nullable=false)
    private String password;

    @Column(name="email", length=100, nullable=false)
    private String email;

    @Column(name="loginDate", nullable=false)
    private LocalDateTime loginDate;

    //Constructor sin parametros
    public Login(){}

    //Contructor con parametros
    public Login(int loginID, User userID, String password, String email, LocalDateTime loginDate) {
        this.loginID = loginID;
        this.userID = userID;
        this.password = password;
        this.email = email;
        this.loginDate = loginDate;
    }

    //Getters y Setters
    public int getLoginID() {
        return loginID;
    }

    public void setLoginID(int loginID) {
        this.loginID = loginID;
    }

    public User getUserID() {
        return userID;
    }

    public void setUserID(User userID) {
        this.userID = userID;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getLoginDate() {
        return loginDate;
    }

    public void setLoginDate(LocalDateTime loginDate) {
        this.loginDate = loginDate;
    }
}
