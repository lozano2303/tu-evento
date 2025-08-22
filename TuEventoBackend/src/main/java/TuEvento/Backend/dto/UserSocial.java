package TuEvento.Backend.dto;

public class UserSocial {
    private int userID;
    public UserSocial(){
    }
    public UserSocial(int userID) {
        this.userID = userID;
    }
    public int getUserID() {
        return userID;
    }
    public void setUserID(int userID) {
        this.userID = userID;
    }
}
