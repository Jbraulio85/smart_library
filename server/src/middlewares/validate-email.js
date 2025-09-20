export const assignRole = (email)=>{
    if(email.includes("edu")){
        return "STUDENT_ROLE"
    } else if(email.includes("org")){
        return "TEACHER_ROLE"
    }
}