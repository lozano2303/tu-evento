package TuEvento.Backend.service;

import TuEvento.Backend.model.User;

public interface AccountActivationService {
    /**
     * Generates a new activation code, saves it, and emails the user.
     */
    void createActivationForUser(User user);

    /**
     * Verifies an activation code and activates the account if valid and not expired.
     * @return true if activated, false otherwise
     */
    boolean verifyActivationCode(int userId, String code);

    User getUserById(int userId);
}