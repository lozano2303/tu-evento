package TuEvento.Backend.dto;

public class StatusNameDto {
    private int statusNameID;
    private String statusName;

    public StatusNameDto(){}

    public StatusNameDto(int statusNameID, String statusName) {
        this.statusNameID = statusNameID;
        this.statusName = statusName;
    }

    public int getStatusNameID() {
        return statusNameID;
    }

    public void setStatusNameID(int statusNameID) {
        this.statusNameID = statusNameID;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }
}
