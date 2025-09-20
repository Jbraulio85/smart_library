import User from "../user/user.model.js"
import Course from "../course/course.model.js"

export const emailExist = async(email = '') =>{
    const existe = await User.findOne({email})
    if(existe){
        throw new Error(`El email ${email} ya fue registrado previamente`)
    }
}

export const usernameExist = async(username = '') =>{
    const existe = await User.findOne({username})
    if(existe){
        throw new Error(`El email ${username} ya fue registrado previamente`)
    }
}

 export const isUnique = async (name) => {
    const course = await Course.findOne({ name });
    if (course) {
        throw new Error("El nombre del curso ya existe");
    }
    return true;
};