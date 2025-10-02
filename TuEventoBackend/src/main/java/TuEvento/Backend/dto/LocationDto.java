package TuEvento.Backend.dto;

public class LocationDto {

    private int locationID;
    private int addressID;
    private int cityID;
    private String name;

    public LocationDto() {
    }

    public LocationDto(int locationID, int addressID, int cityID, String name) {
        this.locationID = locationID;
        this.addressID = addressID;
        this.cityID = cityID;
        this.name = name;
    }

    // Getters and setters
    public int getLocationID() {
        return locationID;
    }

    public void setLocationID(int locationID) {
        this.locationID = locationID;
    }

    public int getAddressID() {
        return addressID;
    }

    public void setAddressID(int addressID) {
        this.addressID = addressID;
    }

    public int getCityID() {
        return cityID;
    }

    public void setCityID(int cityID) {
        this.cityID = cityID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
