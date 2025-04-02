const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Charger les variables d’environnement
const db = require("./db"); // Connexion à MySQL
const routes = require("./endpoints"); // Importation des routes

const app = express();
app.use(express.json());
var corsOptions = {
  origin: true, //"http://localhost:8090"
  credentials: true,
  exposedHeaders: ["set-cookie"],
};
app.use(cors(corsOptions));

// Utilisation des routes définies
app.use("/api", routes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
});
