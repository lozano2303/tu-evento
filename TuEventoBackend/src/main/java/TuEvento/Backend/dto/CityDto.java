package TuEvento.Backend.dto;

public class CityDto {

    private int departmentID;
    private String name;

    // Constructor
    public CityDto() {}

    public CityDto(int departmentID, String name) {
        this.departmentID = departmentID;
        this.name = name;
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
}
