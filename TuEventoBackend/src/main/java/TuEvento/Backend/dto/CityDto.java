package TuEvento.Backend.dto;

public class CityDto {

    private int departmentID;
    private String name;
    private String postalCode;

    // Constructor
    public CityDto() {}

    public CityDto(int departmentID, String name, String postalCode) {
        this.departmentID = departmentID;
        this.name = name;
        this.postalCode = postalCode;
    }

    // Getters and setters
    public int getDepartmentID() {
        return departmentID;
    }

    public void setDepartmentID(int departmentID) {
        this.departmentID = departmentID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
}
