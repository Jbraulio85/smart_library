import ChatHistory from "./chatHistory.model.js";
import OpenAI from 'openai';
import fetch from 'node-fetch';
import pdf from 'pdf-parse';
import Course from '../course/course.model.js';
import Degree from '../degree/degree.model.js';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pdfTextCache = new Map();
const triviaCache = new Map();

async function fetchDocumentContent(url) {
  const origWarn = console.warn;
  console.warn = (msg, ...args) => {
    if (typeof msg === "string" && msg.includes("undefined function: 21")) return;
    origWarn(msg, ...args);
  };

  try {
    if (pdfTextCache.has(url)) {
      return pdfTextCache.get(url);
    }

    const resp = await fetch(url);
    if (!resp.ok) return null;

    const buffer = await resp.buffer();
    const { text } = await pdf(buffer);

    pdfTextCache.set(url, text);
    return text;
  } catch (err) {
    console.error("Error al procesar el PDF:", err);
    return null;
  } finally {
    console.warn = origWarn;
  }
}

const DAILY_LIMIT = 5;
const STUDENT_ROLE = 'STUDENT_ROLE';
const TEACHER_ROLE = 'TEACHER_ROLE';

export const runChat = async (req, res) => {
  try {
    const { url, question } = req.body;
    const userId = req.usuario._id;
    const role = req.usuario.role;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ success: false, message: "La pregunta no fue proporcionada correctamente." });
    }
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ success: false, message: "Debe proporcionarse una URL válida del documento PDF." });
    }

    if (role === STUDENT_ROLE) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const usedToday = await ChatHistory.countDocuments({
        userId,
        createdAt: { $gte: startOfDay }
      });

      if (usedToday >= DAILY_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `Has alcanzado el límite de ${DAILY_LIMIT} consultas diarias.`
        });
      }
    }


    const fullText = await fetchDocumentContent(url);
    if (!fullText) {
      return res.status(400).json({ success: false, message: "No se pudo extraer texto del archivo PDF." });
    }
    const chunk = fullText.slice(0, 10000);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: 'Analiza el documento proporcionado tomando en cuenta las siguientes instrucciones: No respondas a nada que no tenga que ver con el documento, no realices ejercicios, solo da un ejemplo de explicación, y no respondas a contenido inapropiado.' },
        { role: "user", content: `Fragmento del documento:\n${chunk}` },
        { role: "user", content: question },
      ],
      max_tokens: 1000,
      temperature: 0.2
    });

    const answer = response.choices?.[0]?.message?.content || "Sin respuesta del modelo.";

    await ChatHistory.create({ userId, docUrl: url, question, answer });

    return res.status(200).json({ success: true, message: "La respuesta de chat es:", answer });
  } catch (err) {
    console.error("Error en runChat:", err);
    return res.status(500).json({ success: false, message: err.message || "Error interno al procesar la solicitud." });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const { docUrl } = req.query;
    if (!docUrl) {
      return res.status(400).json({ success: false, message: "El parámetro docUrl es obligatorio" });
    }
    const history = await ChatHistory.find({ userId, docUrl, active: true }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("Error al obtener historial:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const userId = req.usuario._id;
    const { docUrl } = req.query;
    if (!docUrl) {
      return res.status(400).json({ success: false, message: "docUrl es obligatorio" });
    }
    const result = await ChatHistory.updateMany({ userId, docUrl, active: true }, { $set: { active: false } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "No se encontró historial activo" });
    }
    return res.status(200).json({ success: true, message: "Historial marcado como inactivo" });
  } catch (err) {
    console.error("Error al borrar historial:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateTrivia = async (req, res) => {
  const courseId = req.params.courseId;
  
  try {
    const curso = await Course
      .findOne({ _id: courseId, status: true })
      .populate('degree')
      .exec();

    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado o inactivo." });
    }
    const cursoNombre       = curso.name;
    const descriptionCourse = curso.description;

    const degreeName = curso.degree?.name || "Sin grado asignado";

    const prompt = `
      Crea una pregunta de trivia a nivel de diversificado sobre el curso "${cursoNombre}", la descripción "${descriptionCourse}",
      el grado "${degreeName} y lo mas importante hazlo en base a los documentos del curso". No repitas las mismas preguntas.

      Responde sólo en formato JSON:
      {"texto":"¿...?","opciones":{"A":"...","B":"...","C":"...","D":"..."},"correcta":"A|B|C|D"}
      Máximo 200 tokens.
    `;
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 250
    });

    const content = completion.choices[0].message.content.trim();
    let json;
    try {
      json = JSON.parse(content);
    } catch {
      return res.status(500).json({
        error: "Respuesta no es JSON válido",
        raw: content
      });
    }


    const triviaId = uuidv4();
    triviaCache.set(triviaId, json.correcta);
    setTimeout(() => triviaCache.delete(triviaId), 5 * 60 * 1000);

    return res.json({
      triviaId,
      texto: json.texto,
      opciones: json.opciones
    });

  } catch (err) {
    console.error("Error trivia:", err);
    return res.status(500).json({
      error: "Error al generar trivia",
      message: err.message
    });
  }
};


export const checkAnswer = (req, res) => {
  const { answer } = req.body;
  const { triviaId } = req.params;
  if (!triviaId || !answer) return res.status(400).json({ error: 'Faltan datos triviaId o respuesta.' });
  const correcta = triviaCache.get(triviaId);
  if (!correcta) return res.status(404).json({ error: 'Pregunta no encontrada o expirada.' });
  res.json({ esCorrecta: correcta === answer });
};
