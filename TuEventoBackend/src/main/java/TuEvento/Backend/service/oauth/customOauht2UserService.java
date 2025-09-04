package TuEvento.Backend.service.oauth;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.UserDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.model.User;
import TuEvento.Backend.service.email.ActivationCodeEmailService;
import TuEvento.Backend.service.impl.LoginServiceImpl;
import TuEvento.Backend.service.impl.UserServiceImpl;
    @Service
    public class customOauht2UserService extends DefaultOAuth2UserService {
    @Autowired
    private ActivationCodeEmailService activationCodeEmailService;
    @Autowired
    private UserServiceImpl userService;
    @Autowired
    private LoginServiceImpl loginService;
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
              userDto.setAddressID(null);
              userService.createUserSocialMedia(userDto);
              User user = userService.findByUsername(name)
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
              RequestLoginDTO newUser = new RequestLoginDTO();
              newUser.setUsername(Objects.requireNonNullElse(name,"user"));
              newUser.setPassword(getSaltString());
              newUser.setEmail(email);
              newUser.setUserID(user);
              loginService.save(newUser);
              activationCodeEmailService.basicEmail(email, name, newUser.getPassword());
              System.out.println("Usuario creado exitosamente: " + name);
            }
        }
        return oauth2User;
    }
}

