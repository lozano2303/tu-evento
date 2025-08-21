package TuEvento.Backend.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.responses.ResponseLogin;
import TuEvento.Backend.service.impl.LoginServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;


@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private LoginServiceImpl userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        RequestLoginDTO loginDTO = new RequestLoginDTO();
        loginDTO.setUsername(name); // O usa email si tu sistema autentica por email
        loginDTO.setEmail(email);

        ResponseLogin loginResponse = userService.login(loginDTO);

        String token = loginResponse.getToken();
        String redirectUrl = "http://127.0.0.1:5500/user.html?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}