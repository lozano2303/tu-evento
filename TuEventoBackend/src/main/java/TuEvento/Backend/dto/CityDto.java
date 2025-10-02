package TuEvento.Backend.dto;

public class CityDto {

    private int cityID;
    private int departmentID;
    private String name;

    // Constructor
    public CityDto() {}

    public CityDto(int cityID, int departmentID, String name) {
        this.cityID = cityID;
        this.departmentID = departmentID;
        this.name = name;
    }

    // Getters and setters
    public int getCityID() {
        return cityID;
    }

    public void setCityID(int cityID) {
        this.cityID = cityID;
    }

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
}
