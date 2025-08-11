package TuEvento.Backend.service.oauth;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.requests.RequestLoginDTO;

import TuEvento.Backend.service.impl.LoginServiceImpl;


    @Service
    public class customOauht2UserService extends DefaultOAuth2UserService {
    @Autowired
    private LoginServiceImpl loginService;
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String clientName = userRequest.getClientRegistration().getClientName();
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = null;
        String name = null;
        if ("Google".equalsIgnoreCase(clientName)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        } else if ("Twitter".equalsIgnoreCase(clientName)) {
            email = (String) attributes.get("login");
            name = (String) attributes.get("name");
        } else if ("Facebook".equalsIgnoreCase(clientName)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        }
        System.out.println("clientName: "+clientName);
        System.out.println("name: "+name);
        System.out.println("email: "+email);
        if (email != null && !email.isEmpty()) {
            boolean userEmailExist = !loginService.findByEmail(email).isEmpty();
            boolean userAliasExist = !loginService.findByUsername(name).isEmpty();
            if (!userEmailExist && !userAliasExist) {
              RequestLoginDTO newUser = new RequestLoginDTO();
              newUser.setUsername(Objects.requireNonNullElse(name,"user"));
              newUser.setPassword("Password");
              newUser.setEmail(email);
              loginService.save(newUser);
            }
        }
        return oauth2User;
    }
}

