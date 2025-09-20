import Course from '../course/course.model.js';
import fetch from "node-fetch";

export const getDocuments = async (req, res) => {
  try {
    const courses = await Course.find().select("name document");

    const allDocuments = courses.flatMap(course =>
      course.document.map(doc => ({
        courseId: course._id,
        courseName: course.name,
        ...doc.toObject()
      }))
    );

    res.json(allDocuments);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los documentos",
      error
    });
  }
};

export const getDocumentById = async (req, res) => {
  const { cid, docId } = req.params;

  try {
    const course = await Course.findById(cid).select("name document");
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    const document = course.document.id(docId);
    if (!document) {
      return res.status(404).json({ message: "Documento no encontrado en este curso" });
    }

    res.json({
      courseId: course._id,
      courseName: course.name,
      ...document.toObject(),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el documento", error });
  }
};

export const getDocumentProxy = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: "Falta la URL del documento" });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo obtener el documento");

    const buffer = await response.arrayBuffer();
    const ext = url.split('.').pop();

    const contentTypeMap = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
      txt: "text/plain",
    };

    res.setHeader("Content-Type", contentTypeMap[ext] || "application/octet-stream");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Documento no encontrado" });
  }
};


export const editCourseDocument = async (req, res = response) => {
    const { cid, docId } = req.params;
    const { fileName, filePath } = req.body;

    try {
        const course = await Course.findById(cid);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const document = course.document.id(docId);
        if (!document) return res.status(404).json({ msg: 'Document not found' });

        if (fileName) document.fileName = fileName;
        if (filePath) document.filePath = filePath;
        document.uploadedAt = new Date();

        await course.save();
        res.json({ msg: 'Document updated', document });
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error', error });
    }
};

export const deleteCourseDocument = async (req, res = response) => {
    const { cid, docId } = req.params;

    try {
        const course = await Course.findById(cid);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const document = course.document.id(docId);
        if (!document) return res.status(404).json({ msg: 'Document not found' });

        document.deleteOne();
        await course.save();

        res.json({ msg: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error', error });
    }
};

export const getRecentDocuments = async (req, res = response) => {
    const { cid } = req.params;

    try {
        const course = await Course.findById(cid);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const recentDocs = [...course.document]
            .sort((a, b) => b.uploadedAt - a.uploadedAt)
            .slice(0, 5);

        res.json({ recentDocuments: recentDocs });
    } catch (error) {
        res.status(500).json({ msg: 'Internal server error', error });
    }
};