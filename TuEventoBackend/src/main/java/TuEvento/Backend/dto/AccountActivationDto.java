package TuEvento.Backend.dto;

public class AccountActivationDto {
    private String activationCode;

    public AccountActivationDto(){
    }

    public AccountActivationDto(String activationCode) {
        this.activationCode = activationCode;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }
}
