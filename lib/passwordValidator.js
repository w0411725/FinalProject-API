import PasswordValidator from 'password-validator';

const passwordSchema = new PasswordValidator();

// Password rules
passwordSchema
  .is().min(8)                                    // Minimum length 8
  .has().uppercase()                              // Must have at least 1 uppercase letter
  .has().lowercase()                              // Must have at least 1 lowercase letter
  .has().digits(1)                                // Must have at least 1 digit
  .has().not().spaces();                          // Should not have spaces

export default passwordSchema;