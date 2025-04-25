const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });
ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors());

app.post("/convert", upload.single("data"), (req, res) => {
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

app.listen(3000, () => {
  console.log("Servidor listo en puerto 3000");
});

