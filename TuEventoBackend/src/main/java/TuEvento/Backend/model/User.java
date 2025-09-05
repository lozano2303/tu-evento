package TuEvento.Backend.model;

import java.sql.Date;
import jakarta.persistence.*;

@Entity(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID")
    private int userID;

    @Column(name = "fullName", length = 70, nullable = false)
    private String fullName;

    @Column(name = "telephone", length = 11)
    private String telephone;

    @Column(name = "status", nullable = false, columnDefinition = "boolean default true")
    private boolean status;

    @Column(name = "activated", nullable = false)
    private boolean activated;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @Column(name = "birthDate")
    private Date birthDate;

    @ManyToOne
    @JoinColumn(name = "addressID", nullable = true)
    private Address address;

    @Column(name = "organicer", nullable = false)
    private boolean organicer;

    public User() {
    }

    public User(int userID, String fullName, String telephone, boolean status, boolean activated, Role role,
                Date birthDate, Address address, boolean organicer) {
        this.userID = userID;
        this.fullName = fullName;
        this.telephone = telephone;
        this.status = status;
        this.activated = activated;
        this.role = role;
        this.birthDate = birthDate;
        this.address = address;
        this.organicer = organicer;
    }

    // Getters and setters
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

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public boolean isOrganicer() {
        return organicer;
    }

    public void setOrganicer(boolean organicer) {
        this.organicer = organicer;
    }
}
