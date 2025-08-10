package TuEvento.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    List<User> findByFullNameContainingIgnoreCase(String name);
}