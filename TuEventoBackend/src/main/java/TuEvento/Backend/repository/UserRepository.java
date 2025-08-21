package TuEvento.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import TuEvento.Backend.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    List<User> findByFullNameContainingIgnoreCase(String name);

    @Query("SELECT u FROM app_user u WHERE u.fullName like %?1%")
    List<User> findByFullName(String fullName);
}