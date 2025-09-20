import User from "./user.model.js";
import { hash, verify } from "argon2";
import cloudinary from "../../configs/cloudinary.js";

const DEFAULT_IMAGES = [
  "defaultProfile_sjd9pl",
  "adminProfile_mgw7et"
];

export const updateProfile = async (req, res) => {
  try {
    const usuario = req.usuario;
    const data = req.body;
    const user = await User.findByIdAndUpdate(usuario._id, data, { new: true });
    return res.status(200).json({ success: true, msg: 'Perfil actualizado correctamente', user });
  } catch (err) {
    return res.status(500).json({ success: false, msg: 'Error al actualizar el perfil', error: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { newPassword } = req.body;
    const user = await User.findById(usuario._id);
    const same = await verify(user.password, newPassword);
    if (same) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña no puede ser igual a la anterior' });
    }
    const encrypted = await hash(newPassword);
    await User.findByIdAndUpdate(usuario._id, { password: encrypted }, { new: true });
    return res.status(200).json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al actualizar contraseña', error: err.message });
  }
};

export const getProfileInfo = async (req, res) => {
  try {
    const usuario = req.usuario;
    const user = await User.findById(usuario._id).select('-password -verificationToken -verificationTokenExpiresAt -uid -status -role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ success: true, message: 'Perfil obtenido correctamente', user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al obtener el perfil', error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const query = { status: true };
    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).skip(Number(desde)).limit(Number(limite)).populate('degree', 'name')
    ]);
    return res.status(200).json({ success: true, total, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al obtener los usuarios', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findByIdAndUpdate(uid, { status: false }, { new: true });
    return res.status(200).json({ success: true, message: 'Usuario eliminado', user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al eliminar el usuario', error: err.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const usuario = req.usuario;
    const newUrl = req.file?.path;

    if (!newUrl) {
      return res.status(400).json({ success: false, message: 'No hay archivo en la petición' });
    }

    const user = await User.findById(usuario._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const oldPublicId = user.profilePicture?.split('/').pop().split('.')[0];

    if (oldPublicId && !DEFAULT_IMAGES.includes(oldPublicId)) {
      await cloudinary.uploader.destroy(oldPublicId);
    }

    user.profilePicture = newUrl;
    await user.save();

    return res.status(200).json({ success: true, message: 'Foto actualizada', profilePicture: user.profilePicture });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al actualizar la foto', error: err.message });
  }
};

export const deleteProfilePicture = async (req, res) => {
  try {
    const usuario = req.usuario;
    const user = await User.findById(usuario._id);
    if (!user) {
      return res.status(404).json({ success:false, message:"Usuario no encontrado" });
    }

    const oldPublicId = user.profilePicture
      ?.split("/")
      .pop()
      .split(".")[0];

    if (oldPublicId && !DEFAULT_IMAGES.includes(oldPublicId)) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
    
    const defaultUrl =
      "https://res.cloudinary.com/dfrubgnjt/image/upload/v1749704604/defaultProfile_sjd9pl.avif";

    user.profilePicture = defaultUrl;
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Foto de perfil restablecida a la imagen por defecto",
        profilePicture: user.profilePicture 
      });
  } catch (err) {
    return res.status(500).json({ success:false, message:"Error al eliminar la foto", error: err.message });
  }
};
