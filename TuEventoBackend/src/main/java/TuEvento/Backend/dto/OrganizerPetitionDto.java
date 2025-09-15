package TuEvento.Backend.dto;

public class OrganizerPetitionDto {

    private int userID;
    private int status;

    public OrganizerPetitionDto() {}

    public OrganizerPetitionDto(int userID, int status) {
        this.userID = userID;
        this.status = status;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
