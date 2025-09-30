package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.*;
import TuEvento.Backend.repository.*;
import java.util.Optional; // Necesario para la búsqueda eficiente

@Component
public class GeoDataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private LocationRepository locationRepository;
    
    // --- Métodos Auxiliares para Búsqueda/Creación Eficiente ---
    
    // Asume que AddressRepository tiene: Optional<Address> findByStreetAndCity(String street, City city);
    private Address findOrCreateAddress(String street, String postalCode, City city) {
        return addressRepository.findByStreetAndCity(street, city)
                .orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet(street);
                    newAddr.setPostalCode(postalCode);
                    newAddr.setCity(city);
                    return addressRepository.save(newAddr);
                });
    }

    // Asume que LocationRepository tiene: boolean existsByNameAndAddress(String name, Address address);
    private void createLocationIfNotExists(String name, Address address) {
        if (!locationRepository.existsByNameAndAddress(name, address)) {
            Location newLocation = new Location();
            newLocation.setName(name);
            newLocation.setAddress(address);
            locationRepository.save(newLocation);
        }
    }

    // --- Método Principal de Ejecución ---

    @Override
    public void run(String... args) throws Exception {
        
        // **BÚSQUEDA OPTIMIZADA: Department (findByNameIgnoreCase)**
        final Department cundinamarca = departmentRepository.findByNameIgnoreCase("Cundinamarca")
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName("Cundinamarca");
                    return departmentRepository.save(newDept);
                });

        // **BÚSQUEDA OPTIMIZADA: City (findByNameIgnoreCaseAndDepartment)**
        final City bogota = cityRepository.findByNameIgnoreCaseAndDepartment("Bogotá", cundinamarca)
                .orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Bogotá");
                    newCity.setDepartment(cundinamarca);
                    return cityRepository.save(newCity);
                });

        // Ubicación 1 en Bogotá
        final Address addressBogota = findOrCreateAddress("Calle 123", "110111", bogota);
        createLocationIfNotExists("Teatro Nacional", addressBogota);

        // Ubicación 2 en Bogotá
        final Address addressBogota2 = findOrCreateAddress("Carrera 7", "110113", bogota);
        createLocationIfNotExists("Museo Nacional", addressBogota2);

        // Soacha
        final City soacha = cityRepository.findByNameIgnoreCaseAndDepartment("Soacha", cundinamarca)
                .orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Soacha");
                    newCity.setDepartment(cundinamarca);
                    return cityRepository.save(newCity);
                });

        // Ubicaciones en Soacha
        final Address addressSoacha = findOrCreateAddress("Avenida 123", "110112", soacha);
        createLocationIfNotExists("Centro Cultural Soacha", addressSoacha);

        final Address addressSoacha2 = findOrCreateAddress("Calle 45", "110113", soacha);
        createLocationIfNotExists("Biblioteca Soacha", addressSoacha2);

        // Antioquia
        final Department antioquia = departmentRepository.findByNameIgnoreCase("Antioquia")
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName("Antioquia");
                    return departmentRepository.save(newDept);
                });

        // Medellín
        final City medellin = cityRepository.findByNameIgnoreCaseAndDepartment("Medellín", antioquia)
                .orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Medellín");
                    newCity.setDepartment(antioquia);
                    return cityRepository.save(newCity);
                });

        // Ubicaciones en Medellín
        final Address addressMedellin = findOrCreateAddress("Carrera 45", "050001", medellin);
        createLocationIfNotExists("Estadio Atanasio Girardot", addressMedellin);

        final Address addressMedellin2 = findOrCreateAddress("Avenida 80", "050004", medellin);
        createLocationIfNotExists("Centro de Convenciones", addressMedellin2);

        // Envigado
        final City envigado = cityRepository.findByNameIgnoreCaseAndDepartment("Envigado", antioquia)
                .orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Envigado");
                    newCity.setDepartment(antioquia);
                    return cityRepository.save(newCity);
                });

        // Ubicaciones en Envigado
        final Address addressEnvigado = findOrCreateAddress("Calle 67", "050003", envigado);
        createLocationIfNotExists("Parque Envigado", addressEnvigado);

        final Address addressEnvigado2 = findOrCreateAddress("Carrera 43A", "050005", envigado);
        createLocationIfNotExists("Centro Comercial Envigado", addressEnvigado2);
    }
}