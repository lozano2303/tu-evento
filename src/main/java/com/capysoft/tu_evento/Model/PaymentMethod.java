package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity(name = "paymentMethod")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paymentMethodID", nullable = false)
    private int paymentMethodID;

    @Column(name = "name", nullable = false)
    private String name;

    // Constructor sin parámetros
    public PaymentMethod() {}

    // Constructor con todos los campos
    public PaymentMethod(int paymentMethodID, String name) {
        this.paymentMethodID = paymentMethodID;
        this.name = name;
    }

    // Getters y Setters
    public int getPaymentMethodID() {
        return paymentMethodID;
    }

    public void setPaymentMethodID(int paymentMethodID) {
        this.paymentMethodID = paymentMethodID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}