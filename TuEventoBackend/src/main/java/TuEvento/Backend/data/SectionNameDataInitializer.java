package TuEvento.Backend.data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import TuEvento.Backend.model.SectionName;
import TuEvento.Backend.repository.SectionNameRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.IOException;

@Component
public class SectionNameDataInitializer implements CommandLineRunner {

    @Autowired
    private SectionNameRepository sectionNameRepository;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si ya hay secciones para evitar duplicados
        if (sectionNameRepository.count() > 0) {
            System.out.println("Secciones ya existen. Saltando inicialización.");
            return;
        }

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ClassPathResource("data/sections.xlsx").getInputStream())) {
            Sheet sheet = workbook.getSheet("Hoja1");
            if (sheet != null) {
                for (int i = 2; i <= 49; i++) { // Filas 2 a 49 (0-indexed: A-3 a A-50)
                    Row row = sheet.getRow(i);
                    if (row != null) {
                        Cell cell = row.getCell(0); // Columna A
                        if (cell != null && cell.getCellType() == CellType.STRING) {
                            String sectionName = cell.getStringCellValue().trim();
                            if (!sectionName.isEmpty()) {
                                // Verificar si ya existe
                                if (sectionNameRepository.findByNameIgnoreCase(sectionName).isEmpty()) {
                                    SectionName section = new SectionName();
                                    section.setName(sectionName);
                                    sectionNameRepository.save(section);
                                }
                            }
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo Excel de secciones", e);
        }
    }
}