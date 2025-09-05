package TuEvento.Backend.dto;

import java.time.LocalDateTime;

public class RecoverPasswordDto {

    private int recoverPasswordID;

    private int userID;

    private String code;

    private boolean codeStatus;

    private LocalDateTime expieres;

    private String lastPasswordChange;
    public RecoverPasswordDto() {}
    public RecoverPasswordDto(int recoverPasswordID, int userID, String code, boolean codeStatus, LocalDateTime expieres,String lastPasswordChange) {
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
    public int getUserID() {
        return userID;
    }
    public void setUserID(int userID) {
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
