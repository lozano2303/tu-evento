package TuEvento.Backend.service.oauth;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.UserDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Role;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.email.RegisterWithOAuth2EmailService;
import TuEvento.Backend.service.impl.LoginServiceImpl;
import TuEvento.Backend.service.impl.UserServiceImpl;
    @Service
    public class customOauht2UserService extends DefaultOAuth2UserService {
    @Autowired
    private RegisterWithOAuth2EmailService oauth2EmailService;
    @Autowired
    private UserServiceImpl userService;
    @Autowired
    private LoginServiceImpl loginService;
    @Autowired
    private UserRepository userRepository;
    protected String getSaltString() {
        String SALTCHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@*";
        StringBuilder salt = new StringBuilder();
        Random rnd = new Random();
        while (salt.length() < 18) { // length of the random string.
            int index = (int) (rnd.nextFloat() * SALTCHARS.length());
            salt.append(SALTCHARS.charAt(index));
        }
        String saltStr = salt.toString();
        return saltStr;

    }
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String clientName = userRequest.getClientRegistration().getClientName();
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = null;
        String name = null;
        email = (String) attributes.get("email");
        name = (String) attributes.get("name");
        System.out.println("clientName: "+clientName);
        System.out.println("name: "+name);
        System.out.println("email: "+email);
        if (email != null && !email.isEmpty()) {
            boolean userEmailExist = !loginService.findByEmail(email).isEmpty();
            boolean userAliasExist = !loginService.findByUsername(name).isEmpty();
            if (!userEmailExist && !userAliasExist) {
              UserDto userDto = new UserDto();
              userDto.setFullName(name);
              userDto.setTelephone(null);
              userDto.setBirthDate(null);
              userDto.setAddress(null);

              // Crear usuario normalmente
              userService.createUserSocialMedia(userDto);
              User user = userService.findByUsername(name)
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

              // Asignar rol correcto basado en email
              if ("atuevento72@gmail.com".equals(email)) {
                user.setRole(Role.ADMIN);
                System.out.println("👑 Asignando rol ADMIN a: " + email);
              } else {
                user.setRole(Role.USER);
              }
              userRepository.save(user);

              RequestLoginDTO newUser = new RequestLoginDTO();
              newUser.setUsername(Objects.requireNonNullElse(name,"user"));
              newUser.setPassword(getSaltString());
              newUser.setEmail(email);
              newUser.setUserID(user);
              loginService.save(newUser);
              oauth2EmailService.sendWelcomeEmail(email, name, newUser.getPassword());
              System.out.println("Usuario creado exitosamente: " + name + " con rol: " + user.getRole());
            } else if (userEmailExist) {
              // Usuario ya existe, verificar si necesita actualizar rol
              try {
                Optional<Login> existingLoginOpt = loginService.findByEmail(email);
                if (existingLoginOpt.isPresent()) {
                  User existingUser = existingLoginOpt.get().getUserID();
                  if ("atuevento72@gmail.com".equals(email) && existingUser.getRole() != Role.ADMIN) {
                    existingUser.setRole(Role.ADMIN);
                    userRepository.save(existingUser);
                    System.out.println("🔄 Rol actualizado a ADMIN para usuario existente: " + email);
                  }
                }
              } catch (Exception e) {
                System.out.println("Error actualizando rol: " + e.getMessage());
              }
            }
        }
        return oauth2User;
    }
}

