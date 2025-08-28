package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.Optional;
import java.util.List;

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

    @Override
    @Transactional
    public ResponseDto<DepartmentDto> insertDepartment(DepartmentDto departmentDto) {
        try {
            Department department = new Department();
            department.setName(departmentDto.getName());
            departmentRepository.save(department);
            
            return ResponseDto.ok("Departamento insertado correctamente");
        } catch(DataAccessException e){
            return ResponseDto.error("Error de base de datos");
        } catch(Exception e){
            return ResponseDto.error("Error inesperado al insertar el departamento");
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
        DepartmentDto departmentDto = new DepartmentDto(department.getName());
        return ResponseDto.ok("Departamento encontrado", departmentDto);
    }

    
    @Override
    public ResponseDto<List<DepartmentDto>> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentDto> departmentsDto = departments.stream()
            .map(dept -> new DepartmentDto(dept.getName()))
            .toList();
        return ResponseDto.ok("Departamentos encontrados", departmentsDto);
    }
}
