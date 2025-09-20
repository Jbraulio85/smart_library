export const validateUsername = (username) => {
    const regex = /^\S{3,20}$/

    return regex.test(username)
}

export const validateUsernameMessage = 'Ingresar de 15 a 20 caracteres, sin espacios';