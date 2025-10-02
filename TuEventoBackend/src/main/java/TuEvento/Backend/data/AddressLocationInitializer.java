package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.Location;
import TuEvento.Backend.model.City;
import TuEvento.Backend.repository.*;
import java.util.Optional;

// Apache POI imports for Excel reading
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.IOException;

@Component
public class AddressLocationInitializer implements CommandLineRunner {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private CityRepository cityRepository;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si ya hay datos para evitar duplicados
        if (addressRepository.count() > 0 || locationRepository.count() > 0) {
            System.out.println("Datos address/location ya existen. Saltando inicialización.");
            return;
        }

        // Log de ciudades disponibles
        System.out.println("Ciudades en BD: " + cityRepository.findAll().stream().map(City::getName).toList());

        // Cargar datos desde Excel
        loadAddressesFromExcel();
        loadLocationsFromExcel();
    }

    private void loadAddressesFromExcel() throws IOException {
        System.out.println("Abriendo Excel para addresses");
        // Cargar el archivo Excel (.xlsx)
        Workbook workbook = new XSSFWorkbook(new ClassPathResource("data/Address And Locations.xlsx").getInputStream());

        // Obtener la hoja "Sheet1"
        Sheet sheet = workbook.getSheet("Sheet1");
        if (sheet == null) {
            System.err.println("Hoja 'Sheet1' no encontrada en el Excel");
            return;
        }
        System.out.println("Hoja encontrada, procesando filas");

        // Iterar filas desde 2 hasta 18 (índices 1-17)
        for (int rowIndex = 1; rowIndex <= 17; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row != null) {
                Cell cityCell = row.getCell(1); // Columna B: nombre de la ciudad
                Cell streetCell = row.getCell(3); // Columna D: dirección
                Cell postalCodeCell = row.getCell(4); // Columna E: código postal

                System.out.println("Procesando fila " + rowIndex + ", cityCell: " + (cityCell != null ? cityCell.getCellType() : "null") +
                    ", streetCell: " + (streetCell != null ? streetCell.getCellType() : "null") +
                    ", postalCell: " + (postalCodeCell != null ? postalCodeCell.getCellType() : "null"));

                if (cityCell != null && cityCell.getCellType() == CellType.STRING &&
                    streetCell != null && streetCell.getCellType() == CellType.STRING &&
                    postalCodeCell != null && (postalCodeCell.getCellType() == CellType.STRING || postalCodeCell.getCellType() == CellType.NUMERIC)) {

                    String cityName = cityCell.getStringCellValue().trim();
                    String street = streetCell.getStringCellValue().trim();
                    String postalCode = String.valueOf((int) postalCodeCell.getNumericCellValue());

                    System.out.println("Procesando datos válidos para fila " + rowIndex + ": city=" + cityName + ", street=" + street + ", postal=" + postalCode);

                    if (!cityName.isEmpty() && !street.isEmpty() && !postalCode.isEmpty()) {
                        // Buscar la ciudad
                        System.out.println("Buscando city: " + cityName);
                        Optional<City> cityOpt = cityRepository.findByNameIgnoreCase(cityName).stream().findFirst();
                        System.out.println("City encontrada: " + cityOpt.isPresent() + " para " + cityName);
                        if (cityOpt.isPresent()) {
                            City city = cityOpt.get();

                            // Verificar si la dirección ya existe
                            if (addressRepository.findByStreetAndCity(street, city).isEmpty()) {
                                Address address = new Address();
                                address.setStreet(street);
                                address.setPostalCode(postalCode);
                                address.setCity(city);
                                Address savedAddress = addressRepository.save(address);
                                System.out.println("Dirección insertada: " + street + " en " + cityName + " ID: " + savedAddress.getAddressID());
                            } else {
                                System.out.println("Dirección ya existe: " + street + " en " + cityName);
                            }
                        } else {
                            System.err.println("Ciudad no encontrada: " + cityName + " para dirección " + street);
                        }
                    } else {
                        System.out.println("Datos vacíos, saltando fila " + rowIndex);
                    }
                } else {
                    System.out.println("Celdas no válidas en fila " + rowIndex);
                }
            } else {
                System.out.println("Fila " + rowIndex + " es null");
            }
        }

        workbook.close();
    }

    private void loadLocationsFromExcel() throws IOException {
        // Cargar el archivo Excel (.xlsx)
        Workbook workbook = new XSSFWorkbook(new ClassPathResource("data/Address And Locations.xlsx").getInputStream());

        // Obtener la hoja "Sheet1"
        Sheet sheet = workbook.getSheet("Sheet1");
        if (sheet == null) {
            System.err.println("Hoja 'Sheet1' no encontrada en el Excel");
            return;
        }

        // Iterar filas desde 2 hasta 18 (índices 1-17)
        for (int rowIndex = 1; rowIndex <= 17; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row != null) {
                Cell locationNameCell = row.getCell(2); // Columna C: nombre del sitio
                Cell streetCell = row.getCell(3); // Columna D: dirección para buscar address

                if (locationNameCell != null && locationNameCell.getCellType() == CellType.STRING &&
                    streetCell != null && streetCell.getCellType() == CellType.STRING) {

                    String locationName = locationNameCell.getStringCellValue().trim();
                    String street = streetCell.getStringCellValue().trim();

                    if (!locationName.isEmpty() && !street.isEmpty()) {
                        // Buscar la dirección por street (asumiendo única por street, pero en realidad debería buscar por city también)
                        // Para simplificar, buscar por street, pero idealmente agregar city
                        Optional<Address> addressOpt = addressRepository.findAll().stream()
                            .filter(addr -> addr.getStreet().equals(street))
                            .findFirst();

                        if (addressOpt.isPresent()) {
                            Address address = addressOpt.get();

                            // Verificar si la ubicación ya existe
                            if (locationRepository.existsByNameAndAddress(locationName, address)) {
                                System.out.println("Ubicación ya existe: " + locationName);
                            } else {
                                Location location = new Location();
                                location.setName(locationName);
                                location.setAddress(address);
                                locationRepository.save(location);
                                System.out.println("Ubicación insertada: " + locationName + " en " + street);
                            }
                        } else {
                            System.err.println("Dirección no encontrada: " + street + " para ubicación " + locationName);
                        }
                    }
                }
            }
        }

        workbook.close();
    }
}