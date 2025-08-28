package TuEvento.Backend.dto;

public class DepartmentDto {

    private String name;

    public DepartmentDto(){
    }

    public DepartmentDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
