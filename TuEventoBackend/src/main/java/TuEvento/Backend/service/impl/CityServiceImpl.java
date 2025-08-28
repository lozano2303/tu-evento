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
import java.util.stream.Collectors;

@Service
public class CityServiceImpl implements CityService {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public ResponseDto<CityDto> insertCity(CityDto cityDto) {
        Optional<Department> departmentOpt = departmentRepository.findById(cityDto.getDepartmentID());
        if (!departmentOpt.isPresent()) {
            return ResponseDto.error("Departamento no encontrado");
        }

        try {
            City city = new City();
            city.setName(cityDto.getName());
            city.setPostalCode(cityDto.getPostalCode());
            city.setDepartment(departmentOpt.get());

            cityRepository.save(city);

            // Retornar la ciudad creada (sin cityID ya que se generará automáticamente)
            return ResponseDto.ok("Ciudad insertada correctamente", new CityDto(cityDto.getDepartmentID(), city.getName(), city.getPostalCode()));
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar la ciudad");
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
            city.setPostalCode(cityDto.getPostalCode());
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
    public ResponseDto<List<CityDto>> getAllCities() {
        List<City> cities = cityRepository.findAll();
        List<CityDto> citiesDto = cities.stream()
            .map(city -> new CityDto(city.getDepartment().getDepartmentID(), city.getName(), city.getPostalCode()))
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
        CityDto cityDto = new CityDto(city.getDepartment().getDepartmentID(), city.getName(), city.getPostalCode());

        return ResponseDto.ok("Ciudad encontrada", cityDto);
    }
}
