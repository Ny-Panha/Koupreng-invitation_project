// AccountService + ChangePasswordRequest/ResetPasswordRequest use UTF-16 length
// and Character checks on individual Java char values. Uppercase is registration-only.
export function accountPasswordRules(value) {
  const characters = value.split('');
  return [
    { key: 'passwordMinLength', met: value.length >= 8 },
    { key: 'passwordMaxLength', met: value.length > 0 && value.length <= 100 },
    { key: 'passwordLetter', met: characters.some(char => /\p{L}/u.test(char)) },
    { key: 'passwordNumber', met: characters.some(char => /\p{Nd}/u.test(char)) },
  ];
}
export const isAccountPasswordValid = value => accountPasswordRules(value).every(rule => rule.met);
