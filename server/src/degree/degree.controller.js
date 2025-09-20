import Degree from "./degree.model.js"

const createDegrees = async () => {
    try {
        const existingDegreeFourth = await Degree.findOne({ name: "Cuarto" });
        const existingDegreeFifth = await Degree.findOne({ name: "Quinto" });
        const existingDegreeSixth = await Degree.findOne({ name: "Sexto" });

        if (!existingDegreeFourth) {
            const degreeFourth = new Degree({
                name: "Cuarto",
            });
            await degreeFourth.save();
            console.log("Grado Cuarto creado correctamente.");
        } else {
            console.log("El grado Cuarto ya existe.");
        }

        if (!existingDegreeFifth) {
            const degreeFifth = new Degree({
                name: "Quinto",
            });
            await degreeFifth.save();
            console.log("Grado Quinto creado correctamente.");
        } else {
            console.log("El grado Quinto ya existe.");
        }

        if (!existingDegreeSixth) {
            const degreeSixth = new Degree({
                name: "Sexto",
            });
            await degreeSixth.save();
            console.log("Grado Sexto creado correctamente.");
        } else {
            console.log("El grado Sexto ya existe.");
        }
    } catch (error) {
        console.error("Error al crear los grados", error);
    }
};

export default createDegrees;

export const listDegrees = async (req, res) => {
  try {
    const degrees = await Degree.find({ status: true }).select("name");
    
    res.status(200).json({
        success: true, 
        degrees
    });
  } catch (err) {
    res.status(500).json({ 
        success: false, 
        message: "Error listando grados", 
        error: err.message 
    });
  }
};