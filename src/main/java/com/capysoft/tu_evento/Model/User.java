package com.capysoft.tu_evento.Model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity (name = "user")
public class User {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "userID")
    private int userID;

    @Column(name = "fullName", length= 70, nullable = false)
    private String fullName;

    @Column(name="telephone", length=11, nullable = false)
    private String telephone;

    @Column(name = "status", nullable = false, columnDefinition = "boolean default true")
    private boolean status;

    @Column(name="activate", length=1, nullable = false)
    private Integer activate;

    @Column(name="rol", length=10, nullable = false)
    private String rol;

    @Column(name = "birthDate", nullable = false)
    private LocalDate birthDate;

    @Column(name="address", length=50, nullable=false)
    private String address;

    //Constructor sin parámetros
    public User(){}

    //Contructor con todos los campos
    public User(int userID, String fullName, String telephone, boolean status, Integer activate, String rol,
            LocalDate birthDate, String address) {
        this.userID = userID;
        this.fullName = fullName;
        this.telephone = telephone;
        this.status = status;
        this.activate = activate;
        this.rol = rol;
        this.birthDate = birthDate;
        this.address = address;
    }


    //Getters y Setters
    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Integer getActivate() {
        return activate;
    }

    public void setActivate(Integer activate) {
        this.activate = activate;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
