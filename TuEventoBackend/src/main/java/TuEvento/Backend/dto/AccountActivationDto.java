package TuEvento.Backend.dto;

public class AccountActivationDto {

    private int userID;
    private String activationCode;

    public AccountActivationDto() {
    }

    public AccountActivationDto(int userID, String activationCode) {
        this.userID = userID;
        this.activationCode = activationCode;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }
}
