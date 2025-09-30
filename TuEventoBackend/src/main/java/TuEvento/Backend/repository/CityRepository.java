package TuEvento.Backend.repository;

import TuEvento.Backend.model.City;
import TuEvento.Backend.model.Department; // Importar Department para la búsqueda
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {
    // Busca una Ciudad por nombre y se asegura de que pertenezca al Departamento correcto.
    Optional<City> findByNameIgnoreCaseAndDepartment(String name, Department department);
}