package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "department")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "departmentID", nullable = false)
    private int departmentID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cityID", referencedColumnName = "cityID", nullable = false)
    private City city;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    // Constructor sin parámetros
    public Department() {}

    // Constructor con todos los campos
    public Department(int departmentID, City city, String name) {
        this.departmentID = departmentID;
        this.city = city;
        this.name = name;
    }

    // Getters y Setters
    public int getDepartmentID() {
        return departmentID;
    }

    public void setDepartmentID(int departmentID) {
        this.departmentID = departmentID;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}