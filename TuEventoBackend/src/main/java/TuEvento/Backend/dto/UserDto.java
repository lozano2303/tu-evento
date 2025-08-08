package TuEvento.Backend.dto;

import java.util.Date;

public class UserDto {

    private String fullName;

    private String telephone;

    private Date birthDay;

    private String address;

    public UserDto(){
    }

    public UserDto(String fullName, String telephone, Date birthDay, String address) {
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDay = birthDay;
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

    public Date getBirthDay() {
        return birthDay;
    }

    public void setBirthDay(Date birthDay) {
        this.birthDay = birthDay;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
