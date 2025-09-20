package TuEvento.Backend.repository;

import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginRepository extends JpaRepository<Login, Integer> {
    Optional<Login> findByEmail(String email);
    Optional<Login> findByUsername(String username);
    Optional<Login> findByUserID(User user);
}