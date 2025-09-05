package TuEvento.Backend.service;


import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.User;

public interface AccountActivationService {

    /**
     * Generates a new activation code, saves it, and emails the user.
     * @param userId the ID of the user for whom the activation code will be created
     */
    void createActivationForUser(int userId);

    /**
     * Resends a new activation code, updating the existing one and emailing the user again.
     * @param userId the ID of the user
     */
    void resendActivationCode(int userId);

    /**
     * Verifies an activation code and activates the account if valid and not expired.
     * @param userId the ID of the user
     * @param code the activation code to verify
     * @return true if activated, false otherwise
     */
    ResponseDto<String> verifyActivationCode(int userId, String activationCode);

    /**
     * Retrieves a user by their ID.
     * @param userId the ID of the user
     * @return the User object if found, or null otherwise
     */
    User getUserById(int userId);
}
