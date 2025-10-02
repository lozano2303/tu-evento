package TuEvento.Backend.dto;

public class AddressDto {

    private Integer cityID;
    private String street;
    private String postalCode;

    public AddressDto() {
    }

    public AddressDto(int cityID, String street, String postalCode) {
        this.cityID = cityID;
        this.street = street;
        this.postalCode = postalCode;
    }

    // Getters and setters
    public int getCityID() {
        return cityID;
    }

    public void setCityID(int cityID) {
        this.cityID = cityID;
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
