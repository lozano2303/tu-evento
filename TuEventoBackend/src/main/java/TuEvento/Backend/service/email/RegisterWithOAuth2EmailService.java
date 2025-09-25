package TuEvento.Backend.service.email;

import org.springframework.stereotype.Service;

@Service
public class RegisterWithOAuth2EmailService extends BaseEmailService {

    public void sendWelcomeEmail(String email, String userName, String generatedPassword) {
        try {
            String adressMail = email;
            String subject = "Bienvenido a Tu Evento";

            String bodyMail = String.format("""
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bienvenido a Tu Evento</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f3ff 0%%, #ede9fe 100%%); color: #1f1d2e; line-height: 1.6; }
                        .email-wrapper { max-width: 650px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.08); }
                        .email-header { background: linear-gradient(135deg, #7c3aed 0%%, #8b5cf6 50%%, #a855f7 100%%); color: white; padding: 45px 30px; text-align: center; position: relative; }
                        .email-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%%23ffffff" opacity="0.08"/><circle cx="50" cy="10" r="0.5" fill="%%23ffffff" opacity="0.06"/></pattern></defs><rect width="100" height="100" fill="url(%%23grain)"/></svg>'); }
                        .email-header h1 { margin: 0; font-size: 30px; font-weight: 700; position: relative; z-index: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header-subtitle { font-size: 17px; opacity: 0.95; margin-top: 10px; position: relative; z-index: 1; }
                        .email-body { padding: 45px 35px; }
                        .email-body h2 { margin-top: 0; color: #6d28d9; font-size: 26px; font-weight: 600; margin-bottom: 25px; }
                        .greeting-text { font-size: 17px; margin-bottom: 30px; color: #374151; line-height: 1.7; }
                        .welcome-card { background: linear-gradient(135deg, #faf7ff 0%%, #f3f0ff 100%%); padding: 35px; border-radius: 14px; margin: 30px 0; border-left: 5px solid #8b5cf6; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.08); text-align: center; }
                        .credentials-section { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; border: 2px solid #e5e7eb; }
                        .credential-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
                        .credential-item:last-child { border-bottom: none; }
                        .credential-label { font-weight: 600; color: #6d28d9; font-size: 15px; }
                        .credential-value { font-family: 'Courier New', monospace; background: #f8fafc; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 500; }
                        .security-notice { background: #fef3c7; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #f59e0b; color: #92400e; font-size: 15px; }
                        .action-notice { background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #0ea5e9; color: #0c4a6e; font-size: 15px; }
                        .button-container { text-align: center; margin: 35px 0; }
                        .action-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%%, #8b5cf6 100%%); color: white; text-decoration: none; padding: 16px 35px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); transition: all 0.3s ease; border: none; cursor: pointer; }
                        .action-button:hover { background: linear-gradient(135deg, #6d28d9 0%%, #7c3aed 100%%); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4); }
                        .action-button:active { transform: translateY(0); }
                        .email-footer { text-align: center; font-size: 14px; color: #6b7280; padding: 35px 25px; background: linear-gradient(135deg, #f9fafb 0%%, #f3f4f6 100%%); border-top: 1px solid #e5e7eb; }
                        .footer-note { margin-bottom: 12px; line-height: 1.5; }
                        .footer-signature { font-weight: 600; color: #8b5cf6; font-size: 15px; }
                        @media only screen and (max-width: 650px) {
                            .email-wrapper { margin: 10px; border-radius: 12px; }
                            .email-body, .email-header { padding: 30px 20px; }
                            .email-header h1 { font-size: 26px; }
                            .welcome-card { padding: 30px 20px; }
                            .credential-item { flex-direction: column; align-items: flex-start; gap: 8px; }
                            .action-button { padding: 14px 28px; font-size: 15px; }
                            .email-body h2 { font-size: 22px; }
                            .greeting-text { font-size: 16px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="email-header">
                            <h1>Bienvenido a Tu Evento</h1>
                            <div class="header-subtitle">Tu cuenta ha sido creada exitosamente</div>
                        </div>
                        <div class="email-body">
                            <h2>Hola %s</h2>
                            <p class="greeting-text">Bienvenido a Tu Evento. Tu cuenta ha sido creada exitosamente usando tu perfil social. A continuacion encontraras tus credenciales de acceso para iniciar sesion en nuestra plataforma.</p>

                            <div class="welcome-card">
                                <h3 style="color: #6d28d9; margin-bottom: 20px; font-size: 22px;">Tus Credenciales de Acceso</h3>
                                <p style="color: #4b5563; margin-bottom: 25px; font-size: 16px;">Guarda esta informacion en un lugar seguro:</p>

                                <div class="credentials-section">
                                    <div class="credential-item">
                                        <span class="credential-label">Correo Electronico:</span>
                                        <span class="credential-value">%s</span>
                                    </div>
                                    <div class="credential-item">
                                        <span class="credential-label">Contrasena Generada:</span>
                                        <span class="credential-value">%s</span>
                                    </div>
                                </div>
                            </div>

                            <div class="security-notice">
                                <strong>Importante sobre tu seguridad:</strong> Esta contrasena fue generada automaticamente. Te recomendamos cambiarla por una mas personal desde tu perfil una vez que inicies sesion.
                            </div>

                            <div class="action-notice">
                                <strong>Que puedes hacer ahora?</strong>
                                <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                                    <li>Explorar eventos disponibles</li>
                                    <li>Comprar entradas para tus eventos favoritos</li>
                                    <li>Gestionar tu perfil y preferencias</li>
                                    <li>Recibir notificaciones de nuevos eventos</li>
                                </ul>
                            </div>

                            <div class="button-container">
                                <a href="http://localhost:3000/login" class="action-button" target="_blank">Iniciar Sesion Ahora</a>
                            </div>
                        </div>
                        <div class="email-footer">
                            <div class="footer-note">Este correo fue generado automaticamente por Tu Evento.<br>Si tienes alguna pregunta, puedes contactarnos.</div>
                            <div class="footer-signature">Equipo de Tu Evento</div>
                        </div>
                    </div>
                </body>
                </html>
                """, userName, email, generatedPassword);

            emailSender(adressMail, subject, bodyMail);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}