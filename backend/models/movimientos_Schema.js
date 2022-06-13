const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movimientos_Schema = new Schema ({
    Submission_id: Number,
    Registro: Number,
    Cuenta: String,
    Fecha: String,
    Tipo: String,
    Numero: Number,
    Concepto: String,
    Referencia: String,
    Cargos: Number,
    Abonos: Number,
    Saldo: Number,
    Total: Number,
    Total_Cargos: Number,
    Total_Abonos: Number,
    Total_Saldo: Number,
    Categoria_Total: String,
    TotalContable_Cargos: Number,
    TotalContable_Abonos: Number,
    FechaSubida: String
});

const nombre_Usuario = "Testing";
var mov_Model = new mongoose.model(`excel_mov_Aux_${nombre_Usuario}`, movimientos_Schema, `excel_mov_Aux_${nombre_Usuario}`);

module.exports = mov_Model;