/**
 * Configuration de l'app
 */

require("dotenv").config();

const pkg = require("../package.json");

const DEFAULT_API_URL = "https://matt-buchs.me/api";
const DEFAULT_LICENSE_SECRET = "gamemaster-os-local-signature-v1";

const apiUrl = (process.env.API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
const licenseSecret = process.env.LICENSE_SECRET || DEFAULT_LICENSE_SECRET;

module.exports = {
	// URL de l'API de validation de licence
	API_URL: apiUrl,

	// Clé secrète pour la signature locale
	LICENSE_SECRET: licenseSecret,

	// Version de l'application : source unique depuis package.json
	APP_VERSION: pkg.version || "1.0.0",
	APP_NAME: "EscapeTime",
};
