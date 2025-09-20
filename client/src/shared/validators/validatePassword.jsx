export const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])\S{6,30}$/

    return regex.test(password)
}

export const validatePasswordMessage = 'Contraseña minimo de 6 caracteres, sin espacios y debe contener al menos una letra mayúscula'