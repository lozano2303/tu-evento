package TuEvento.Backend.dto;

import java.sql.Date;

public class UserSocial {
    private int userID;
    private String fullName;
    private String telephone;
    private Date birthDate;
    private String address;
    public UserSocial(){
    }

    public UserSocial(int userID, String fullName, String telephone, Date birthDate, String address) {
        this.userID = userID;
        this.fullName = fullName;
        this.telephone = telephone;
        this.birthDate = birthDate;
        this.address = address;
    }
    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
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
