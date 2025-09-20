export const validatePhone = (phone) => {
    const regex = /^[2-9]\d{7}$/;
  
    return regex.test(phone);
  };
  
export const validatePhoneMessage = 'Por favor, ingresar un número de celular válido';