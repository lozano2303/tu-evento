package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.RegisterRequestDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.User;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Role;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.service.RegisterService;
import TuEvento.Backend.service.AccountActivationService; // ✅ Nuevo import

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class RegisterServiceImpl implements RegisterService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccountActivationService accountActivationService; // ✅ Inyectado

    // Regex patterns for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    private static final Pattern TELEPHONE_PATTERN = Pattern.compile(
        "^[+]?[0-9]{7,15}$"
    );

    // Validation methods
    private String validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "El correo electrónico es obligatorio";
        }

        email = email.trim();

        if (email.length() > 100) { // Según modelo Login.java
            return "El correo electrónico no puede tener más de 100 caracteres";
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return "El formato del correo electrónico no es válido";
        }

        return null; // Valid
    }

    private String validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return "La contraseña es obligatoria";
        }

        if (password.length() < 8) {
            return "La contraseña debe tener al menos 8 caracteres";
        }

        if (password.length() > 100) { // Según modelo Login.java
            return "La contraseña no puede tener más de 100 caracteres";
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            return "La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (@$!%*?&)";
        }

        return null; // Valid
    }

    private String validateFullName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "El nombre completo es obligatorio";
        }

        fullName = fullName.trim();

        if (fullName.length() < 2) {
            return "El nombre completo debe tener al menos 2 caracteres";
        }

        if (fullName.length() > 70) { // Según modelo User.java
            return "El nombre completo no puede tener más de 70 caracteres";
        }

        // Check for valid characters (letters, spaces, accents)
        if (!fullName.matches("^[a-zA-ZÀ-ÿ\\s'-]+$")) {
            return "El nombre completo solo puede contener letras, espacios y caracteres de acento";
        }

        return null; // Valid
    }

    private String validateTelephone(String telephone) {
        // El teléfono es opcional según el modelo User.java
        if (telephone == null || telephone.trim().isEmpty()) {
            return null; // Es válido que sea null
        }

        telephone = telephone.trim();

        if (telephone.length() > 11) { // Según modelo User.java
            return "El teléfono no puede tener más de 11 caracteres";
        }

        if (!TELEPHONE_PATTERN.matcher(telephone).matches()) {
            return "El formato del teléfono no es válido (solo números, opcional + al inicio, máximo 11 dígitos)";
        }

        return null; // Valid
    }

    private String validateBirthDate(java.util.Date birthDate) {
        // La fecha de nacimiento es opcional según el modelo User.java
        if (birthDate == null) {
            return null; // Es válido que sea null
        }

        LocalDate birthLocalDate = new java.sql.Date(birthDate.getTime()).toLocalDate();
        LocalDate today = LocalDate.now();

        // Check if birth date is not in the future
        if (birthLocalDate.isAfter(today)) {
            return "La fecha de nacimiento no puede ser futura";
        }

        // Check minimum age (18 years) - solo si se proporciona fecha
        Period age = Period.between(birthLocalDate, today);
        if (age.getYears() < 18) {
            return "Debes tener al menos 18 años para registrarte";
        }

        // Check maximum age (reasonable limit)
        if (age.getYears() > 120) {
            return "La fecha de nacimiento no parece válida";
        }

        return null; // Valid
    }

    private String validateAddress(Integer addressId) {
        // Address is optional, so null is valid
        if (addressId == null) {
            return null;
        }

        if (addressId <= 0) {
            return "El ID de dirección debe ser un número positivo";
        }

        return null; // Valid
    }

    @Override
    @Transactional
    public ResponseDto<String> register(RegisterRequestDto dto) {
        try {
            // === VALIDACIONES DE ENTRADA ===

            // Validar email
            String emailError = validateEmail(dto.getEmail());
            if (emailError != null) {
                return ResponseDto.error(emailError);
            }

            // Validar contraseña
            String passwordError = validatePassword(dto.getPassword());
            if (passwordError != null) {
                return ResponseDto.error(passwordError);
            }

            // Validar nombre completo
            String fullNameError = validateFullName(dto.getFullName());
            if (fullNameError != null) {
                return ResponseDto.error(fullNameError);
            }

            // Validar teléfono
            String telephoneError = validateTelephone(dto.getTelephone());
            if (telephoneError != null) {
                return ResponseDto.error(telephoneError);
            }

            // Validar fecha de nacimiento
            String birthDateError = validateBirthDate(dto.getBirthDate());
            if (birthDateError != null) {
                return ResponseDto.error(birthDateError);
            }

            // Validar dirección (opcional)
            String addressError = validateAddress(dto.getAddress());
            if (addressError != null) {
                return ResponseDto.error(addressError);
            }

            // === VALIDACIONES DE NEGOCIO ===

            // === VALIDACIONES DE NEGOCIO ADICIONALES ===

            // Validar si el correo ya existe en Login
            if (loginRepository.findByEmail(dto.getEmail()).isPresent()) {
                return ResponseDto.error("El correo electrónico ya está registrado");
            }

            // Validación adicional: evitar registros masivos o sospechosos
            String emailDomain = dto.getEmail().substring(dto.getEmail().indexOf('@') + 1);
            if (emailDomain.equalsIgnoreCase("10minutemail.com") ||
                emailDomain.equalsIgnoreCase("temp-mail.org") ||
                emailDomain.equalsIgnoreCase("guerrillamail.com")) {
                return ResponseDto.error("No se permiten correos electrónicos temporales");
            }

            // Validación de nombre: evitar nombres demasiado cortos o genéricos
            String[] nameParts = dto.getFullName().trim().split("\\s+");
            if (nameParts.length < 2) {
                return ResponseDto.error("Por favor ingresa nombre y apellido");
            }

            // Validación de seguridad: evitar nombres sospechosos
            String lowerName = dto.getFullName().toLowerCase();
            if (lowerName.contains("test") || lowerName.contains("admin") ||
                lowerName.contains("user") || lowerName.matches(".*\\d{4,}.*")) {
                return ResponseDto.error("El nombre contiene caracteres no permitidos");
            }

            // Validación adicional: evitar que nombre y email sean demasiado similares
            String emailPrefix = dto.getEmail().substring(0, dto.getEmail().indexOf('@')).toLowerCase();
            if (emailPrefix.length() > 3 && lowerName.replaceAll("\\s+", "").contains(emailPrefix)) {
                return ResponseDto.error("El nombre y el correo electrónico parecen demasiado similares");
            }

            Address address = null;
            if (dto.getAddress() != null) {
                Optional<Address> addressOpt = addressRepository.findById(dto.getAddress());
                if (addressOpt.isEmpty()) {
                    return ResponseDto.error("Dirección no encontrada");
                }
                address = addressOpt.get();
            }

            // === CREACIÓN DE ENTIDADES ===

            // 1. Crear usuario con validación final
            User user = new User();
            user.setFullName(dto.getFullName().trim());

            // El teléfono puede ser null según el modelo
            if (dto.getTelephone() != null && !dto.getTelephone().trim().isEmpty()) {
                user.setTelephone(dto.getTelephone().trim());
            }

            if (dto.getBirthDate() != null) {
                user.setBirthDate(new java.sql.Date(dto.getBirthDate().getTime()));
            }

            user.setAddress(address);
            user.setRole(Role.USER);
            user.setStatus(true);
            user.setActivated(false);
            user.setOrganicer(false); // Campo adicional del modelo

            // Validación final antes de guardar
            if (user.getFullName().length() > 70) { // Según modelo User.java
                return ResponseDto.error("Error interno: nombre demasiado largo");
            }

            userRepository.save(user);

            // 2. Crear login asociado CON CONTRASEÑA HASHEADA
            Login login = new Login();
            login.setEmail(dto.getEmail().toLowerCase().trim());
            login.setPassword(passwordEncoder.encode(dto.getPassword()));
            login.setLoginDate(LocalDateTime.now());
            login.setUserID(user);
            login.setUsername(dto.getEmail().toLowerCase().trim());

            // Validación final del login
            if (login.getEmail().length() > 100) { // Según modelo Login.java
                return ResponseDto.error("Error interno: correo demasiado largo");
            }

            if (login.getUsername().length() > 100) { // Según modelo Login.java
                return ResponseDto.error("Error interno: nombre de usuario demasiado largo");
            }

            loginRepository.save(login);

            // 3. Crear accountActivation y enviar correo
            try {
                accountActivationService.createActivationForUser(user.getUserID());
            } catch (Exception e) {
                // Si falla el envío de correo, no fallar el registro completo
                // pero sí informar al usuario
                return ResponseDto.ok(
                    "Usuario registrado exitosamente, pero hubo un problema enviando el correo de activación. Contacta al soporte.",
                    String.valueOf(user.getUserID())
                );
            }

            return ResponseDto.ok(
                "Usuario registrado exitosamente. Código de activación enviado al correo.",
                String.valueOf(user.getUserID())
            );

        } catch (DataAccessException e) {
            // Log del error para debugging
            System.err.println("Error de base de datos en registro: " + e.getMessage());
            e.printStackTrace();

            // Mensaje más específico según el tipo de error
            if (e.getMessage().contains("duplicate key")) {
                return ResponseDto.error("Ya existe un usuario con estos datos");
            } else if (e.getMessage().contains("foreign key")) {
                return ResponseDto.error("Error en la configuración de datos relacionados");
            } else {
                return ResponseDto.error("Error de base de datos. Inténtalo de nuevo más tarde");
            }

        } catch (IllegalArgumentException e) {
            System.err.println("Error de validación en registro: " + e.getMessage());
            return ResponseDto.error("Datos inválidos: " + e.getMessage());

        } catch (Exception e) {
            // Log completo del error para debugging
            System.err.println("Error inesperado en registro: " + e.getMessage());
            e.printStackTrace();

            return ResponseDto.error("Error interno del servidor. Inténtalo de nuevo más tarde");
        }
    }
}
