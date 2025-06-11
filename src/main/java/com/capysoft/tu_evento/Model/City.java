package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity(name = "city")
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cityID", nullable = false)
    private int cityID;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "postalCode", nullable = false)
    private int postalCode;

    // Constructor sin parámetros
    public City() {}

    // Constructor con todos los campos
    public City(int cityID, String name, int postalCode) {
        this.cityID = cityID;
        this.name = name;
        this.postalCode = postalCode;
    }

    // Getters y Setters
    public int getCityID() {
        return cityID;
    }

    public void setCityID(int cityID) {
        this.cityID = cityID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(int postalCode) {
        this.postalCode = postalCode;
    }
}