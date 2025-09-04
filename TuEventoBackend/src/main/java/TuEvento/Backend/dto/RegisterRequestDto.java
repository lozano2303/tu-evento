package TuEvento.Backend.dto;

import java.sql.Date;

public class RegisterRequestDto {

    private String fullName;
    private String telephone;
    private Date birthDate;
    private Integer addressID; // Puede ser null
    private String email;
    private String password;

    public RegisterRequestDto() {}

    public RegisterRequestDto(String fullName, String telephone, Date birthDate, Integer addressID, String email, String password) {
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDate = birthDate;
        this.addressID = addressID;
        this.email = email;
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public Integer getAddressID() {
        return addressID;
    }

    public void setAddressID(Integer addressID) {
        this.addressID = addressID;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
