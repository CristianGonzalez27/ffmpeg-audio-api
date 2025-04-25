const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const cors = require("cors");

const app = express();

// Configura almacenamiento temporal para los archivos cargados
const upload = multer({ dest: "uploads/" });
ffmpeg.setFfmpegPath(ffmpegPath);

// Middleware
app.use(cors());

// Ruta para convertir video a audio
app.post("/convert", upload.single("data"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se recibió ningún archivo con el campo 'data'.");
  }

  const inputPath = req.file.path;
  const outputPath = `outputs/${req.file.filename}.mp3`;

  ffmpeg(inputPath)
    .noVideo()
    .audioCodec("libmp3lame")
    .save(outputPath)
    .on("end", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.error("Error al convertir:", err);
      res.status(500).send("Error al convertir el archivo.");
    });
});

// Inicia el servidor en el puerto definido por Render o 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo en puerto ${PORT}`);
});
