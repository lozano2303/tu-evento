package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity(name = "category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "categoryID", nullable = false)
    private int categoryID;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "description", length = 100, nullable = false)
    private String description;

    @ManyToOne(optional = true)
    @JoinColumn(name = "dadID", referencedColumnName = "categoryID", nullable = true, unique = true)
    private Category dad;

    // Constructor sin parámetros
    public Category() {}

    // Constructor con todos los campos
    public Category(int categoryID, String name, String description, Category dad) {
        this.categoryID = categoryID;
        this.name = name;
        this.description = description;
        this.dad = dad;
    }

    // Getters y Setters
    public int getCategoryID() {
        return categoryID;
    }

    public void setCategoryID(int categoryID) {
        this.categoryID = categoryID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getDad() {
        return dad;
    }

    public void setDad(Category dad) {
        this.dad = dad;
    }
}