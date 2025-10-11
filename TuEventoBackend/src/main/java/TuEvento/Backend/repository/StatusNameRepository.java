package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.StatusName;

public interface StatusNameRepository extends JpaRepository<StatusName, Integer> {
  //JPA tiene los metodos de búsqueda de las interfaces de repositorio
}
