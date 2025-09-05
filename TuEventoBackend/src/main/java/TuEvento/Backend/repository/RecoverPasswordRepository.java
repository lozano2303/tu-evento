package TuEvento.Backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.RecoverPassword;
public interface RecoverPasswordRepository extends JpaRepository<RecoverPassword, Integer> {
    Optional<RecoverPassword> findByCode(String code);
}
