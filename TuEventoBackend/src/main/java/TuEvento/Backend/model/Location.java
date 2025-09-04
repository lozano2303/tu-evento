package TuEvento.Backend.model;

import jakarta.persistence.*;

@Entity(name = "location")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int locationID;

    @ManyToOne
    @JoinColumn(name = "addressID", nullable = false)
    private Address address;

    @Column(length = 50, nullable = false)
    private String name;

    public Location() {
    }

    public Location(int locationID, Address address, String name) {
        this.locationID = locationID;
        this.address = address;
        this.name = name;
    }

    // Getters and setters
    public int getLocationID() {
        return locationID;
    }

    public void setLocationID(int locationID) {
        this.locationID = locationID;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
