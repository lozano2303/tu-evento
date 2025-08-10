package TuEvento.Backend.dto;

import java.sql.Date;

public class UserDto {

    private String fullName;

    private String telephone;

    private Date birthDate;

    private String address;

    public UserDto(){
    }

    public UserDto(String fullName, String telephone, Date birthDate, String address) {
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDate = birthDate;
        this.address = address;
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

    
}
