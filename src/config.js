/**
 * Configuration de l'app
 */

require("dotenv").config();

module.exports = {
    // URL de l'API de validation de licence
    API_URL: process.env.API_URL,

    // Clé secrète pour la signature locale
    LICENSE_SECRET: process.env.LICENSE_SECRET,

    // Autres configurations...
    APP_VERSION: "1.0.0",
    APP_NAME: "EscapeTime",
};
