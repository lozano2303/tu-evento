package TuEvento.Backend.dto;

import java.sql.Date;

public class UserDto {

    private int userID;
    private String fullName;
    private String telephone;
    private Date birthDate;
    private Integer address;
    private boolean activated;
    private boolean status;
    private boolean organizer;
    private String role;
    private String email;

    public UserDto() {
    }

    public UserDto(int userID, String fullName, String telephone, Date birthDate, Integer address, boolean activated, boolean status, boolean organizer, String role, String email) {
        this.userID = userID;
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDate = birthDate;
        this.address = address;
        this.activated = activated;
        this.status = status;
        this.organizer = organizer;
        this.role = role;
        this.email = email;
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

    public Integer getAddress() {
        return address;
    }

    public void setAddress(Integer address) {
        this.address = address;
    }

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public boolean isOrganizer() {
        return organizer;
    }

    public void setOrganizer(boolean organizer) {
        this.organizer = organizer;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
