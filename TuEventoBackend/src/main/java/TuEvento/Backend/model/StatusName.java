package TuEvento.Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity(name="status_name")
public class StatusName {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private int statusNameID;

@Column(name="statusName", nullable=false, length=30)
private String statusName;

public StatusName() {
}

public StatusName(int statusNameID, String statusName) {
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
