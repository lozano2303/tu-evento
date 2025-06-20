package com.capysoft.tu_evento.Model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity(name = "section")
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sectionID", nullable = false)
    private int sectionID;

    @Column(name = "sectionName", length = 50, nullable = false)
    private String sectionName;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    // Constructor sin parámetros
    public Section() {}

    // Constructor con todos los campos
    public Section(int sectionID, String sectionName, BigDecimal price) {
        this.sectionID = sectionID;
        this.sectionName = sectionName;
        this.price = price;
    }

    // Getters y Setters
    public int getSectionID() {
        return sectionID;
    }

    public void setSectionID(int sectionID) {
        this.sectionID = sectionID;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}