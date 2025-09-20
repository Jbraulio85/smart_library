import { Schema, model } from "mongoose";

const chatHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El userId es obligatorio"]
  },
  docUrl: {
    type: String,
    required: [true, "La URL del documento es obligatoria"]
  },
  question: {
    type: String,
    required: [true, "La pregunta es obligatoria"]
  },
  answer: {
    type: String,
    required: [true, "La respuesta es obligatoria"]
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  versionKey: false,
  timestamps: true
});

export default model("ChatHistory", chatHistorySchema);
