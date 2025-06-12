package com.capysoft.tu_evento.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;

@Entity(name = "payments")
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paymentsID", nullable = false)
    private int paymentsID;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paymentMethodID", referencedColumnName = "paymentMethodID", nullable = false)
    private PaymentMethod paymentMethod;

    @ManyToOne(optional = false)
    @JoinColumn(name = "purchaseID", referencedColumnName = "purchaseID", nullable = false)
    private Purchase purchase;

    @Column(name = "paymentGatewayID", nullable = false)
    private String paymentGatewayID;

    @Column(name = "paymentDate", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "paymentStatus", length = 30, nullable = false)
    private String paymentStatus;

    // Constructor sin parámetros
    public Payments() {}

    // Constructor con todos los campos
    public Payments(int paymentsID, PaymentMethod paymentMethod, Purchase purchase, String paymentGatewayID, LocalDate paymentDate, String paymentStatus) {
        this.paymentsID = paymentsID;
        this.paymentMethod = paymentMethod;
        this.purchase = purchase;
        this.paymentGatewayID = paymentGatewayID;
        this.paymentDate = paymentDate;
        this.paymentStatus = paymentStatus;
    }

    // Getters y Setters
    public int getPaymentsID() {
        return paymentsID;
    }

    public void setPaymentsID(int paymentsID) {
        this.paymentsID = paymentsID;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Purchase getPurchase() {
        return purchase;
    }

    public void setPurchase(Purchase purchase) {
        this.purchase = purchase;
    }

    public String getPaymentGatewayID() {
        return paymentGatewayID;
    }

    public void setPaymentGatewayID(String paymentGatewayID) {
        this.paymentGatewayID = paymentGatewayID;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}