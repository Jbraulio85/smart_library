export const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/

    return regex.test(email)
}

export const validateEmailMessage = 'Por favor, ingresar un correo válido'
