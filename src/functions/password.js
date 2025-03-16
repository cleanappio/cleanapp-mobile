export const generatePassword = () => {
  let charset = '';
  let newPassword = '';

  const passwordLength = 12;
  const useLowerCase = true;
  const useUpperCase = true;
  const useNumbers = true;
  const useSymbols = true;

  if (useSymbols) charset += '!@#$%^&*()';
  if (useNumbers) charset += '0123456789';
  if (useLowerCase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useUpperCase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < parseInt(passwordLength); i++) {
      newPassword +=
          charset.charAt(Math.floor(
              Math.random() * charset.length));
  }

  return newPassword;
};
