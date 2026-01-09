/**
 * Configuration de l'application EscapeTime
 */

// Charger les variables d'environnement
require("dotenv").config();

module.exports = {
    // URL de l'API de validation de licence
    // À modifier selon votre environnement
    API_URL: process.env.API_URL,

    // Clé secrète pour la signature locale (à changer pour chaque projet)
    // IMPORTANT: Changez cette valeur pour votre projet !
    LICENSE_SECRET: process.env.LICENSE_SECRET,

    // Autres configurations...
    APP_VERSION: "1.0.0",
    APP_NAME: "EscapeTime",
};
