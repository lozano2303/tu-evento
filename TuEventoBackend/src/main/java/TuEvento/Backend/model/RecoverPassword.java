package TuEvento.Backend.model;

import java.time.LocalDateTime;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;


@Entity(name = "recover_password")
public class RecoverPassword {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="recoverPasswordID", nullable=false)
    private int recoverPasswordID;
    @OneToOne
    @JoinColumn(name="userID",nullable=false)
    private User userID;
    @Column(name = "code", nullable = false, length = 6)
    private String code;
    @Column(name="codeStatus", nullable=false)
    private boolean codeStatus;
    @Column(name="expieres", nullable=false)
    private LocalDateTime expieres;
    @Column(name="lastPassword", nullable=false,length = 100)
    private String lastPasswordChange;
    public RecoverPassword() {}
    public RecoverPassword(int recoverPasswordID, User userID, String code, boolean codeStatus, LocalDateTime expieres,String lastPasswordChange) {
        this.recoverPasswordID = recoverPasswordID;
        this.userID = userID;
        this.code = code;
        this.codeStatus = codeStatus;
        this.expieres = expieres;
        this.lastPasswordChange = lastPasswordChange;
    }
    public int getRecoverPasswordID() {
        return recoverPasswordID;
    }
    public void setRecoverPasswordID(int recoverPasswordID) {
        this.recoverPasswordID = recoverPasswordID;
    }
    public User getUserID() {
        return userID;
    }
    public void setUserID(User userID) {
        this.userID = userID;
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
    public LocalDateTime getExpieres() {
        return expieres;
    }
    public void setExpieres(LocalDateTime expieres) {
        this.expieres = expieres;
    }
    public String getLastPasswordChange() {
        return lastPasswordChange;
    }
    public void setLastPasswordChange(String lastPasswordChange) {
        this.lastPasswordChange = lastPasswordChange;
    }

}
