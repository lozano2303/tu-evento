package TuEvento.Backend.dto;

import java.sql.Date;

public class RegisterRequestDto {

    private String fullName;
    private String telephone;
    private Date birthDate;
    private String address;
    private String email;
    private String password;

    public RegisterRequestDto() {}

    public RegisterRequestDto(String fullName, String telephone, Date birthDate, String address, String email, String password) {
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDate = birthDate;
        this.address = address;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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
