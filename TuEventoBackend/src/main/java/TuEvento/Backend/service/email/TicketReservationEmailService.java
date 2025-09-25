package TuEvento.Backend.service.email;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TicketReservationEmailService extends BaseEmailService {

    public void sendTicketReservationEmail(String email, String userName, String eventName, String ticketCode, String qrCodeUrl, List<String> seatDetails, BigDecimal totalPrice, LocalDate eventDate) {
        try {
            String subject = "Confirmacion de Reserva - " + eventName;

            String seatDetailsHtml = seatDetails.stream()
                .map(seat -> "<li style='margin: 8px 0; padding: 8px 12px; background: white; border-radius: 6px; border-left: 3px solid #8b5cf6;'>" + seat + "</li>")
                .reduce("", (a, b) -> a + b);

            String bodyMail = String.format("""
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmacion de Reserva</title>
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
                        .event-card { background: linear-gradient(135deg, #faf7ff 0%%, #f3f0ff 100%%); padding: 35px; border-radius: 14px; margin: 30px 0; border-left: 5px solid #8b5cf6; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.08); text-align: center; }
                        .event-details { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; border: 2px solid #e5e7eb; }
                        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { font-weight: 600; color: #6d28d9; font-size: 15px; }
                        .detail-value { font-family: 'Courier New', monospace; background: #f8fafc; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 500; }
                        .seats-section { background: linear-gradient(135deg, #f0f9ff 0%%, #e0f2fe 100%%); padding: 30px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #0ea5e9; }
                        .seats-list { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                        .seats-list ul { list-style: none; padding: 0; margin: 0; }
                        .price-highlight { font-size: 22px; font-weight: bold; color: #7c3aed; text-align: center; margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #f3e8ff 0%%, #fce7f3 100%%); border-radius: 10px; border: 2px solid #8b5cf6; }
                        .qr-section { text-align: center; margin: 35px 0; padding: 30px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; }
                        .qr-code { max-width: 180px; height: auto; border: 4px solid #8b5cf6; border-radius: 10px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
                        .qr-instructions { font-size: 16px; color: #4b5563; margin: 15px 0; font-weight: 500; }
                        .instructions-card { background: #fef3c7; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 5px solid #f59e0b; color: #92400e; }
                        .instructions-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
                        .instructions-list { margin: 0; padding-left: 20px; }
                        .instructions-list li { margin: 8px 0; line-height: 1.5; }
                        .action-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%%, #8b5cf6 100%%); color: white; text-decoration: none; padding: 16px 35px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); transition: all 0.3s ease; border: none; cursor: pointer; margin: 20px 0; }
                        .action-button:hover { background: linear-gradient(135deg, #6d28d9 0%%, #7c3aed 100%%); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4); }
                        .action-button:active { transform: translateY(0); }
                        .email-footer { text-align: center; font-size: 14px; color: #6b7280; padding: 35px 25px; background: linear-gradient(135deg, #f9fafb 0%%, #f3f4f6 100%%); border-top: 1px solid #e5e7eb; }
                        .footer-note { margin-bottom: 12px; line-height: 1.5; }
                        .footer-signature { font-weight: 600; color: #8b5cf6; font-size: 15px; }
                        @media only screen and (max-width: 650px) {
                            .email-wrapper { margin: 10px; border-radius: 12px; }
                            .email-body, .email-header { padding: 30px 20px; }
                            .email-header h1 { font-size: 26px; }
                            .event-card { padding: 30px 20px; }
                            .seats-section { padding: 25px 15px; }
                            .detail-row { flex-direction: column; align-items: flex-start; gap: 8px; }
                            .action-button { padding: 14px 28px; font-size: 15px; }
                            .email-body h2 { font-size: 22px; }
                            .greeting-text { font-size: 16px; }
                            .price-highlight { font-size: 20px; padding: 15px; }
                            .qr-code { max-width: 150px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="email-header">
                            <h1>Reserva Confirmada</h1>
                            <div class="header-subtitle">Tu reserva ha sido procesada exitosamente</div>
                        </div>
                        <div class="email-body">
                            <h2>Hola %s</h2>
                            <p class="greeting-text">Tu reserva para <strong>%s</strong> ha sido confirmada exitosamente. A continuacion encontraras todos los detalles de tu compra y las instrucciones para acceder al evento.</p>

                            <div class="event-card">
                                <h3 style="color: #6d28d9; margin-bottom: 20px; font-size: 22px;">Detalles del Evento</h3>
                                <p style="color: #4b5563; margin-bottom: 25px; font-size: 16px;">Guarda esta informacion para el dia del evento:</p>

                                <div class="event-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Fecha del Evento:</span>
                                        <span class="detail-value">%s</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Codigo de Reserva:</span>
                                        <span class="detail-value">%s</span>
                                    </div>
                                </div>
                            </div>

                            <div class="seats-section">
                                <h3 style="color: #0c4a6e; margin-bottom: 15px; font-size: 20px;">Asientos Reservados</h3>
                                <p style="color: #374151; margin-bottom: 20px;">Estos son los asientos que has reservado:</p>

                                <div class="seats-list">
                                    <ul>%s</ul>
                                </div>
                            </div>

                            <div class="price-highlight">
                                Total Pagado: $%s
                            </div>

                            <div class="qr-section">
                                <h3 style="color: #6d28d9; margin-bottom: 15px; font-size: 20px;">Codigo QR de Acceso</h3>
                                <p class="qr-instructions">Presenta este codigo QR en la entrada del evento</p>
                                <img src="%s" alt="Codigo QR" class="qr-code" />
                                <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">Guarda este correo o toma una captura de pantalla de este codigo QR</p>
                            </div>

                            <div class="instructions-card">
                                <div class="instructions-title">Instrucciones Importantes</div>
                                <ul class="instructions-list">
                                    <li>Llega al evento al menos 30 minutos antes de la hora programada</li>
                                    <li>Presenta este correo electronico o el codigo QR en tu telefono</li>
                                    <li>Los asientos estaran garantizados hasta 15 minutos antes del evento</li>
                                    <li>Para cambios o cancelaciones, contacta con anticipacion al organizador</li>
                                    <li>Revisa las politicas especificas del evento en el sitio web</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:3000/events" class="action-button" target="_blank">Ver Mis Eventos</a>
                            </div>
                        </div>
                        <div class="email-footer">
                            <div class="footer-note">Este correo fue generado automaticamente por Tu Evento.<br>Si tienes alguna pregunta, puedes contactarnos.</div>
                            <div class="footer-signature">Equipo de Tu Evento</div>
                        </div>
                    </div>
                </body>
                </html>
                """,
                userName,
                eventName,
                eventDate.toString(),
                ticketCode,
                seatDetailsHtml,
                totalPrice.toString(),
                qrCodeUrl
            );

            emailSender(email, subject, bodyMail);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error sending ticket reservation email: " + e.getMessage());
        }
    }
}