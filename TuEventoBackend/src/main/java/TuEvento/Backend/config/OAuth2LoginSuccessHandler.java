package TuEvento.Backend.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import TuEvento.Backend.dto.responses.ResponseDto;
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

        ResponseDto<ResponseLogin> loginResponse = userService.loginOAuth2(email, name);

        String token = loginResponse.getData().getToken();
        String userID = String.valueOf(loginResponse.getData().getUserID());
        String role = loginResponse.getData().getRole();

        // Redirigir al frontend con el token y datos del usuario
        response.sendRedirect("http://localhost:5173/?token=" + token + "&userID=" + userID + "&role=" + role + "&oauth=true");
    }
}
