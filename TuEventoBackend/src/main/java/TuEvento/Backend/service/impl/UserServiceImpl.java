package TuEvento.Backend.service.impl;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import TuEvento.Backend.dto.UserDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Role;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private LoginRepository loginRepository;

    // Regex patterns for validation
    private static final Pattern TELEPHONE_PATTERN = Pattern.compile(
        "^[+]?[0-9]{7,15}$"
    );

    // Validation methods
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

        // Check minimum age (14 years) - solo si se proporciona fecha
        Period age = Period.between(birthLocalDate, today);
        if (age.getYears() < 14) {
            return "La fecha de nacimiento no parece válida";
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

    public ResponseDto<UserDto> createUserSocialMedia(UserDto userDto) {
        Address address = null;
        if (userDto.getAddress() != null) {
            Optional<Address> addressOpt = addressRepository.findById(userDto.getAddress());
            if (addressOpt.isEmpty()) {
                return ResponseDto.error("Dirección no encontrada");
            }
            address = addressOpt.get();
        }

        try {
            User user = new User();
            user.setFullName(userDto.getFullName());
            user.setTelephone(userDto.getTelephone());
            user.setBirthDate(userDto.getBirthDate());
            user.setAddress(address);
            user.setRole(Role.USER);
            user.setStatus(true);
            user.setActivated(true);
            userRepository.save(user);

            return ResponseDto.ok("Usuario creado exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al crear el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al crear el usuario");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateTelephone(int userId, String newTelephone) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        User user = userOpt.get();
        if (!user.isActivated()) {
            return ResponseDto.error("Cuenta no activada. No puedes actualizar tu información.");
        }

        // Validar teléfono
        String telephoneError = validateTelephone(newTelephone);
        if (telephoneError != null) {
            return ResponseDto.error(telephoneError);
        }

        try {
            user.setTelephone(newTelephone);
            userRepository.save(user);
            return ResponseDto.ok("Teléfono actualizado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al actualizar el teléfono");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el teléfono");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateBirthDate(int userId, java.util.Date newBirthDate) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        User user = userOpt.get();
        if (!user.isActivated()) {
            return ResponseDto.error("Cuenta no activada. No puedes actualizar tu información.");
        }

        // Validar fecha de nacimiento
        String birthDateError = validateBirthDate(newBirthDate);
        if (birthDateError != null) {
            return ResponseDto.error(birthDateError);
        }

        try {
            user.setBirthDate(newBirthDate != null ? new java.sql.Date(newBirthDate.getTime()) : null);
            userRepository.save(user);
            return ResponseDto.ok("Fecha de nacimiento actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al actualizar la fecha de nacimiento");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la fecha de nacimiento");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateAddress(int userId, Integer newAddressId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        User user = userOpt.get();
        if (!user.isActivated()) {
            return ResponseDto.error("Cuenta no activada. No puedes actualizar tu información.");
        }

        // Validar dirección
        String addressError = validateAddress(newAddressId);
        if (addressError != null) {
            return ResponseDto.error(addressError);
        }

        Address address = null;
        if (newAddressId != null) {
            Optional<Address> addressOpt = addressRepository.findById(newAddressId);
            if (addressOpt.isEmpty()) {
                return ResponseDto.error("Dirección no encontrada");
            }
            address = addressOpt.get();
        }

        try {
            user.setAddress(address);
            userRepository.save(user);
            return ResponseDto.ok("Dirección actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al actualizar la dirección");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la dirección");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteUserAccount(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        User user = userOpt.get();

        try {
            // Eliminar login asociado
            loginRepository.deleteById(userId);

            // Eliminar usuario (cascada eliminará referencias si configurado)
            userRepository.delete(user);

            return ResponseDto.ok("Cuenta de usuario eliminada permanentemente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al eliminar la cuenta");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar la cuenta");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deactivateUser(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        try {
            User user = userOpt.get();
            user.setStatus(false);
            userRepository.save(user);
            return ResponseDto.ok("Usuario desactivado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al desactivar el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al desactivar el usuario");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> reactivateUser(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        try {
            User user = userOpt.get();
            user.setStatus(true);
            userRepository.save(user);
            return ResponseDto.ok("Usuario reactivado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al reactivar el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al reactivar el usuario");
        }
    }

    @Override
    public ResponseDto<UserDto> getUserById(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        UserDto userDto = mapToDto(userOpt.get());
        return ResponseDto.ok("Usuario encontrado", userDto);
    }

    @Override
    public ResponseDto<List<UserDto>> getUsersByName(String name) {
        List<User> users = userRepository.findByFullNameContainingIgnoreCase(name);
        List<UserDto> usersDto = users.stream()
            .map(this::mapToDto)
            .toList();
        return ResponseDto.ok("Usuarios encontrados", usersDto);
    }

    @Override
    public ResponseDto<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> usersDto = users.stream()
            .map(this::mapToDto)
            .toList();
        return ResponseDto.ok("Usuarios encontrados", usersDto);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByFullName(username)
                .stream()
                .findFirst();
    }

    private UserDto mapToDto(User user) {
        Integer addressId = (user.getAddress() != null) ? user.getAddress().getAddressID() : null;

        return new UserDto(
            user.getFullName(),
            user.getTelephone(),
            user.getBirthDate(),
            addressId,
            user.isActivated()
        );
    }

    // Scheduler: eliminar cuentas no activadas después de 10 minutos
    @Scheduled(fixedRate = 60000) // cada minuto
    @Transactional
    public void deleteUnactivatedAccounts() {
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);

        // Buscar todos los logins y filtrar usuarios no activados con loginDate anterior a 10 minutos
        List<Login> allLogins = loginRepository.findAll();
        List<Login> unactivatedLogins = allLogins.stream()
            .filter(login -> !login.getUserID().isActivated() && login.getLoginDate().isBefore(tenMinutesAgo))
            .toList();

        for (Login login : unactivatedLogins) {
            try {
                User user = login.getUserID();
                // Eliminar usuario (cascada eliminará login y otras referencias)
                userRepository.delete(user);
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Error eliminando cuenta no activada para userId: " + login.getUserID().getUserID() + " - " + e.getMessage());
            }
        }
    }
}
