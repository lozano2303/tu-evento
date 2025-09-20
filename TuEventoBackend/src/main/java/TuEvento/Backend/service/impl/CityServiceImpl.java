package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.CityDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.City;
import TuEvento.Backend.model.Department;
import TuEvento.Backend.repository.CityRepository;
import TuEvento.Backend.service.CityService;
import TuEvento.Backend.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CityServiceImpl implements CityService {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // Validation patterns
    private static final Pattern CITY_NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\\s\\-_.']+$");

    // Validation methods
    private String validateCityName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "El nombre de la ciudad es obligatorio";
        }

        name = name.trim();

        if (name.length() < 2) {
            return "El nombre de la ciudad debe tener al menos 2 caracteres";
        }

        if (name.length() > 100) {
            return "El nombre de la ciudad no puede tener más de 100 caracteres";
        }

        if (!CITY_NAME_PATTERN.matcher(name).matches()) {
            return "El nombre de la ciudad contiene caracteres no permitidos";
        }

        return null; // Valid
    }

    private String validateDepartment(Integer departmentId) {
        if (departmentId == null) {
            return "El departamento de la ciudad es obligatorio";
        }

        if (departmentId <= 0) {
            return "El ID de departamento debe ser un número positivo";
        }

        return null; // Valid
    }

    @Override
    @Transactional
    public ResponseDto<CityDto> insertCity(CityDto cityDto) {
        try {
            // === VALIDACIONES DE ENTRADA ===

            // Validar nombre de ciudad
            String nameError = validateCityName(cityDto.getName());
            if (nameError != null) {
                return ResponseDto.error(nameError);
            }

            // Validar departamento
            String departmentError = validateDepartment(cityDto.getDepartmentID());
            if (departmentError != null) {
                return ResponseDto.error(departmentError);
            }

            // === VALIDACIONES DE RELACIONES ===

            // Verificar que el departamento existe
            Optional<Department> departmentOpt = departmentRepository.findById(cityDto.getDepartmentID());
            if (!departmentOpt.isPresent()) {
                return ResponseDto.error("Departamento no encontrado");
            }

            // === VALIDACIONES DE NEGOCIO ===
            // Validaciones de negocio pueden agregarse aquí según requerimientos específicos

            // === CREACIÓN DE ENTIDAD ===
            City city = new City();
            city.setName(cityDto.getName().trim());
            city.setDepartment(departmentOpt.get());

            cityRepository.save(city);

            return ResponseDto.ok("Ciudad creada exitosamente", new CityDto(cityDto.getDepartmentID(), city.getName()));

        } catch (DataAccessException e) {
            System.err.println("Error de base de datos en creación de ciudad: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos al crear la ciudad");
        } catch (Exception e) {
            System.err.println("Error inesperado en creación de ciudad: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error interno del servidor al crear la ciudad");
        }
    }

    @Override
        @Transactional
        public ResponseDto<String> deleteCity(int cityID) {
            Optional<City> cityOpt = cityRepository.findById(cityID);
            if (!cityOpt.isPresent()) {
                return ResponseDto.error("Ciudad no encontrada");
            }

            try {
                cityRepository.deleteById(cityID);
                return ResponseDto.ok("Ciudad eliminada correctamente");
            } catch (DataAccessException e) {
                return ResponseDto.error("Error de la base de datos al eliminar la ciudad");
            } catch (Exception e) {
                return ResponseDto.error("Error inesperado al eliminar la ciudad");
            }
        }

    @Override
    @Transactional
    public ResponseDto<String> updateCity(int cityID, CityDto cityDto) {
        Optional<City> cityOpt = cityRepository.findById(cityID);
        if (!cityOpt.isPresent()) {
            return ResponseDto.error("Ciudad no encontrada");
        }

        Optional<Department> departmentOpt = departmentRepository.findById(cityDto.getDepartmentID());
        if (!departmentOpt.isPresent()) {
            return ResponseDto.error("Departamento no encontrado");
        }

        try {
            City city = cityOpt.get();
            city.setName(cityDto.getName());
            city.setDepartment(departmentOpt.get());

            cityRepository.save(city);
            return ResponseDto.ok("Ciudad actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la ciudad");
        }
    }

    @Override
    public ResponseDto<List<CityDto>> getAllCities() {
        List<City> cities = cityRepository.findAll();

        if (cities.isEmpty()) {
            return ResponseDto.error("No hay ciudades registradas");
        }

        List<CityDto> citiesDto = cities.stream()
            .map(city -> new CityDto(city.getDepartment().getDepartmentID(), city.getName()))
            .collect(Collectors.toList());

        return ResponseDto.ok("Ciudades encontradas", citiesDto);
    }
    
    @Override
    public ResponseDto<CityDto> getCityById(int cityID) {
        Optional<City> cityOpt = cityRepository.findById(cityID);
        if (!cityOpt.isPresent()) {
            return ResponseDto.error("Ciudad no encontrada");
        }

        City city = cityOpt.get();
        CityDto cityDto = new CityDto(city.getDepartment().getDepartmentID(), city.getName());

        return ResponseDto.ok("Ciudad encontrada", cityDto);
    }
}
