package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Department;

public interface DepartmentRepository extends JpaRepository<Department, Integer>{
}
