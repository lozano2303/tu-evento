package TuEvento.Backend.dto;

public class LocationDto {

    private int addressID;
    private String name;

    public LocationDto() {
    }

    public LocationDto(int addressID, String name) {
        this.addressID = addressID;
        this.name = name;
    }

    // Getters and setters
    public int getAddressID() {
        return addressID;
    }

    public void setAddressID(int addressID) {
        this.addressID = addressID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
