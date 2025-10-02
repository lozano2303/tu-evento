package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.Department;
import TuEvento.Backend.model.City;
import TuEvento.Backend.repository.*;
import java.util.Optional; // Necesario para la búsqueda eficiente

// Apache POI imports for Excel reading
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import java.io.IOException;

@Component
public class GeoDataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CityRepository cityRepository;

    

    // --- Método Principal de Ejecución ---

    @Override
    public void run(String... args) throws Exception {
        // Verificar si ya hay datos para evitar duplicados
        if (departmentRepository.count() > 0 || cityRepository.count() > 0) {
            System.out.println("Datos geo ya existen. Saltando inicialización.");
            return;
        }

        // Cargar datos desde Excel
        loadDepartmentsFromExcel();
        loadCitiesFromExcel();
    }

    private void loadDepartmentsFromExcel() throws IOException {
        // Cargar el archivo Excel (.xls)
        Workbook workbook = new HSSFWorkbook(new ClassPathResource("data/Departments and citys.xls").getInputStream());

        // Obtener la hoja "Departamentos"
        Sheet sheet = workbook.getSheet("Departamentos");
        if (sheet == null) {
            System.err.println("Hoja 'Departamentos' no encontrada en el Excel");
            return;
        }

        // Iterar filas desde 8 hasta 40 (índices 7-39)
        for (int rowIndex = 7; rowIndex <= 39; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row != null) {
                Cell cell = row.getCell(1); // Columna B (índice 1)
                if (cell != null && cell.getCellType() == CellType.STRING) {
                    String departmentName = cell.getStringCellValue().trim();
                    if (!departmentName.isEmpty()) {
                        // Verificar si ya existe
                        if (departmentRepository.findByNameIgnoreCase(departmentName).isEmpty()) {
                            Department department = new Department();
                            department.setName(departmentName);
                            departmentRepository.save(department);
                            System.out.println("Departamento insertado: " + departmentName);
                        } else {
                            System.out.println("Departamento ya existe: " + departmentName);
                        }
                    }
                }
            }
        }

        workbook.close();
    }

    private void loadCitiesFromExcel() throws IOException {
        // Cargar el archivo Excel (.xls)
        Workbook workbook = new HSSFWorkbook(new ClassPathResource("data/Departments and citys.xls").getInputStream());

        // Obtener la hoja "municipios"
        Sheet sheet = workbook.getSheet("municipios");
        if (sheet == null) {
            System.err.println("Hoja 'municipios' no encontrada en el Excel");
            return;
        }

        // Iterar filas desde 7 hasta 1127 (índices 6-1126)
        for (int rowIndex = 6; rowIndex <= 1126; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row != null) {
                Cell departmentCell = row.getCell(1); // Columna B: nombre del departamento
                Cell cityCell = row.getCell(3); // Columna D: nombre de la ciudad

                if (departmentCell != null && departmentCell.getCellType() == CellType.STRING &&
                    cityCell != null && cityCell.getCellType() == CellType.STRING) {

                    String departmentName = departmentCell.getStringCellValue().trim();
                    String cityName = cityCell.getStringCellValue().trim();

                    if (!departmentName.isEmpty() && !cityName.isEmpty()) {
                        // Buscar el departamento
                        Optional<Department> departmentOpt = departmentRepository.findByNameIgnoreCase(departmentName);
                        if (departmentOpt.isPresent()) {
                            Department department = departmentOpt.get();

                            // Verificar si la ciudad ya existe
                            if (cityRepository.findByNameIgnoreCaseAndDepartment(cityName, department).isEmpty()) {
                                City city = new City();
                                city.setName(cityName);
                                city.setDepartment(department);
                                cityRepository.save(city);
                                System.out.println("Ciudad insertada: " + cityName + " en " + departmentName);
                            } else {
                                System.out.println("Ciudad ya existe: " + cityName + " en " + departmentName);
                            }
                        } else {
                            System.err.println("Departamento no encontrado: " + departmentName + " para ciudad " + cityName);
                        }
                    }
                }
            }
        }

        workbook.close();
    }
}