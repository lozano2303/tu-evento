package TuEvento.Backend.model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;

@Entity(name="login")
public class Login implements UserDetails {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="loginID", nullable=false)
    private int loginID;

    @OneToOne
    @JoinColumn(name="userID",nullable=false)
    private User userID;

    @Column(name="alias", length = 100)
    private String username;

    @Column(name="password", length = 20, nullable=false)
    private String password;

    @Column(name="email", length=100, nullable=false)
    private String email;

    @Column(name="loginDate", nullable=false)
    private LocalDateTime loginDate;

    public Login() {}

    // Implementación de métodos UserDetails

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // El rol viene de User y es un enum
        if (userID != null && userID.getRole() != null) {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userID.getRole().name()));
        }
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username; // O puedes usar email si lo prefieres
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Puedes agregar lógica si tienes campos para esto
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Puedes agregar lógica si tienes campos para esto
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Puedes agregar lógica si tienes campos para esto
    }

    @Override
    public boolean isEnabled() {
        // Puedes usar el campo activated de User o status
        return userID != null && userID.isActivated();
    }

    // Getters y setters propios de la entidad...

    public int getLoginID() {
        return loginID;
    }

    public void setLoginID(int loginID) {
        this.loginID = loginID;
    }

    public User getUserID() {
        return userID;
    }

    public void setUserID(User userID) {
        this.userID = userID;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getLoginDate() {
        return loginDate;
    }

    public void setLoginDate(LocalDateTime loginDate) {
        this.loginDate = loginDate;
    }
}