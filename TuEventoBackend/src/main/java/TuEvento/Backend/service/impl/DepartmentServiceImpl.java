package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.Optional;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.DepartmentDto;
import TuEvento.Backend.model.Department;
import TuEvento.Backend.repository.DepartmentRepository;
import TuEvento.Backend.service.DepartmentService;
import jakarta.transaction.Transactional;

@Service
public class DepartmentServiceImpl implements DepartmentService{

    @Autowired
    private DepartmentRepository departmentRepository;

    // Validation patterns
    private static final Pattern DEPARTMENT_NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\\s\\-_.']+$");

    // Validation methods
    private String validateDepartmentName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "El nombre del departamento es obligatorio";
        }

        name = name.trim();

        if (name.length() < 2) {
            return "El nombre del departamento debe tener al menos 2 caracteres";
        }

        if (name.length() > 50) { // Según modelo Department.java
            return "El nombre del departamento no puede tener más de 50 caracteres";
        }

        if (!DEPARTMENT_NAME_PATTERN.matcher(name).matches()) {
            return "El nombre del departamento contiene caracteres no permitidos";
        }

        return null; // Valid
    }

    @Override
    @Transactional
    public ResponseDto<DepartmentDto> insertDepartment(DepartmentDto departmentDto) {
        try {
            // === VALIDACIONES DE ENTRADA ===

            // Validar nombre del departamento
            String nameError = validateDepartmentName(departmentDto.getName());
            if (nameError != null) {
                return ResponseDto.error(nameError);
            }

            // === VALIDACIONES DE NEGOCIO ===
            // Validaciones de negocio pueden agregarse aquí según requerimientos específicos

            // === CREACIÓN DE ENTIDAD ===
            Department department = new Department();
            department.setName(departmentDto.getName().trim());
            departmentRepository.save(department);

            return ResponseDto.ok("Departamento creado exitosamente");

        } catch (DataAccessException e) {
            System.err.println("Error de base de datos en creación de departamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos al crear el departamento");
        } catch (Exception e) {
            System.err.println("Error inesperado en creación de departamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error interno del servidor al crear el departamento");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateDepartment(int departmentID, String newName){
        Optional<Department> departmentOpt = departmentRepository.findById(departmentID);
        if (!departmentOpt.isPresent()){
            return ResponseDto.error("Departamento no encontrado");
        }
        try {
            Department department = departmentOpt.get();
            department.setName(newName);
            departmentRepository.save(department);
            return ResponseDto.ok("Departamento actualizado correctamente");
        } catch(DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el departamento");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteDepartment(int departmentID) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentID);
        if (!departmentOpt.isPresent()) {
            return ResponseDto.error("Departamento no encontrado");
        }
        try {
            departmentRepository.deleteById(departmentID);
            return ResponseDto.ok("Departamento eliminado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar el departamento");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar el departamento");
        }
    }

    @Override
    public ResponseDto<DepartmentDto> getDepartmentById(int departmentID) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentID);
        if (!departmentOpt.isPresent()) {
            return ResponseDto.error("Departamento no encontrado");
        }
        Department department = departmentOpt.get();
        DepartmentDto departmentDto = new DepartmentDto(department.getDepartmentID(), department.getName());
        return ResponseDto.ok("Departamento encontrado", departmentDto);
    }

    
    @Override
    public ResponseDto<List<DepartmentDto>> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();

        if (departments.isEmpty()) {
            return ResponseDto.error("No hay departamentos registrados");
        }

        List<DepartmentDto> departmentsDto = departments.stream()
            .map(dept -> new DepartmentDto(dept.getDepartmentID(), dept.getName()))
            .collect(Collectors.toList());

        return ResponseDto.ok("Departamentos encontrados", departmentsDto);
    }
}
