package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LocationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.Location;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.repository.LocationRepository;
import TuEvento.Backend.service.LocationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private AddressRepository addressRepository;

    // Validation patterns
    private static final Pattern LOCATION_NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ0-9\\s\\-_.&()]+$");

    // Validation methods
    private String validateLocationName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "El nombre de la ubicación es obligatorio";
        }

        name = name.trim();

        if (name.length() < 2) {
            return "El nombre de la ubicación debe tener al menos 2 caracteres";
        }

        if (name.length() > 50) { // Según modelo Location.java
            return "El nombre de la ubicación no puede tener más de 50 caracteres";
        }

        if (!LOCATION_NAME_PATTERN.matcher(name).matches()) {
            return "El nombre de la ubicación contiene caracteres no permitidos";
        }

        return null; // Valid
    }

    private String validateAddress(Integer addressId) {
        if (addressId == null) {
            return "La dirección de la ubicación es obligatoria";
        }

        if (addressId <= 0) {
            return "El ID de dirección debe ser un número positivo";
        }

        return null; // Valid
    }

    @Override
    @Transactional
    public ResponseDto<LocationDto> insertLocation(LocationDto locationDto) {
        try {
            // === VALIDACIONES DE ENTRADA ===

            // Validar nombre de ubicación
            String nameError = validateLocationName(locationDto.getName());
            if (nameError != null) {
                return ResponseDto.error(nameError);
            }

            // Validar dirección
            String addressError = validateAddress(locationDto.getAddressID());
            if (addressError != null) {
                return ResponseDto.error(addressError);
            }

            // === VALIDACIONES DE RELACIONES ===

            // Verificar que la dirección existe
            Optional<Address> addressOpt = addressRepository.findById(locationDto.getAddressID());
            if (!addressOpt.isPresent()) {
                return ResponseDto.error("Dirección no encontrada");
            }

            // === VALIDACIONES DE NEGOCIO ===
            // Validaciones de negocio pueden agregarse aquí según requerimientos específicos

            // === CREACIÓN DE ENTIDAD ===
            Location location = new Location();
            location.setName(locationDto.getName().trim());
            location.setAddress(addressOpt.get());

            locationRepository.save(location);

            return ResponseDto.ok("Ubicación creada exitosamente",
                    new LocationDto(locationDto.getAddressID(), location.getName()));

        } catch (DataAccessException e) {
            System.err.println("Error de base de datos en creación de ubicación: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos al crear la ubicación");
        } catch (Exception e) {
            System.err.println("Error inesperado en creación de ubicación: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error interno del servidor al crear la ubicación");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateLocation(int locationID, LocationDto locationDto) {
        Optional<Location> locationOpt = locationRepository.findById(locationID);
        if (!locationOpt.isPresent()) {
            return ResponseDto.error("Ubicación no encontrada");
        }

        Optional<Address> addressOpt = addressRepository.findById(locationDto.getAddressID());
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        try {
            Location location = locationOpt.get();
            location.setName(locationDto.getName());
            location.setAddress(addressOpt.get());

            locationRepository.save(location);
            return ResponseDto.ok("Ubicación actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la ubicación");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteLocation(int locationID) {
        Optional<Location> locationOpt = locationRepository.findById(locationID);
        if (!locationOpt.isPresent()) {
            return ResponseDto.error("Ubicación no encontrada");
        }

        try {
            locationRepository.deleteById(locationID);
            return ResponseDto.ok("Ubicación eliminada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar la ubicación");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar la ubicación");
        }
    }

    @Override
    public ResponseDto<List<LocationDto>> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        List<LocationDto> locationsDto = locations.stream()
                .map(loc -> new LocationDto(loc.getAddress().getAddressID(), loc.getName()))
                .collect(Collectors.toList());

        return ResponseDto.ok("Ubicaciones encontradas", locationsDto);
    }

    @Override
    public ResponseDto<LocationDto> getLocationById(int locationID) {
        Optional<Location> locationOpt = locationRepository.findById(locationID);
        if (!locationOpt.isPresent()) {
            return ResponseDto.error("Ubicación no encontrada");
        }

        Location location = locationOpt.get();
        LocationDto locationDto = new LocationDto(location.getAddress().getAddressID(), location.getName());

        return ResponseDto.ok("Ubicación encontrada", locationDto);
    }
}
