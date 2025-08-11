package TuEvento.Backend.repository;

import TuEvento.Backend.model.Login;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginRepository extends JpaRepository<Login, Integer> {
    Login findByEmail(String email);
}