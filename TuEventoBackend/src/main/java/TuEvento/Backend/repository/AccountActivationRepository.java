package TuEvento.Backend.repository;

import TuEvento.Backend.model.AccountActivation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountActivationRepository extends JpaRepository<AccountActivation, Integer> {
    Optional<AccountActivation> findByUserID_UserID(int userId);
}