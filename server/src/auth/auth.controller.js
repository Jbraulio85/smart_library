import mongoose from "mongoose";
import { hash, verify } from "argon2";
import User from "../user/user.model.js";
import Degree from "../degree/degree.model.js";
import { sendVerificationEmail } from "../../utils/send-email.js";
import { assignRole } from "../middlewares/validate-email.js";
import { generateJWT } from "../helpers/generate-jwt.js";

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Ya existe un administrador");
      return;
    }

    const ADMIN_PASSWORD = "Admin1234";
    const hashedPassword = await hash(ADMIN_PASSWORD);

    const defaultUrl = "https://res.cloudinary.com/dfrubgnjt/image/upload/v1749704517/adminProfile_mgw7et.png";

    const admin = new User({
      name: "Admin",
      surname: "Library",
      username: "admin",
      email: "adminplataform@kinal.org.gt",
      password: hashedPassword,
      role: "ADMIN_ROLE",
      profilePicture: defaultUrl,
      status: true,
      degree: null,
    });

    await admin.save();
    console.log("Admin creado correctamente");
  } catch (error) {
    console.error("Error al crear usuario administrador:", error);
  }
};

export default createAdminUser;

export const register = async (req, res) => {
    try {
        const data = req.body;
        const profilePictureUrl = "https://res.cloudinary.com/dfrubgnjt/image/upload/v1749704604/defaultProfile_sjd9pl.avif";

        let profilePicture = req.file
        ? req.file.path
        : profilePictureUrl;

        if (data.role === "STUDENT_ROLE" && !data.degree) {
            return res.status(400).json({
                message: "El grado es obligatorio para los usuarios normales"
            });
        }

        if (data.degree) {
            if (!mongoose.Types.ObjectId.isValid(data.degree)) {
                return res.status(400).json({
                    message: "El ID del grado proporcionado no es válido"
                });
            }

            const existingDegree = await Degree.findById(data.degree);
            if (!existingDegree) {
                return res.status(400).json({
                    message: "El grado proporcionado no es válido"
                });
            }
        }
        const encryptedPassword = await hash(data.password);
        data.role = assignRole(data.email);
        data.password = encryptedPassword;
        data.profilePicture = profilePicture;
        data.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        data.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

        const user = await User.create(data);

        await sendVerificationEmail(data.email, data.verificationToken);

        return res.status(201).json({
            message: "Usuario registrado, por favor revisa tu correo para verificar tu cuenta",
            userDetails: {
                user: user.username,
                email: user.email,
            }
        });
    } catch (err) {
        console.log("Error al registrar el usuario:", err.message);
        return res.status(500).json({
            message: "Error al registrar el usuario",
            error: err.message
        });
    }
};


export const verifyEmail = async (req, res) => {
    try {
        const { code } = req.params;
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }

        user.status = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save();

        res.status(200).json({ 
            message: "¡Cuenta verificada con éxito!" 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error interno del servidor" 
        });
    }
}

export const login = async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = await User.findOne({
        $or: [{ email }, { username }],
        });
        if(!user){
            return res.status(400).json({
                message: "Crendenciales inválidas",
                error:"No existe el usuario o correo ingresado"
            })
        }
        const validPassword = await verify(user.password, password)
        if(!validPassword){
            return res.status(400).json({
                message: "Crendenciales inválidas",
                error: "Contraseña incorrecta"
            })
        }
        const token = await generateJWT(user.id)
        return res.status(200).json({
            message: "¡Se inicio sesión correctamente!",
            userDetails: {
                token: token,
                username: user.username,
                profilePicture: user.profilePicture,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                degree: user.degree,
                role: user.role
            }
        })
    }catch(err){
        return res.status(500).json({
            message: "Error al iniciar sesión, error del servidor",
            error: err.message
        })
    }
}

