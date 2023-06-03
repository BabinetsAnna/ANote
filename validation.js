export function validateForm({ username, password, confirmPassword }, isRegistration){
    const errors = [];

  if (!username.trim()) {
    errors.push(`Username cannot be empty!`);
  }

  if (!password.trim() && isRegistration) {
    errors.push(`Pasword cannot be empty!`);
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match!');
  }

  if (password.length < 8 && isRegistration) {
    errors.push('The password must contain at least 8 characters!');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}