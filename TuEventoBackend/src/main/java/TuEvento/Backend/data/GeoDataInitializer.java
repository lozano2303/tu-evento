package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.*;
import TuEvento.Backend.repository.*;

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

    @Override
    public void run(String... args) throws Exception {
        // Opción 1: Cundinamarca -> Bogotá -> Address -> Location
        final Department cundinamarca = departmentRepository.findAll().stream()
                .filter(d -> "Cundinamarca".equalsIgnoreCase(d.getName()))
                .findFirst().orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName("Cundinamarca");
                    return departmentRepository.save(newDept);
                });

        final City bogota = cityRepository.findAll().stream()
                .filter(c -> "Bogotá".equalsIgnoreCase(c.getName()) && cundinamarca.equals(c.getDepartment()))
                .findFirst().orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Bogotá");
                    newCity.setDepartment(cundinamarca);
                    return cityRepository.save(newCity);
                });

        final Address addressBogota = addressRepository.findAll().stream()
                .filter(a -> "Calle 123".equals(a.getStreet()) && bogota.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Calle 123");
                    newAddr.setPostalCode("110111");
                    newAddr.setCity(bogota);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Teatro Nacional".equals(l.getName()) && addressBogota.equals(l.getAddress()))) {
            Location teatroNacional = new Location();
            teatroNacional.setName("Teatro Nacional");
            teatroNacional.setAddress(addressBogota);
            locationRepository.save(teatroNacional);
        }

        // Segunda address y location para Bogotá
        final Address addressBogota2 = addressRepository.findAll().stream()
                .filter(a -> "Carrera 7".equals(a.getStreet()) && bogota.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Carrera 7");
                    newAddr.setPostalCode("110113");
                    newAddr.setCity(bogota);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Museo Nacional".equals(l.getName()) && addressBogota2.equals(l.getAddress()))) {
            Location museoNacional = new Location();
            museoNacional.setName("Museo Nacional");
            museoNacional.setAddress(addressBogota2);
            locationRepository.save(museoNacional);
        }

        // Segunda ciudad en Cundinamarca: Soacha
        final City soacha = cityRepository.findAll().stream()
                .filter(c -> "Soacha".equalsIgnoreCase(c.getName()) && cundinamarca.equals(c.getDepartment()))
                .findFirst().orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Soacha");
                    newCity.setDepartment(cundinamarca);
                    return cityRepository.save(newCity);
                });

        final Address addressSoacha = addressRepository.findAll().stream()
                .filter(a -> "Avenida 123".equals(a.getStreet()) && soacha.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Avenida 123");
                    newAddr.setPostalCode("110112");
                    newAddr.setCity(soacha);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Centro Cultural Soacha".equals(l.getName()) && addressSoacha.equals(l.getAddress()))) {
            Location centroSoacha = new Location();
            centroSoacha.setName("Centro Cultural Soacha");
            centroSoacha.setAddress(addressSoacha);
            locationRepository.save(centroSoacha);
        }

        // Segunda address y location para Soacha
        final Address addressSoacha2 = addressRepository.findAll().stream()
                .filter(a -> "Calle 45".equals(a.getStreet()) && soacha.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Calle 45");
                    newAddr.setPostalCode("110113");
                    newAddr.setCity(soacha);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Biblioteca Soacha".equals(l.getName()) && addressSoacha2.equals(l.getAddress()))) {
            Location bibliotecaSoacha = new Location();
            bibliotecaSoacha.setName("Biblioteca Soacha");
            bibliotecaSoacha.setAddress(addressSoacha2);
            locationRepository.save(bibliotecaSoacha);
        }

        // Opción 2: Antioquia -> Medellín -> Address -> Location
        final Department antioquia = departmentRepository.findAll().stream()
                .filter(d -> "Antioquia".equalsIgnoreCase(d.getName()))
                .findFirst().orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName("Antioquia");
                    return departmentRepository.save(newDept);
                });

        final City medellin = cityRepository.findAll().stream()
                .filter(c -> "Medellín".equalsIgnoreCase(c.getName()) && antioquia.equals(c.getDepartment()))
                .findFirst().orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Medellín");
                    newCity.setDepartment(antioquia);
                    return cityRepository.save(newCity);
                });

        final Address addressMedellin = addressRepository.findAll().stream()
                .filter(a -> "Carrera 45".equals(a.getStreet()) && medellin.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Carrera 45");
                    newAddr.setPostalCode("050001");
                    newAddr.setCity(medellin);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Estadio Atanasio Girardot".equals(l.getName()) && addressMedellin.equals(l.getAddress()))) {
            Location estadio = new Location();
            estadio.setName("Estadio Atanasio Girardot");
            estadio.setAddress(addressMedellin);
            locationRepository.save(estadio);
        }

        // Segunda address y location para Medellín
        final Address addressMedellin2 = addressRepository.findAll().stream()
                .filter(a -> "Avenida 80".equals(a.getStreet()) && medellin.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Avenida 80");
                    newAddr.setPostalCode("050004");
                    newAddr.setCity(medellin);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Centro de Convenciones".equals(l.getName()) && addressMedellin2.equals(l.getAddress()))) {
            Location centroConvenciones = new Location();
            centroConvenciones.setName("Centro de Convenciones");
            centroConvenciones.setAddress(addressMedellin2);
            locationRepository.save(centroConvenciones);
        }

        // Segunda ciudad en Antioquia: Envigado
        final City envigado = cityRepository.findAll().stream()
                .filter(c -> "Envigado".equalsIgnoreCase(c.getName()) && antioquia.equals(c.getDepartment()))
                .findFirst().orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName("Envigado");
                    newCity.setDepartment(antioquia);
                    return cityRepository.save(newCity);
                });

        final Address addressEnvigado = addressRepository.findAll().stream()
                .filter(a -> "Calle 67".equals(a.getStreet()) && envigado.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Calle 67");
                    newAddr.setPostalCode("050003");
                    newAddr.setCity(envigado);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Parque Envigado".equals(l.getName()) && addressEnvigado.equals(l.getAddress()))) {
            Location parqueEnvigado = new Location();
            parqueEnvigado.setName("Parque Envigado");
            parqueEnvigado.setAddress(addressEnvigado);
            locationRepository.save(parqueEnvigado);
        }

        // Segunda address y location para Envigado
        final Address addressEnvigado2 = addressRepository.findAll().stream()
                .filter(a -> "Carrera 43A".equals(a.getStreet()) && envigado.equals(a.getCity()))
                .findFirst().orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setStreet("Carrera 43A");
                    newAddr.setPostalCode("050005");
                    newAddr.setCity(envigado);
                    return addressRepository.save(newAddr);
                });

        if (locationRepository.findAll().stream().noneMatch(l -> "Centro Comercial Envigado".equals(l.getName()) && addressEnvigado2.equals(l.getAddress()))) {
            Location centroComercial = new Location();
            centroComercial.setName("Centro Comercial Envigado");
            centroComercial.setAddress(addressEnvigado2);
            locationRepository.save(centroComercial);
        }
    }
}