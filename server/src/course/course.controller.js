import Course from './course.model.js';
import Degree from '../degree/degree.model.js';
import User from '../user/user.model.js';
import bucket from "../../configs/firebase.js";
import { sendNotificationCourse } from '../../utils/notifier.js';
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";

const sanitizeFileName = (originalname) => {
  const fileExtension = extname(originalname);
  const rawName = originalname.split(fileExtension)[0];
  return rawName.replace(/[^a-zA-Z0-9-_]/g, "-");
};

export const uploadDocumentToCourse = async (req, res) => {
  try {
    const { cid } = req.params;
    const { bimester } = req.body;

    const course = await Course.findById(cid).populate("degree");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se subió ningún archivo",
      });
    }

    const { originalname, buffer, mimetype } = req.file;
    if (buffer.includes(Buffer.from("/Subtype /Image"))) {
      return res.status(400).json({
        success: false,
        message:
          "El PDF contiene imágenes y no puede procesarse. Elimina las imágenes e inténtalo de nuevo.",
      });
    }

    if (!bimester || isNaN(bimester)) {
      return res.status(400).json({
        success: false,
        message: "El campo 'bimester' es requerido y debe ser un número válido",
      });
    }

    const validBimesters =
      course.degree.name === "Sexto" ? 3 : 5;
    if (bimester < 1 || bimester > validBimesters) {
      return res.status(400).json({
        success: false,
        message: `El bimestre debe estar entre 1 y ${validBimesters} para el grado ${course.degree.name}`,
      });
    }

    const realOriginalName = Buffer.from(originalname, "latin1").toString("utf8");
    const sanitizedName = sanitizeFileName(originalname);
    const filename = `documents/${Date.now()}-${uuidv4()}-${sanitizedName}${extname(originalname)}`;
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: { contentType: mimetype },
      public: true,
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    const newDocument = {
      fileName: realOriginalName,
      filePath: publicUrl,
      bimester: parseInt(bimester),
    };
    course.document.push(newDocument);
    await course.save();

    const courseWithStudents = await Course.findById(cid).populate("students");

if (courseWithStudents && courseWithStudents.students?.length > 0) {
  const estudiantesConCorreo = courseWithStudents.students.filter(est => est.email);

  await Promise.all(
    estudiantesConCorreo.map(est =>
      sendNotificationCourse(est.email, course.name, realOriginalName)
    )
  );
  console.log("Correos enviados");
}

    return res.status(200).json({
      success: true,
      message: "Documento subido correctamente",
      document: newDocument,
    });
  } catch (err) {
    console.error("Error al subir documento:", err);
    return res.status(500).json({
      success: false,
      message: "Error al subir el documento",
      error: err.message,
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const data = req.body;
    const defaultCourseImage = "https://res.cloudinary.com/dfrubgnjt/image/upload/v1749928787/courses/Imagen-1-1749928786912.jpg";
    data.image = req.file && req.file.path ? req.file.path : defaultCourseImage;

    if (!data.teacher) {
      data.teacher = req.usuario._id;
    } else {
      const teacher = await User.findById(data.teacher);
      if (!teacher || teacher.role !== "TEACHER_ROLE") {
        return res.status(400).json({ message: "El profesor seleccionado no existe o no es un profesor válido." });
      }
    }

    const course = await Course.create(data);

    return res.status(201).json({
      message: 'Curso creado correctamente',
      course,
    });

  } catch (err) {
    console.log('ERROR al crear curso:', err);
    return res.status(500).json({
      message: 'Error al crear el curso',
      error: err.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };

    const [total, courses] = await Promise.all([
      Course.countDocuments(query),
      Course.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .select("-students -document -password -status")
        .populate("teacher degree", "-_id name surname email")
    ]);

    return res.status(200).json({
      success: true,
      total,
      courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los cursos",
      error: err.message,
    });
  }
};


export const updateCoursePicture = async (req, res) => {
  try {
    const { cid } = req.params;
    const usuario = req.usuario;

    const course = await Course.findById(cid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    if (course.teacher.toString() !== usuario._id.toString() &&
      usuario.role !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        message: "No estás autorizado para actualizar la imagen de este curso",
      });
    }

    if (req.file && req.file.path) {
      course.image = req.file.path;
      await course.save();

      return res.status(200).json({
        success: true,
        message: "Imagen del curso actualizada correctamente",
        course,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No se envió una imagen válida",
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la imagen del curso",
      error: err.message,
    });
  }
};




export const updateCoursePassword = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { cid } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Se debe enviar la nueva contraseña",
      });
    }

    const course = await Course.findById(cid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }


    if (course.teacher.toString() !== usuario._id.toString() &&
      usuario.role !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        message: "No estás autorizado para actualizar la contraseña de este curso",
      });
    }


    course.password = newPassword;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Contraseña del curso actualizada correctamente",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la contraseña del curso",
      error: err.message,
    });
  }
}

export const deleteCourse = async (req, res) => {
  try {
    const { cid } = req.params;
    const usuario = req.usuario;

    const course = await Course.findById(cid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    if (
      course.teacher.toString() !== usuario._id.toString() &&
      usuario.role !== "ADMIN_ROLE"
    ) {
      return res.status(403).json({
        success: false,
        message: "No estás autorizado para eliminar este curso",
      });
    }

    await Course.findByIdAndUpdate(cid, { status: false }, { new: true });

    return res.status(200).json({
      success: true,
      message: "Curso eliminado correctamente",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el curso",
      error: err.message,
    });
  }
}

export const updateCourse = async (req, res) => {
  try {
    const { cid } = req.params;
    const usuario = req.usuario;
    const data = req.body;

    const course = await Course.findById(cid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    if (course.teacher.toString() !== usuario._id.toString() &&
      usuario.role !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        message: "No estás autorizado para actualizar este curso",
      });
    }

    const updates = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (data[key] !== course[key]?.toString()) {
          updates[key] = data[key];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hay cambios que actualizar",
        course
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(cid, updates, { new: true });

    return res.status(200).json({
      success: true,
      message: "Curso actualizado correctamente",
      course: updatedCourse,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el curso",
      error: err.message,
    });
  }
};

export const assignCourse = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { password } = req.body;
    const { cid } = req.params;

    const course = await Course.findById(cid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    if (course.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta para inscribirse al curso",
      });
    }

    if (course.students.includes(usuario._id)) {
      return res.status(400).json({
        success: false,
        message: "Ya estás inscrito en este curso",
      });
    }

    const user = await User.findById(usuario._id).populate('degree');
    if (!user || !user.degree) {
      return res.status(400).json({
        success: false,
        message: "No se pudo determinar el grado del usuario",
      });
    }

    const assignedCoursesCount = await Course.countDocuments({
      students: usuario._id,
      status: true
    });

    let maxCourses = 12;
    if (user.degree.name.toUpperCase() === "SEXTO") {
      maxCourses = 10;
    }

    if (assignedCoursesCount >= maxCourses) {
      return res.status(400).json({
        success: false,
        message: `Como estudiante de ${user.degree.name}, solo puedes inscribirte en un máximo de ${maxCourses} cursos.`,
      });
    }

    course.students.push(usuario._id);
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Inscripción exitosa al curso",
      course,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al inscribirse al curso",
      error: err.message,
    });
  }
};

export const getCoursePassword = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { cid } = req.params;

    const course = await Course.findById(cid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }


    if (course.teacher.toString() !== usuario._id.toString() &&
      usuario.role !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver la contraseña de este curso",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Contraseña del curso obtenida exitosamente",
      password: course.password,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener la contraseña del curso",
      error: err.message,
    });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const userId = req.usuario._id;

    const courses = await Course.find({ students: userId, status: true }) 
      .populate('teacher', '-_id name surname email')
      .select('-password -document -students -status');

    return res.status(200).json({
      success: true,
      message: 'Cursos asignados al usuario',
      courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos',
      error: err.message,
    });
  }
};

export const filterCoursesStudent = async (req, res) => {
  try {
    const userId = req.usuario._id
    const { sort, name } = req.body;

    const searchFilters = {
      students: userId,
      status: true,
      ...(name && { name: { $regex: name, $options: 'i' } })
    };

    const sortOptions = sort || {};

    const courses = await Course.find(searchFilters)
      .populate('teacher', '-_id name surname email')
      .select('-password -document -students -status')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      message: 'Cursos filtrados',
      courses
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos',
      error: err.message,
    });
  }
};

export const getCoursesByTeacher = async (req, res) => {
  try {
    const teacherId = req.usuario._id;

    const courses = await Course.find({ teacher: teacherId, status: true })
      .select('-password -document -students -status')
      .populate('teacher degree', '-_id name surname email');

    return res.status(200).json({
      success: true,
      message: 'Cursos creados por el profesor',
      courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos del profesor',
    })
  }
}

export const filterCoursesTeacher = async (req, res) => {
  try {
    const userId = req.usuario._id
    const { sort, name } = req.body;

    const searchFilters = {
      students: userId,
      ...(name && { name: { $regex: name, $options: 'i' } })
    };

    const sortOptions = sort || {};

    const courses = await Course.find(searchFilters)
      .populate('teacher', '-_id name surname email')
      .select('-password -document -students -status')
      .populate('students', '-_id name surname email ')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      message: 'Cursos filtrados',
      courses
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos',
      error: err.message,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const user = req.usuario
    console.log(user.degree)

    const course = await Course.find({ degree: user.degree, status: true })
      .populate('degree', '-status -_id')
      .populate('teacher', '-_id name surname email')
      .select('-password -document -students -status');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cursos no encontrados',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Curso obtenido correctamente',
      course
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos',
      error: e.message
    });
  }
}

export const getCourseId = async (req, res) => {
  try {
    const { cid } = req.params;

    const course = await Course.findById(cid)
      .populate("teacher degree", "-_id name surname email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    if (course.status === false && usuario.role === 'STUDENT_ROLE') {
       return res.status(404).json({
        success: false,
        message: "Curso no encontrado o ya no está disponible.",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el curso",
      error: err.message,
    });
  }
};

export const getDocumentsByBimester = async (req, res) => {
  try {
    const { bimester } = req.body;
    const { cid } = req.params;

    if (!cid || !bimester || isNaN(bimester)) {
      return res.status(400).json({
        success: false,
        message: "courseId y bimester son requeridos y bimester debe ser un número válido",
      });
    }

    const course = await Course.findById(cid).select("degree name document");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Curso no encontrado",
      });
    }

    const degree = await Degree.findById(course.degree);
    if (!degree) {
      return res.status(404).json({
        success: false,
        message: "Grado no encontrado",
      });
    }

    const validBimesters = degree.name === "Sexto" ? 3 : 5;

    if (bimester < 1 || bimester > validBimesters) {
      return res.status(400).json({
        success: false,
        message: `El bimestre debe estar entre 1 y ${validBimesters} para el grado ${degree.name}`,
      });
    }

    const filteredDocs = course.document.filter(
  doc =>
    Number(doc.bimester) === Number(bimester)
    && doc.status === true
);
    return res.status(200).json({
      success: true,
      message: `Documentos del bimestre ${bimester} para el curso ${course.name}`,
      documents: filteredDocs,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener documentos",
      error: err.message,
    });
  }
};

export const deleteDocumentFromCourse = async (req, res) => {
  try {
    const { cid, did } = req.params;
    const usuario = req.usuario;

    const course = await Course.findById(cid);
    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado" });

    if (course.teacher.toString() !== usuario._id.toString() && usuario.role !== "ADMIN_ROLE") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const doc = course.document.id(did);
    if (!doc) return res.status(404).json({ success: false, message: "Documento no encontrado" });

    doc.status = false;
    await course.save();

    return res.status(200).json({ success: true, message: "Documento eliminado" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
