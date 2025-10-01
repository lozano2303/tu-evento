package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.AddressDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.City;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.repository.CityRepository;
import TuEvento.Backend.service.AddressService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CityRepository cityRepository;

    // Validation patterns
    private static final Pattern STREET_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ0-9\\s\\-_.#]+$");
    private static final Pattern POSTAL_CODE_PATTERN = Pattern.compile("^[A-Z0-9\\s-]{3,10}$");

    // Validation methods
    private String validateCity(Integer cityId) {
        if (cityId == null) {
            return "La ciudad de la dirección es obligatoria";
        }

        if (cityId <= 0) {
            return "El ID de ciudad debe ser un número positivo";
        }

        return null; // Valid
    }

    private String validateStreet(String street) {
        if (street != null && !street.trim().isEmpty()) {
            street = street.trim();

            if (street.length() < 3) {
                return "La calle debe tener al menos 3 caracteres";
            }

            if (street.length() > 100) {
                return "La calle no puede tener más de 100 caracteres";
            }

            if (!STREET_PATTERN.matcher(street).matches()) {
                return "La calle contiene caracteres no permitidos";
            }
        }

        return null; // Valid (street is optional)
    }

    private String validatePostalCode(String postalCode) {
        if (postalCode != null && !postalCode.trim().isEmpty()) {
            postalCode = postalCode.trim();

            if (postalCode.length() < 3) {
                return "El código postal debe tener al menos 3 caracteres";
            }

            if (postalCode.length() > 10) {
                return "El código postal no puede tener más de 10 caracteres";
            }

            if (!POSTAL_CODE_PATTERN.matcher(postalCode).matches()) {
                return "El código postal contiene caracteres no permitidos";
            }
        }

        return null; // Valid (postalCode is optional)
    }

    @Override
    @Transactional
    public ResponseDto<Integer> insertAddress(AddressDto addressDto) {
        try {
            // === VALIDACIONES DE ENTRADA ===

            // Validar ciudad
            String cityError = validateCity(addressDto.getCityID());
            if (cityError != null) {
                return ResponseDto.error(cityError);
            }

            // Validar calle
            String streetError = validateStreet(addressDto.getStreet());
            if (streetError != null) {
                return ResponseDto.error(streetError);
            }

            // Validar código postal
            String postalCodeError = validatePostalCode(addressDto.getPostalCode());
            if (postalCodeError != null) {
                return ResponseDto.error(postalCodeError);
            }

            // === VALIDACIONES DE RELACIONES ===

            // Verificar que la ciudad existe
            Optional<City> cityOpt = cityRepository.findById(addressDto.getCityID());
            if (!cityOpt.isPresent()) {
                return ResponseDto.error("Ciudad no encontrada");
            }

            // === CREACIÓN DE ENTIDAD ===
            Address address = new Address();
            address.setCity(cityOpt.get());

            // Asignar calle si no es null/vacía
            if (addressDto.getStreet() != null && !addressDto.getStreet().trim().isEmpty()) {
                address.setStreet(addressDto.getStreet().trim());
            }

            // Asignar código postal si no es null/vacío
            if (addressDto.getPostalCode() != null && !addressDto.getPostalCode().trim().isEmpty()) {
                address.setPostalCode(addressDto.getPostalCode().trim());
            }

            addressRepository.save(address);

            return ResponseDto.ok("Dirección creada exitosamente", address.getAddressID());

        } catch (DataAccessException e) {
            System.err.println("Error de base de datos en creación de dirección: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos al crear la dirección");
        } catch (Exception e) {
            System.err.println("Error inesperado en creación de dirección: " + e.getMessage());
            e.printStackTrace();
            return ResponseDto.error("Error interno del servidor al crear la dirección");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateAddress(int addressID, AddressDto addressDto) {
        Optional<Address> addressOpt = addressRepository.findById(addressID);
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        Optional<City> cityOpt = cityRepository.findById(addressDto.getCityID());
        if (!cityOpt.isPresent()) {
            return ResponseDto.error("Ciudad no encontrada");
        }

        try {
            Address address = addressOpt.get();
            address.setStreet(addressDto.getStreet());
            address.setPostalCode(addressDto.getPostalCode());
            address.setCity(cityOpt.get());

            addressRepository.save(address);
            return ResponseDto.ok("Dirección actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la dirección");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteAddress(int addressID) {
        Optional<Address> addressOpt = addressRepository.findById(addressID);
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        try {
            addressRepository.deleteById(addressID);
            return ResponseDto.ok("Dirección eliminada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar la dirección");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar la dirección");
        }
    }

    @Override
    public ResponseDto<List<AddressDto>> getAllAddresses() {
        List<Address> addresses = addressRepository.findAll();
        List<AddressDto> addressesDto = addresses.stream()
                .map(address -> new AddressDto(
                        address.getCity().getCityID(),
                        address.getStreet(),
                        address.getPostalCode()))
                .collect(Collectors.toList());

        return ResponseDto.ok("Direcciones encontradas", addressesDto);
    }

    @Override
    public ResponseDto<AddressDto> getAddressById(int addressID) {
        Optional<Address> addressOpt = addressRepository.findById(addressID);
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        Address address = addressOpt.get();
        AddressDto addressDto = new AddressDto(
                address.getCity().getCityID(),
                address.getStreet(),
                address.getPostalCode());

        return ResponseDto.ok("Dirección encontrada", addressDto);
    }
}
