package TuEvento.Backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity(name="acount_activation")
public class AccountActivation {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="accountActivationID", nullable=false)
    private int accountActivationID;

    @OneToOne
    @JoinColumn(name="userID",nullable=false)
    private User userID;

    @Column(name="activationCode", length=6,nullable=false)
    private String activationCode;

    @Column(name="activation", nullable = false, columnDefinition = "boolean default false")
    private Boolean activation;
    
    @Column(name = "expirationTime", nullable = false)
    private LocalDateTime expirationTime;

    // Método para saber si el codigo ya expiró
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expirationTime);
    }

    public AccountActivation(){
    }

    public AccountActivation(int accountActivationID, User userID, String activationCode, Boolean activation,
            LocalDateTime expirationTime) {
        this.accountActivationID = accountActivationID;
        this.userID = userID;
        this.activationCode = activationCode;
        this.activation = activation;
        this.expirationTime = expirationTime;
    }

    public int getAccountActivationID() {
        return accountActivationID;
    }

    public void setAccountActivationID(int accountActivationID) {
        this.accountActivationID = accountActivationID;
    }

    public User getUserID() {
        return userID;
    }

    public void setUserID(User userID) {
        this.userID = userID;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }

    public Boolean getActivation() {
        return activation;
    }

    public void setActivation(Boolean activation) {
        this.activation = activation;
    }

    public LocalDateTime getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(LocalDateTime expirationTime) {
        this.expirationTime = expirationTime;
    }
}
