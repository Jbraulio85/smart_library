    import fs from "fs/promises"
    import { join } from "path"

    export const deleteFileOnError = async (err, req, res, next) =>{
        console.log("Entrando a deleteFileOnError:", err.message);
        if(req.file && req.filePath){
            const filePath = join(req.filePath, req.file.filename)
            try{
                await fs.unlink(filePath)
            }catch(unlikErr){
                console.log(`Error al eliminar el archivo ${unlikErr}`)
            }
        }
        if(err.status === 400 || err.errors){
            return res.status(400).json({
                success: false,
                errors: err.errors
            })
        }
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }