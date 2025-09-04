package TuEvento.Backend.model;

import jakarta.persistence.*;

@Entity(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int addressID;

    @ManyToOne
    @JoinColumn(name = "cityID", nullable = false)
    private City city;

    private String street;
    private String postalCode;

    public Address() {
    }

    public Address(int addressID, City city, String street, String postalCode) {
        this.addressID = addressID;
        this.city = city;
        this.street = street;
        this.postalCode = postalCode;
    }

    // Getters and setters
    public int getAddressID() {
        return addressID;
    }

    public void setAddressID(int addressID) {
        this.addressID = addressID;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
}
