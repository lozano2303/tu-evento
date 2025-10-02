package TuEvento.Backend.data;

import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Role;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si ya existe un admin
        if (loginRepository.findByEmail("atuevento72@gmail.com").isEmpty()) {
            // Crear usuario admin
            User adminUser = new User();
            adminUser.setFullName("Administrador Sistema");
            adminUser.setTelephone("1234567890");
            adminUser.setStatus(true);
            adminUser.setActivated(true);
            adminUser.setRole(Role.ADMIN);
            adminUser.setOrganicer(false);

            userRepository.save(adminUser);

            // Crear login para el admin
            Login adminLogin = new Login();
            adminLogin.setUsername("admin");
            adminLogin.setPassword(passwordEncoder.encode("Admin123**"));
            adminLogin.setEmail("atuevento72@gmail.com");
            adminLogin.setUserID(adminUser);
            adminLogin.setLoginDate(LocalDateTime.now());

            loginRepository.save(adminLogin);

            System.out.println("✅ Usuario admin creado exitosamente:");
            System.out.println("   📧 Email: atuevento72@gmail.com");
            System.out.println("   🔑 Contraseña: Admin123**");
            System.out.println("   👤 Usuario: admin");
            System.out.println("   👑 Rol: " + adminUser.getRole());
            System.out.println("   🆔 UserID: " + adminUser.getUserID());
            System.out.println("   ✅ Activado: " + adminUser.isActivated());
        } else {
            // Usuario existe, verificar y actualizar rol si es necesario
            Login existingLogin = loginRepository.findByEmail("atuevento72@gmail.com").get();
            User existingUser = existingLogin.getUserID();

            if (existingUser.getRole() != Role.ADMIN) {
                existingUser.setRole(Role.ADMIN);
                userRepository.save(existingUser);
                System.out.println("🔄 Rol actualizado a ADMIN para usuario existente:");
                System.out.println("   📧 Email: atuevento72@gmail.com");
                System.out.println("   🆔 UserID: " + existingUser.getUserID());
                System.out.println("   👑 Nuevo rol: " + existingUser.getRole());
            } else {
                System.out.println("ℹ️ Usuario admin ya existe con rol correcto");
            }
        }
    }
}