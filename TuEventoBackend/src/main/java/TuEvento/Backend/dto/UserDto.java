package TuEvento.Backend.dto;

import java.sql.Date;

public class UserDto {

    private String fullName;
    private String telephone;
    private Date birthDate;
    private Integer addressID; // Ahora puede ser null
    private boolean activated;

    public UserDto() {
    }

    public UserDto(String fullName, String telephone, Date birthDate, Integer addressID, boolean activated) {
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDate = birthDate;
        this.addressID = addressID;
        this.activated = activated;
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

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }
}
