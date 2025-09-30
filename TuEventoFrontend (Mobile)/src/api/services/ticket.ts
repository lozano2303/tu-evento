import { BUY_TICKET_ENDPOINT } from "../../constants/Endpoint"; // import the cancel ticket endpoint
import { getToken } from "./Token"; // import the getToken function to send auth header

// Cancel a ticket by ticketID
export const cancelTicket = async (ticketID: number | string) => {
  try {
    const token = await getToken(); // get the token if needed for auth
    const response = await fetch(`${BUY_TICKET_ENDPOINT}/${ticketID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return { success: true, message: result.message || "Ticket cancelado" };
    } else {
      return { success: false, message: result.message || "No se pudo cancelar el ticket" };
    }
  } catch (error) {
    return { success: false, message: "Error al cancelar el ticket" };
  }
};
