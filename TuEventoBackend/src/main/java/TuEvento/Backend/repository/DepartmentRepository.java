package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.Department;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Integer>{
    // Busca un Departamento por nombre, ignorando mayúsculas y minúsculas.
    Optional<Department> findByNameIgnoreCase(String name);
}