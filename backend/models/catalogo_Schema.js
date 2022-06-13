const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const catalogo_Schema = new Schema ({
    Submission_id: Number,
    Nivel: Number,
    Codigo: String,
    Nombre: String,
    Tipo: String,
    Fin: String,
    Moneda: String,
    NIF: Number,
    SAT: Number,
    FechaSubida: String
});

const nombre_Usuario = "Testing";
var catalogo_Model = new mongoose.model(`excel_catalogo_${nombre_Usuario}`, catalogo_Schema, `excel_catalogo_${nombre_Usuario}`);

module.exports = catalogo_Model;
