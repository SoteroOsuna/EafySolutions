import React, { useEffect, useState } from "react";
import Select from 'react-select';
import axios from "axios";
import swal from 'sweetalert';
import {Table} from 'reactstrap';
import Pdf from "react-to-pdf";
//import { jsPDF } from "jspdf";
import jsPDF from 'jspdf'
import html2canvas from "html2canvas";
import { compareSync } from "bcryptjs";


const reference1 = React.createRef();
const reference2 = React.createRef();
const reference3 = React.createRef();

const Swal = require('sweetalert2');

function Dashboard(){

    const [reportGenerated, setReportGenerated] = useState(false);
    const [cuentasBG, setCuentasBG] = useState({});
    const [totales, setTotales] = useState([0,0,0,0,0,0,0,0]);

    //Estado ER
    const [cuentasER, setCuentasER] = useState({});

    //Estado BC
    const [cuentasBC, setCuentasBC] = useState({});

    var Mes_Rep1 = "";
    var Mes_Rep2 = "";

    var cuentas = {};
    var limitesBG = {
        "ActivoCiculante": [100, 119],
        "ActivoFijo": [120, 139],
        "ActivoDiferido": [140,199],
        "PasivoCirculante": [200, 219],
        "PasivoFijo": [220,229],
        "PasivoDiferido": [230, 399],
        "Ingresos": [400, 499],
    }
    var activoCirculante = [];
    //"Bancos", "Clientes", "Deudores Diversos", "IVA Acreditable"
    var activoFijo = [];
    //"Mobiliario y Equipo de oficina", "Depreciación Acumulada de Mob y Eq. oficina"
    var activoDiferido = [];
    //"Impuestos Anticipados"
    var pasivoCirculante = [];
    //"ACREEDORES DIVERSOS", "IMPUESTOS POR PAGAR", "DOCUMENTOS POR PAGAR"
    var pasivoFijo = [];
    var pasivoDiferido = [];
    var capital = [];
    var ingresos = [];
    var egresos = [];
    //"Capital Social", "Resultado Ejercicios Anteriores"

    const llenarTablaRBG = (tablaID, categoria, textoTotal, indice) => {
        var ACTable = document.getElementById(tablaID);
                for (let i = 0; i < categoria.length; i++) {
                    console.log("añadiendo fila: ", categoria[i]);
                    if (cuentasBG[categoria[i]] != null && cuentasBG[categoria[i]] != 0) {
                        var row = ACTable.insertRow(ACTable.rows.length);
                        var cell0 = row.insertCell(0);
                        cell0.innerHTML = categoria[i];

                        var cell1 = row.insertCell(1);
                        var element = document.createElement("p");
                        //element.className = "cantidad";
                        element.innerHTML = cuentasBG[categoria[i]];
                        cell1.appendChild(element);

                    }
                }
                var row = ACTable.insertRow(ACTable.rows.length);
                var cell0 = row.insertCell(0);

                var cell1 = row.insertCell(1);
                var element = document.createElement("hr");
                cell1.appendChild(element);

                row = ACTable.insertRow(ACTable.rows.length);
                cell0 = row.insertCell(0);
                element = document.createElement("p");
                element.innerHTML = textoTotal;
                cell0.appendChild(element);

                cell1 = row.insertCell(1);
                element = document.createElement("p");
                element.innerHTML = totales[indice];
                cell1.appendChild(element);
    }
    const sumarTotal = (tablaID, textoTotal) => {
        console.log("probando con tabla: ", tablaID);
        console.log("totales de:", totales);
        var tablaSuma = document.getElementById(tablaID);
        var row = tablaSuma.insertRow(tablaSuma.rows.length);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var element = document.createElement("hr");
        cell1.appendChild(element);

        if (textoTotal == "SUMA DEL ACTIVO") {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[0] + totales[1] + totales [2]).toFixed(2);
            cell1.appendChild(element);
        } else if (textoTotal == "SUMA DEL PASIVO") {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[3] + totales[4] + totales [5]).toFixed(2);
            cell1.appendChild(element);
        } else if (textoTotal == "SUMA DEL CAPITAL") {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[6] + totales[7]).toFixed(2);
            cell1.appendChild(element);
        } else {
            row = tablaSuma.insertRow(tablaSuma.rows.length)
            cell0 = row.insertCell(0);
            element = document.createElement("p");
            element.innerHTML = textoTotal;
            cell0.appendChild(element);

            cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = (totales[3] + totales[4] + totales[5] + totales[6] + totales[7]).toFixed(2);
            cell1.appendChild(element);
        }
    }

    const generarReporteBG = () => {
        console.log(Mes_Rep1);
        console.log(Mes_Rep2);

        axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}`).then(resp => {
            const datos = resp.data;
            console.log(datos); 
            if (datos.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'No existen registros en la DB con la fecha especificada :('
                })
            }  
                
            console.log("checando datos...");
            for (let i = 0; i < datos.length; i++) {
                console.log(datos[i]);
                if (datos[i]["Categoria_Total"] != "Movimiento de Cuenta Común" &&
                    (datos[i]["Total_Cargos"] || datos[i]["Total_Abonos"] || datos[i]["Total_Saldo"]) ) {
                        if (cuentasBG[datos[i]["Categoria_Total"]] == null) {
                            if(datos[i]["Categoria_Total"].substring(0,12) == "Depreciación") {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] = -1*datos[i]["Total_Saldo"]);
                            } else {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] = datos[i]["Total_Saldo"]);
                            }
                        } else {
                            if(datos[i]["Categoria_Total"].substring(0,12) == "Depreciación") {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] += -1*datos[i]["Total_Saldo"]);
                            } else {
                                setCuentasBG(cuentasBG[datos[i]["Categoria_Total"]] += datos[i]["Total_Saldo"]);
                            }
                        }
                    let codigo = parseInt(datos[i]["Cuenta"].substring(0,3));
                    console.log(codigo);
                    if (codigo >= limitesBG["ActivoCiculante"][0] && codigo <= limitesBG["ActivoCiculante"][1]) {
                        if (!activoCirculante.includes(datos[i]["Categoria_Total"])) {
                            activoCirculante.push(datos[i]["Categoria_Total"]);
                        } 
                    } else if (codigo >= limitesBG["ActivoFijo"][0] && codigo <= limitesBG["ActivoFijo"][1]) {
                        if (!activoFijo.includes(datos[i]["Categoria_Total"])){
                            activoFijo.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["ActivoDiferido"][0] && codigo <= limitesBG["ActivoDiferido"][1]) {
                        if (!activoDiferido.includes(datos[i]["Categoria_Total"])) {
                            activoDiferido.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["PasivoCirculante"][0] && codigo <= limitesBG["PasivoCirculante"][1]) {
                        if (!pasivoCirculante.includes(datos[i]["Categoria_Total"])) {
                            pasivoCirculante.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["PasivoFijo"][0] && codigo <= limitesBG["PasivoFijo"][1]) {
                        if (!pasivoFijo.includes(datos[i]["Categoria_Total"])) {
                            pasivoFijo.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= limitesBG["PasivoDiferido"][0] && codigo <= limitesBG["PasivoDiferido"][1]) {
                        if (!pasivoDiferido.includes(datos[i]["Categoria_Total"])) {
                            pasivoDiferido.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo < 100) {
                        if (!capital.includes(datos[i]["Categoria_Total"])) {
                            capital.push(datos[i]["Categoria_Total"]);
                        }      
                    } else if (codigo >= limitesBG["Ingresos"][0] && codigo <= limitesBG["Ingresos"][1]) {
                        if (!ingresos.includes(datos[i]["Categoria_Total"])) {
                            ingresos.push(datos[i]["Categoria_Total"]);
                        }
                    } else if (codigo >= 500) {
                        if (!egresos.includes(datos[i]["Categoria_Total"])) {
                            egresos.push(datos[i]["Categoria_Total"]);
                        }
                    }
                }
            }
            console.log("datos checados");
            for (const activoC of activoCirculante) {
                setTotales(totales[0] += cuentasBG[activoC]);
            }
            for (const activoF of activoFijo) {
                setTotales(totales[1] += cuentasBG[activoF]);
            }
            for (const activoD of activoDiferido) {
                setTotales(totales[2] += cuentasBG[activoD]);
            }
            for (const pasivoC of pasivoCirculante) {
                setTotales(totales[3] += cuentasBG[pasivoC]);
            }
            for (const pasivoF of pasivoFijo) {
                setTotales(totales[4] += cuentasBG[pasivoF]);
            }
            for (const pasivoD of pasivoDiferido) {
                setTotales(totales[5] += cuentasBG[pasivoD]);
            }
            for (const c of capital) {
                setTotales(totales[6] += cuentasBG[c]);
            }
            for (const i of ingresos) {
                setTotales(totales[7] += cuentasBG[i]);
            }
            for (const e of egresos) {
                setTotales(totales[7] -= cuentasBG[e]);
            }

            console.log(cuentasBG);
            console.log(totales);
            setCuentasBG(cuentas);
            console.log(activoCirculante);
            console.log(capital);
            console.log(ingresos);
            console.log(egresos);
            llenarTablaRBG("tabla-activos-circulante", activoCirculante, "Total CIRCULANTE", 0);
            llenarTablaRBG("tabla-activos-fijo", activoFijo, "Total FIJO", 1);
            llenarTablaRBG("tabla-activos-diferido", activoDiferido, "Total DIFERIDO", 2);
            llenarTablaRBG("tabla-pasivos-circulante", pasivoCirculante, "Total CIRCULANTE", 3);
            llenarTablaRBG("tabla-pasivos-fijo", pasivoFijo, "Total FIJO", 4);
            llenarTablaRBG("tabla-pasivos-diferido", pasivoDiferido, "Total DIFERIDO", 5);
            llenarTablaRBG("tabla-capital", capital, "Total CAPITAL", 6);
            sumarTotal("tabla-suma-activos", "SUMA DEL ACTIVO");
            sumarTotal("tabla-suma-pasivos", "SUMA DEL PASIVO");
            sumarTotal("tabla-suma-capital", "SUMA DEL CAPITAL");
            sumarTotal("tabla-suma-pc", "SUMA DEL PASIVO Y CAPITAL");

            var tablaC = document.getElementById("tabla-capital");
            var row = tablaC.insertRow(tablaC.rows.length);
            var cell0 = row.insertCell(0);
            var element = document.createElement("p");
            element.innerHTML = "Utilidad o Pérdida del Ejercicio";
            cell0.appendChild(element);

            var cell1 = row.insertCell(1);
            element = document.createElement("p");
            element.innerHTML = totales[7].toFixed(2);
            cell1.appendChild(element);

            
            
            
            setReportGenerated(current => !current);
        });
    };

    const generarReporteER = () => {
        var ingresosTotal = [0, 0];
        var egresosTotal = [0, 0];
        var ingresos = [];
        var egresos = [];
        var egresosSub = {};
        var asignacion = {};
        var diccionarioCN = {};

        axios.all([
            axios.get('/recibirCuentas'), 
            axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}`)
        ])
        .then(axios.spread((resp1, resp2) => {
            var catalogoCuentas = resp1.data;
            var movimientos = resp2.data;
            var pendientes = [];
            
            console.log("Comenzamos");
            //Revisar el catálogo y ver cuentas que estarán en el reporte ER
            for (let i = 0; i < catalogoCuentas.length; i++) {
                if (parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) >= 400 && parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) < 500) {
                    ingresos.push(catalogoCuentas[i]["Codigo"]);
                    diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                    diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                    setCuentasER(cuentasER[catalogoCuentas[i]["Codigo"]] = [0, 0]);
                } else if (parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) > 500 && catalogoCuentas[i]["Codigo"].substring(4,8) == "0000") {
                    egresos.push(catalogoCuentas[i]["Codigo"]);
                    asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)] = catalogoCuentas[i]["Codigo"];
                    egresosSub[asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)]] = [];
                    diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                    diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                    setCuentasER(cuentasER[catalogoCuentas[i]["Codigo"]] = [0, 0]);
                } else if (parseInt(catalogoCuentas[i]["Codigo"].substring(0,3)) > 500) {
                    if (asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)] == null) {
                        pendientes.push(catalogoCuentas[i]);
                    } else {
                        egresosSub[asignacion[catalogoCuentas[i]["Codigo"].substring(0,3)]].push(catalogoCuentas[i]["Codigo"]);
                        diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                        diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                        setCuentasER(cuentasER[catalogoCuentas[i]["Codigo"]] = [0, 0]);
                    }
                }
            }

            //Revisar casos donde todavía no estaba la categoria en asignación
            for (let i = 0; i < pendientes.length; i++) {
                if (asignacion[pendientes[i]["Codigo"].substring(0,3)] != null) {
                    egresosSub[asignacion[pendientes[i]["Codigo"].substring(0,3)]].push(pendientes[i]["Codigo"]);
                    diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                    diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                    setCuentasER(cuentasER[catalogoCuentas[i]["Codigo"]] = [0, 0]);
                }
            }

            //Analizar movimientos para conseguir los totales de las subcategorías 
            for (let i = 0; i < movimientos.length; i++) {
                if (((movimientos[i]["Categoria_Total"] != null && movimientos[i]["Categoria_Total"] != "Movimiento de Cuenta Común" 
                && (parseInt(movimientos[i]["Cuenta"].substring(0,3)) >= 400)
                && (movimientos[i]["Total_Cargos"] || movimientos[i]["Total_Abonos"] || movimientos[i]["Total_Saldo"])))) {
                    let codigo = "";
                    if (movimientos[i]["Cuenta"] != diccionarioCN[movimientos[i]["Categoria_Total"]] && diccionarioCN[movimientos[i]["Categoria_Total"]] != null) {
                        codigo = diccionarioCN[movimientos[i]["Categoria_Total"]];
                    } else if (diccionarioCN[movimientos[i]["Categoria_Total"]] == null) {
                        codigo = movimientos[i]["Cuenta"];
                        diccionarioCN[movimientos[i]["Categoria_Total"]] = codigo;
                        diccionarioCN[codigo] = movimientos[i]["Categoria_Total"];
                    } else {
                        codigo = movimientos[i]["Cuenta"];
                    }

                    console.log("Codigo decidido:", codigo);
                    if (movimientos[i]["Total_Cargos"] > 0 && movimientos[i]["Total_Abonos"] == 0) {
                        var currObj = cuentasER[codigo];
                        currObj[0] += movimientos[i]["Total_Cargos"];
                        currObj[1] += movimientos[i]["Total_Saldo"];
                        setCuentasER(cuentasER[codigo] = currObj);
                    } else{
                        var currObj = cuentasER[codigo];
                        currObj[0] += movimientos[i]["Total_Abonos"];
                        currObj[1] += movimientos[i]["Total_Saldo"];
                        setCuentasER(cuentasER[codigo] = currObj);
                    }
                }
            }
            //Calcular el total de ingresos
            for (let i = 0; i<ingresos.length; i++) {
                if (cuentasER[ingresos[i]] != null) {
                    ingresosTotal[0] += cuentasER[ingresos[i]][0];
                    ingresosTotal[1] += cuentasER[ingresos[i]][1];
                }
            }
            console.log("Calculando total de ingresos");
            //Calcular el total de cada categoría de egresos
            for (let i = 0; i<egresos.length; i++) {
                var currTotal = [0,0];
                console.log("Vamos con la categoria: ", diccionarioCN[egresos[i]]);
                console.log(cuentasER[egresos[i]]);
                if (cuentasER[egresos[i]][0] == 0 && cuentasER[egresos[i]][1] == 0) {
                    for (let j = 0; j<egresosSub[egresos[i]].length; j++) {
                        console.log("Vamos con la subcategoria: ", diccionarioCN[egresosSub[egresos[i]]]);
                        if(cuentasER[egresosSub[egresos[i]][j]] != null) {
                            currTotal[0] += cuentasER[egresosSub[egresos[i]][j]][0];
                            currTotal[1] += cuentasER[egresosSub[egresos[i]][j]][1];
                        }
                    }
                    egresosTotal[0] += currTotal[0];
                    egresosTotal[1] += currTotal[1];
                    setCuentasER(cuentasER[egresos[i]] = currTotal);
                } else {
                    egresosTotal[0] += cuentasER[egresos[i]][0];
                    egresosTotal[1] += cuentasER[egresos[i]][1];
                }
            }
            console.log(diccionarioCN);
            console.log(ingresos);
            console.log(egresos);
            console.log(egresosSub);
            console.log(ingresosTotal);
            console.log(egresosTotal);
            console.log(cuentasER);
            //Añadir contenido HTML a la página: 

            //Añadir titulo de ingresos: 
            var ERTable = document.getElementById("tablaER");
            var row = ERTable.insertRow(ERTable.rows.length);
            var cell0 = row.insertCell(0);
            var element = document.createElement("strong");
            element.innerHTML = "Ingresos";
            cell0.appendChild(element);

            //Agregar subcategorías de ingresos:
            for (let i = 0; i < ingresos.length; i++) {
                if (cuentasER[ingresos[i]] != null && (cuentasER[ingresos[i]][0] != 0 || cuentasER[ingresos[i]][1] != 0)) {
                    var Irow = ERTable.insertRow(ERTable.rows.length);
                    var ICell0 = Irow.insertCell(0);
                    var Ielement = document.createElement("p");
                    Ielement.innerHTML = diccionarioCN[ingresos[i]];
                    ICell0.appendChild(Ielement);

                    var ICell1 = Irow.insertCell(1);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = (cuentasER[ingresos[i]][0]).toFixed(2);
                    ICell1.appendChild(Ielement);

                    var ICell2 = Irow.insertCell(2);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = ((cuentasER[ingresos[i]][0] / ingresosTotal[0]) * 100).toFixed(2);
                    ICell2.appendChild(Ielement);

                    var ICell3 = Irow.insertCell(3);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = (cuentasER[ingresos[i]][1]).toFixed(2);
                    ICell3.appendChild(Ielement);

                    var ICell4 = Irow.insertCell(4);
                    Ielement = document.createElement("p");
                    Ielement.innerHTML = ((cuentasER[ingresos[i]][1] / ingresosTotal[1]) * 100).toFixed(2)
                    ICell4.appendChild(Ielement);
                }
            }
            
            //Agregar total de ingresos
            var TIrow = ERTable.insertRow(ERTable.rows.length);
            var TIcell0 = TIrow.insertCell(0);
            var TIelement = document.createElement("strong");
            TIelement.innerHTML = "Total Ingresos";
            TIcell0.appendChild(TIelement);

            var TIcell1 = TIrow.insertCell(1);
            TIelement = document.createElement("p");
            TIelement.innerHTML = (ingresosTotal[0]).toFixed(2);
            TIcell1.appendChild(TIelement);

            var TIcell2 = TIrow.insertCell(2);
            TIelement = document.createElement("p");
            TIelement.innerHTML = ((ingresosTotal[0] / ingresosTotal[0]) * 100).toFixed(2);
            TIcell2.appendChild(TIelement);

            var TIcell3 = TIrow.insertCell(3);
            TIelement = document.createElement("p");
            TIelement.innerHTML = (ingresosTotal[1]).toFixed(2);
            TIcell3.appendChild(TIelement);

            var TIcell4 = TIrow.insertCell(4);
            TIelement = document.createElement("p");
            TIelement.innerHTML = ((ingresosTotal[1] / ingresosTotal[1]) * 100).toFixed(2)
            TIcell4.appendChild(TIelement);

            //Agregar titulo de egresos
            row = ERTable.insertRow(ERTable.rows.length);
            cell0 = row.insertCell(0);
            element = document.createElement("strong");
            element.innerHTML = "Egresos";
            cell0.appendChild(element);

            //Agregar cada categoria de egresos
            egresos.sort();
            for (let i = 0; i < egresos.length; i++) {
                if (cuentasER[egresos[i]]  && (cuentasER[egresos[i]][0] != 0 || cuentasER[egresos[i]][0] != 0)) {
                    //Agregar título de categoría
                    var Erow = ERTable.insertRow(ERTable.rows.length);
                    var Ecell0 = Erow.insertCell(0);
                    var Eelement = document.createElement("p");
                    Eelement.innerHTML = diccionarioCN[egresos[i]];
                    Ecell0.appendChild(Eelement);

                    //Agregar cada subcategoría
                    egresosSub[egresos[i]].sort();
                    for (let j = 0; j<egresosSub[egresos[i]].length;j++) {
                        if (cuentasER[egresosSub[egresos[i]][j]] != null && (cuentasER[egresosSub[egresos[i]][j]][0] != 0 || cuentasER[egresosSub[egresos[i]][j]][1] != 0)) {
                            var SErow = ERTable.insertRow(ERTable.rows.length);

                            var SEcell0 = SErow.insertCell(0);
                            var SEelement = document.createElement("p");
                            SEelement.innerHTML = diccionarioCN[egresosSub[egresos[i]][j]];
                            SEcell0.appendChild(SEelement);

                            var SEcell1 = SErow.insertCell(1);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = (cuentasER[egresosSub[egresos[i]][j]][0]).toFixed(2);
                            SEcell1.appendChild(SEelement);

                            var SEcell2 = SErow.insertCell(2);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = ((cuentasER[egresosSub[egresos[i]][j]][0] / ingresosTotal[0]) * 100).toFixed(2);
                            SEcell2.appendChild(SEelement);

                            var SEcell3 = SErow.insertCell(3);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = (cuentasER[egresosSub[egresos[i]][j]][1]).toFixed(2);
                            SEcell3.appendChild(SEelement);

                            var SEcell4 = SErow.insertCell(4);
                            SEelement = document.createElement("p");
                            SEelement.innerHTML = ((cuentasER[egresosSub[egresos[i]][j]][1] / ingresosTotal[1]) * 100).toFixed(2);
                            SEcell4.appendChild(SEelement);
                        }
                    }
                    //Agregar total de la categoría
                    Erow = ERTable.insertRow(ERTable.rows.length);

                    Ecell0 = Erow.insertCell(0);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = "Total ".concat(diccionarioCN[egresos[i]]);
                    Ecell0.appendChild(Eelement);

                    var Ecell1 = Erow.insertCell(1);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = (cuentasER[egresos[i]][0]).toFixed(2);
                    Ecell1.appendChild(Eelement);

                    var Ecell2 = Erow.insertCell(2);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = ((cuentasER[egresos[i]][0] / ingresosTotal[0]) * 100).toFixed(2);
                    Ecell2.appendChild(Eelement);

                    var Ecell3 = Erow.insertCell(3);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = (cuentasER[egresos[i]][1]).toFixed(2);
                    Ecell3.appendChild(Eelement);

                    var Ecell4 = Erow.insertCell(4);
                    Eelement = document.createElement("p");
                    Eelement.innerHTML = ((cuentasER[egresos[i]][1] / ingresosTotal[1]) * 100).toFixed(2);
                    Ecell4.appendChild(Eelement);
                }
            }

            //Agregar total de egresos
            var TErow = ERTable.insertRow(ERTable.rows.length);
            var TEcell0 = TErow.insertCell(0);
            var TEelement = document.createElement("strong");
            TEelement.innerHTML = "Total Egresos";
            TEcell0.appendChild(TEelement);

            var TEcell1 = TErow.insertCell(1);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (egresosTotal[0]).toFixed(2);
            TEcell1.appendChild(TEelement);

            var TEcell2 = TErow.insertCell(2);
            TEelement = document.createElement("p");
            TEelement.innerHTML = ((egresosTotal[0] / ingresosTotal[0]) * 100).toFixed(2);
            TEcell2.appendChild(TEelement);

            var TEcell3 = TErow.insertCell(3);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (egresosTotal[1]).toFixed(2);
            TEcell3.appendChild(TEelement);

            var TEcell4 = TErow.insertCell(4);
            TEelement = document.createElement("p");
            TEelement.innerHTML = ((egresosTotal[1] / ingresosTotal[1]) * 100).toFixed(2)
            TEcell4.appendChild(TEelement);

            //Agregar utilidad
            var TErow = ERTable.insertRow(ERTable.rows.length);
            var TEcell0 = TErow.insertCell(0);
            var TEelement = document.createElement("strong");
            TEelement.innerHTML = "Utilidad (o Pérdida)";
            TEcell0.appendChild(TEelement);

            var TEcell1 = TErow.insertCell(1);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (ingresosTotal[0] - egresosTotal[0]).toFixed(2);
            TEcell1.appendChild(TEelement);

            var TEcell2 = TErow.insertCell(2);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (((ingresosTotal[0] - egresosTotal[0]) / ingresosTotal[0]) * 100).toFixed(2);
            TEcell2.appendChild(TEelement);

            var TEcell3 = TErow.insertCell(3);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (ingresosTotal[0] - egresosTotal[1]).toFixed(2);
            TEcell3.appendChild(TEelement);

            var TEcell4 = TErow.insertCell(4);
            TEelement = document.createElement("p");
            TEelement.innerHTML = (((ingresosTotal[1] - egresosTotal[1]) / ingresosTotal[1]) * 100).toFixed(2)
            TEcell4.appendChild(TEelement);
        }));


    };

    const generarReporteBC = () => {
        var diccionarioCN = {};
        var categoriasEspeciales = {
            "000-0110": [], //Activo Circulante
            "000-0120": [], //Activo Fijo
            "000-0140": [], //Activo Diferido
            "000-0210": [], //Pasivo Circulante
            "000-0220": [], //Pasivo Fijo
            "000-0230": [], //Pasivo Diferido
        };
        var categoriasGrandes = {
            "000-0100": ["000-0110", "000-0120", "000-0140"], //Activos
            "000-0200": ["000-0210", "000-0220", "000-0230"], //Pasivos
            "000-0300": [], //Capital
            "000-0400": [], //Resultados Acreedoras
            "000-0500": [] //Resultados Deudoras
        };
        var subs = {}

        axios.all([
            axios.get('/recibirCuentas'), 
            axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}`)
          ])
          .then(axios.spread((resp1, resp2) => {
            var catalogoCuentas = resp1.data;
            var movimientos = resp2.data;
            var pendientes = [];
            var orden = [];

            //Revisar el catálogo y empezar con asignación en 0s
            for (let i = 0; i < catalogoCuentas.length; i++) {
                setCuentasBC(cuentasBC[catalogoCuentas[i]["Codigo"]] = [0,0,0,0]);
                diccionarioCN[catalogoCuentas[i]["Codigo"]] = catalogoCuentas[i]["Nombre"];
                diccionarioCN[catalogoCuentas[i]["Nombre"]] = catalogoCuentas[i]["Codigo"];
                let codigo = catalogoCuentas[i]["Codigo"];
                let prefijo = parseInt(codigo.substring(0,3));
                if (codigo.substring(0,6) == "000-03") {
                    categoriasGrandes["000-0300"].push(codigo);
                } else if (codigo.substring(4,8) == "0000") {
                    subs[codigo] = [];
                    if (prefijo < 400) {
                        if (prefijo >= 100 && prefijo < 119) {
                            categoriasEspeciales["000-0110"].push(codigo);
                        } else if (prefijo >= 120 && prefijo < 140) {
                            categoriasEspeciales["000-0120"].push(codigo);
                        } else if (prefijo >= 140 && prefijo < 199) {
                            categoriasEspeciales["000-0140"].push(codigo);
                        } else if (prefijo >= 200 && prefijo < 219) {
                            categoriasEspeciales["000-0210"].push(codigo);
                        } else if (prefijo >= 220 && prefijo < 230) {
                            categoriasEspeciales["000-0220"].push(codigo);
                        } else {
                            categoriasEspeciales["000-0230"].push(codigo);
                        }
                    } else {
                        if (prefijo < 500) {
                            categoriasGrandes["000-0400"].push(codigo);
                        } else {
                            categoriasGrandes["000-0500"].push(codigo);
                        }
                    }
                } else if (prefijo != 0) {
                    let subCodigo = toString(prefijo).concat("-0000");
                    if (subs[subCodigo] == null) {
                        pendientes.push(codigo);
                    } else {
                        subs[subCodigo].push(codigo);
                    }
                }
            }

            //Añadir pendientes
            for (let i = 0; i < pendientes.length; i++) {
                let subCodigo = pendientes[i].substring(0,3).concat("-0000");
                subs[subCodigo].push(pendientes[i]);
            } 

            //Revisar movimientos y asignar valores para la tabla
            for (let i = 0; i < movimientos.length; i++) {
                if (movimientos[i]["Categoria_Total"] != null) {
                    let sInicial;
                    if ((parseInt(movimientos[i]["Cuenta"].substring(0,3)) >= 200 && parseInt(movimientos[i]["Cuenta"].substring(0,3)) < 300) ||
                        (parseInt(movimientos[i]["Cuenta"].substring(0,3)) >= 400 && parseInt(movimientos[i]["Cuenta"].substring(0,3)) < 500)) {
                        sInicial = movimientos[i]["Total_Saldo"] + movimientos[i]["Total_Cargos"] - movimientos[i]["Total_Abonos"];
                    } else {
                        sInicial = movimientos[i]["Total_Saldo"] + movimientos[i]["Total_Abonos"] - movimientos[i]["Total_Cargos"];
                    }
                    if(movimientos[i]["Categoria_Total"] == "Movimiento de Cuenta Común") {
                        var currObj = cuentasBC[movimientos[i]["Cuenta"]];
                        currObj[0] += sInicial;
                        currObj[1] += movimientos[i]["Total_Cargos"];
                        currObj[2] += movimientos[i]["Total_Abonos"];
                        currObj[3] += movimientos[i]["Total_Saldo"];
                        setCuentasBC(cuentasBC[movimientos[i]["Cuenta"]] = currObj);
                    } else {
                        var codigo = "";
                        if (movimientos[i]["Cuenta"] != diccionarioCN[movimientos[i]["Categoria_Total"]] && diccionarioCN[movimientos[i]["Categoria_Total"]] != null) {
                            codigo = diccionarioCN[movimientos[i]["Categoria_Total"]];
                        } else if (diccionarioCN[movimientos[i]["Categoria_Total"]] == null) {
                            codigo = movimientos[i]["Cuenta"];
                            diccionarioCN[movimientos[i]["Categoria_Total"]] = codigo;
                            diccionarioCN[codigo] = movimientos[i]["Categoria_Total"];
                        } else {
                            codigo = movimientos[i]["Cuenta"];
                        }
                        var currObj = cuentasBC[movimientos[i]["Cuenta"]];
                        currObj[0] += sInicial;
                        currObj[1] += movimientos[i]["Total_Cargos"];
                        currObj[2] += movimientos[i]["Total_Abonos"];
                        currObj[3] += movimientos[i]["Total_Saldo"];
                        setCuentasBC(cuentasBC[codigo] = currObj);
                        
                    }
                }
            }

            //Sumar activos circulantes
            for (let i = 0; i < categoriasEspeciales["000-0110"].length; i++) {
                let currObj = cuentasBC["000-0110"];
                currObj[0] += cuentasBC[categoriasEspeciales["000-0110"][i]][0];
                currObj[1] += cuentasBC[categoriasEspeciales["000-0110"][i]][1];
                currObj[2] += cuentasBC[categoriasEspeciales["000-0110"][i]][2];
                currObj[3] += cuentasBC[categoriasEspeciales["000-0110"][i]][3];
                setCuentasBC(cuentasBC["000-0110"] = currObj);
            }
            console.log(cuentasBC["000-0110"]);

            
            //Sumar activos fijos
            for (let i = 0; i < categoriasEspeciales["000-0120"].length; i++) {
                let currObj = cuentasBC["000-0120"];
                if (diccionarioCN[categoriasEspeciales["000-0120"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0120"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0120"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0120"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0120"][i]][3];
                    setCuentasBC(cuentasBC["000-0120"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0120"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0120"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0120"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0120"][i]][3];
                    setCuentasBC(cuentasBC["000-0120"] = currObj);
                }
            }
            console.log(cuentasBC["000-0120"]);

            //Sumar activos diferidos
            for (let i = 0; i < categoriasEspeciales["000-0140"].length; i++) {
                let currObj = cuentasBC["000-0140"];
                if (diccionarioCN[categoriasEspeciales["000-0140"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0140"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0140"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0140"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0140"][i]][3];
                    setCuentasBC(cuentasBC["000-0140"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0140"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0140"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0140"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0140"][i]][3];
                    setCuentasBC(cuentasBC["000-0140"] = currObj);
                }
            }
            console.log(cuentasBC["000-0140"]);

            //Sumar total activos
            for (let i = 0; i < categoriasGrandes["000-0100"].length; i++) {
                let currObj = cuentasBC["000-0100"];
                if (diccionarioCN[categoriasGrandes["000-0100"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0100"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0100"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0100"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0100"][i]][3];
                    setCuentasBC(cuentasBC["000-0100"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0100"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0100"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0100"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0100"][i]][3];
                    setCuentasBC(cuentasBC["000-0100"] = currObj);
                }
            }
            console.log(cuentasBC["000-0100"]);
            
            //Sumar pasivos circulantes
            for (let i = 0; i < categoriasEspeciales["000-0210"].length; i++) {
                let currObj = cuentasBC["000-0210"];
                if (diccionarioCN[categoriasEspeciales["000-0210"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0210"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0210"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0210"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0210"][i]][3];
                    setCuentasBC(cuentasBC["000-0210"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0210"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0210"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0210"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0210"][i]][3];
                    setCuentasBC(cuentasBC["000-0210"] = currObj);
                }
            }
            console.log(cuentasBC["000-0210"]);

            //Sumar pasivos fijos
            for (let i = 0; i < categoriasEspeciales["000-0220"].length; i++) {
                let currObj = cuentasBC["000-0220"];
                if (diccionarioCN[categoriasEspeciales["000-0220"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0220"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0220"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0220"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0220"][i]][3];
                    setCuentasBC(cuentasBC["000-0220"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0220"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0220"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0220"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0220"][i]][3];
                    setCuentasBC(cuentasBC["000-0220"] = currObj);
                }
            }
            console.log(cuentasBC["000-0220"]);

            //Sumar pasivos diferidos
            for (let i = 0; i < categoriasEspeciales["000-0230"].length; i++) {
                let currObj = cuentasBC["000-0230"];
                if (diccionarioCN[categoriasEspeciales["000-0230"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasEspeciales["000-0230"][i]][0];
                    currObj[1] -= cuentasBC[categoriasEspeciales["000-0230"][i]][1];
                    currObj[2] -= cuentasBC[categoriasEspeciales["000-0230"][i]][2];
                    currObj[3] -= cuentasBC[categoriasEspeciales["000-0230"][i]][3];
                    setCuentasBC(cuentasBC["000-0230"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasEspeciales["000-0230"][i]][0];
                    currObj[1] += cuentasBC[categoriasEspeciales["000-0230"][i]][1];
                    currObj[2] += cuentasBC[categoriasEspeciales["000-0230"][i]][2];
                    currObj[3] += cuentasBC[categoriasEspeciales["000-0230"][i]][3];
                    setCuentasBC(cuentasBC["000-0230"] = currObj);
                }
            }
            console.log(cuentasBC["000-0230"]);

            //Sumar total pasivos
            for (let i = 0; i < categoriasGrandes["000-0200"].length; i++) {
                let currObj = cuentasBC["000-0200"];
                if (diccionarioCN[categoriasGrandes["000-0200"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0200"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0200"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0200"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0200"][i]][3];
                    setCuentasBC(cuentasBC["000-0200"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0200"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0200"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0200"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0200"][i]][3];
                    setCuentasBC(cuentasBC["000-0200"] = currObj);
                }
            }
            console.log(cuentasBC["000-0200"]);

            //Sumar capital
            for (let i = 0; i < categoriasGrandes["000-0300"].length; i++) {
                let currObj = cuentasBC["000-0300"];
                if (diccionarioCN[categoriasGrandes["000-0300"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0300"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0300"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0300"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0300"][i]][3];
                    setCuentasBC(cuentasBC["000-0300"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0300"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0300"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0300"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0300"][i]][3];
                    setCuentasBC(cuentasBC["000-0300"] = currObj);
                }
            }
            console.log(cuentasBC["000-0300"]);

            //Sumar resultados acreedoras (ingresos)
            for (let i = 0; i < categoriasGrandes["000-0400"].length; i++) {
                let currObj = cuentasBC["000-0400"];
                if (diccionarioCN[categoriasGrandes["000-0400"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0400"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0400"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0400"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0400"][i]][3];
                    setCuentasBC(cuentasBC["000-0400"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0400"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0400"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0400"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0400"][i]][3];
                    setCuentasBC(cuentasBC["000-0400"] = currObj);
                }
            }
            console.log(cuentasBC["000-0400"]);

            console.log(subs);

            //Sumar resultados deudoras (egresos)
            for (let i = 0; i < categoriasGrandes["000-0500"].length; i++) {
                let currObj = cuentasBC["000-0500"];
                var currSObj = cuentasBC[categoriasGrandes["000-0500"][i]];
                if (categoriasGrandes["000-0500"][i] != "502-0000") {
                    for ( let j = 0; j<subs[categoriasGrandes["000-0500"][i]].length; j++) {
                        currSObj[0] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][0];
                        currSObj[1] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][1];
                        currSObj[2] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][2];
                        currSObj[3] += cuentasBC[subs[categoriasGrandes["000-0500"][i]][j]][3];
                        setCuentasBC(cuentasBC[categoriasGrandes["000-0500"][i]] = currSObj);
                    }
                }
                if (diccionarioCN[categoriasGrandes["000-0500"][i]].substring(0,12) == "Depreciación") {
                    currObj[0] -= cuentasBC[categoriasGrandes["000-0500"][i]][0];
                    currObj[1] -= cuentasBC[categoriasGrandes["000-0500"][i]][1];
                    currObj[2] -= cuentasBC[categoriasGrandes["000-0500"][i]][2];
                    currObj[3] -= cuentasBC[categoriasGrandes["000-0500"][i]][3];
                    setCuentasBC(cuentasBC["000-0500"] = currObj);
                } else {
                    currObj[0] += cuentasBC[categoriasGrandes["000-0500"][i]][0];
                    currObj[1] += cuentasBC[categoriasGrandes["000-0500"][i]][1];
                    currObj[2] += cuentasBC[categoriasGrandes["000-0500"][i]][2];
                    currObj[3] += cuentasBC[categoriasGrandes["000-0500"][i]][3];
                    setCuentasBC(cuentasBC["000-0500"] = currObj);
                }
            }
            console.log(cuentasBC["000-0500"]);

            //Asignar orden de cuentas del reporte:
            orden.push("000-0100");
            orden.push("000-0110");
            categoriasEspeciales["000-0110"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0110"].length; i++) {
                orden.push(categoriasEspeciales["000-0110"][i]);
                subs[categoriasEspeciales["000-0110"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0110"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0110"][i]][j]);
                }
            }
            orden.push("000-0120");
            categoriasEspeciales["000-0120"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0120"].length; i++) {
                orden.push(categoriasEspeciales["000-0120"][i]);
                subs[categoriasEspeciales["000-0120"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0120"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0120"][i]][j]);
                }
            }
            orden.push("000-0140");
            categoriasEspeciales["000-0140"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0140"].length; i++) {
                orden.push(categoriasEspeciales["000-0140"][i]);
                subs[categoriasEspeciales["000-0140"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0140"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0140"][i]][j]);
                }
            }
            orden.push("000-0200");
            categoriasEspeciales["000-0210"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0210"].length; i++) {
                orden.push(categoriasEspeciales["000-0210"][i]);
                subs[categoriasEspeciales["000-0210"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0210"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0210"][i]][j]);
                }
            }
            categoriasEspeciales["000-0220"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0220"].length; i++) {
                orden.push(categoriasEspeciales["000-0220"][i]);
                subs[categoriasEspeciales["000-0220"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0220"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0220"][i]][j]);
                }
            }
            categoriasEspeciales["000-0230"].sort();
            for (let i = 0; i < categoriasEspeciales["000-0230"].length; i++) {
                orden.push(categoriasEspeciales["000-0230"][i]);
                subs[categoriasEspeciales["000-0230"][i]].sort();
                for (let j = 0; j < subs[categoriasEspeciales["000-0230"][i]].length; j++) {
                    orden.push(subs[categoriasEspeciales["000-0230"][i]][j]);
                }
            }
            orden.push("000-0300");
            categoriasGrandes["000-0300"].sort();
            for (let i = 0; i < categoriasGrandes["000-0300"].length; i++) {
                orden.push(categoriasGrandes["000-0300"][i]);
            }
            orden.push("000-0400");
            categoriasGrandes["000-0400"].sort();
            for (let i = 0; i < categoriasGrandes["000-0400"].length; i++) {
                orden.push(categoriasGrandes["000-0400"][i]);
                subs[categoriasGrandes["000-0400"][i]].sort();
                for (let j = 0; j < subs[categoriasGrandes["000-0400"][i]].length; j++) {
                    orden.push(subs[categoriasGrandes["000-0400"][i]][j]);
                }
            }
            orden.push("000-0500");
            for (let i = 0; i < categoriasGrandes["000-0500"].length; i++) {
                orden.push(categoriasGrandes["000-0500"][i]);
                subs[categoriasGrandes["000-0500"][i]].sort();
                for (let j = 0; j < subs[categoriasGrandes["000-0500"][i]].length; j++) {
                    orden.push(subs[categoriasGrandes["000-0500"][i]][j]);
                }
            }
            console.log(orden);


            //Añadir HTML en base al orden
            var BCTable = document.getElementById("tablaBC");
            for (let i = 0; i<orden.length; i++) {
                var row = BCTable.insertRow(BCTable.rows.length);
                var cell0 = row.insertCell(0);
                var element = document.createElement("p");
                element.innerHTML = orden[i];
                cell0.appendChild(element);
                
                var cell1 = row.insertCell(1);
                element = document.createElement("p");
                element.innerHTML = diccionarioCN[orden[i]];
                cell1.appendChild(element);

                var cell2 = row.insertCell(2);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][0].toFixed(2);
                cell2.appendChild(element);

                var Acell3 = row.insertCell(3);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][1].toFixed(2);
                Acell3.appendChild(element);

                var cell4 = row.insertCell(4);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][2].toFixed(2);
                cell4.appendChild(element);

                var cell5 = row.insertCell(5);
                element = document.createElement("p");
                element.innerHTML = cuentasBC[orden[i]][3].toFixed(2);
                cell5.appendChild(element);
            }

          }));

    };

    var prev_result = null;
    var result = null;
    var valid = false;

    function mostrarAlerta() {
        // Obtener nombre de archivo
        let archivo = document.getElementById('excel-file').value,
        // Obtener extensión del archivo
            extension = archivo.substring(archivo.lastIndexOf('.'),archivo.length);
        // Si la extensión obtenida no está incluida en la lista de valores
        // del atributo "accept", mostrar un error.
        if(document.getElementById('excel-file').getAttribute('accept').split(',').indexOf(extension) < 0) {
            swal("Archivo inválido", "No se permite la extensión " + extension);
        }
        else {
            valid = true;
        }
    }

    function alertaPOST() {
        if (valid == true) {
            swal("Ya casi", "A continuación tus datos se mandaran a la DB");
            valid = false;
        } else {
            swal("Ingresa un archivo Excel(.xlsx)")
        }
    }
     
    async function validateMov(){
        const result = await axios.get("/validateMovimientosTEST");
        const status = result.status
        console.log("Pase por validateMov");
        console.log(status);

        if (status===200){
            Swal.fire(
                'Tu información se ha mandado a la DB :)',
                'success'
            )
            
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR:',
                text: 'Los datos no se enviaron :('
            })
        }
    }

    function handleClick(event){
        // evita el parpadeo predefinido
        event.preventDefault();
        const excelMov = document.getElementById("excel-file").files;
        console.log(excelMov);
        
        console.log("Pase por handleClick");
        validateMov()
    }

    let formData = new FormData();
    

    const onFileChange = async (e) => {
        console.log(e.target.files[0])
        console.log(document.querySelector('#excel-file').files[0])
        if (e.target && e.target.files[0]);
        formData.append('excel', e.target.files[0]);
        mostrarAlerta();
        prev_result = await axios.get("/validateMovimientosTEST");
        console.log(prev_result);
        prev_result = prev_result.data.submit_id;
        console.log("Prev Result: ", prev_result);
        //console.log({formData})
    } 

    const clickFunc = (event) => {
        setTimeout(validate_Mov, 3000);
    }

    const validate_Mov = async (event) => {
        result = await axios.get("/validateMovimientosTEST");
        console.log(result);
        result = result.data.submit_id;
        console.log("Result: ", result);

        if (prev_result + 1 === result){
            Swal.fire(
                'Tu información se ha mandado a la DB :)',
                'success'
            )
            
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR:',
                text: 'Los datos no se enviaron :('
            })
        }
        
    }

    const meses = [
        { label: 'Enero',       value: 'ene' },
        { label: 'Febrero',     value: 'feb'},
        { label: 'Marzo',       value: 'mar' },
        { label: 'Abril',       value: 'abr' },
        { label: 'Mayo',        value: 'may ' },
        { label: 'Junio',       value: 'jun' },
        { label: 'Julio',       value: 'jul' },
        { label: 'Agosto',      value: 'ago' },
        { label: 'Septiembre',  value: 'sep'},
        { label: 'Octubre',     value: 'oct' },
        { label: 'Noviembre',   value: 'nov'},
        { label: 'Diciembre',   value: 'dic'}
    ]

    const handleSelect_Mes_Rep1 = (event) => {
        Mes_Rep1 = event.value;
        console.log(Mes_Rep1);
    }

    const handleSelect_Mes_Rep2 = (event) => {
        Mes_Rep2 = event.value;
        console.log(Mes_Rep2);
    }
    
    const buscarFechasBG = () => {  
        console.log(Mes_Rep1);
        console.log(Mes_Rep2);

        axios.get(`/recibir_FechasDe_Movimientos/${Mes_Rep1}/${Mes_Rep2}`).then(resp => {
            const datos = resp.data;
            console.log(datos); 
            if (datos.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'No existen registros en la DB con la fecha especificada :('
                })
            }  
            for (let i=0; i< datos.length; i++) {
                console.log(datos[i]["Fecha"]);
            }     
        });        
    };

    function generatePDF() {
 
        var doc = new jsPDF();
   
        document.getElementById("result").removeAttribute('hidden')
        document.getElementById("result2").removeAttribute('hidden')
        
        /*
        doc.addHTML(document.getElementById("result"), function () {
            doc.save("output.pdf");
        });
        */
        
        doc.fromHTML(document.getElementById("result"),5,5)
        doc.fromHTML(document.getElementById("result2"),5,15)
        

        document.getElementById("result").setAttribute('hidden', 'true')
        document.getElementById("result2").setAttribute('hidden', 'true')

        doc.save("output.pdf");
        
    }

    return(
        
        
        
        <div className="container micontenedor">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
            <script src="https://parall.ax/parallax/js/jspdf.js"></script>

                <h1>Dashboard</h1>
                <div className="container">
                    <div className="row justify-content-around">
                        <div className="col">
                            <div className="row align-items-center">
                                <h1 className="text-center"> Registro de Archivos</h1>
                            {/*}
                            </div>
                            <div className="row justify-content-center">
                            */}
                                <div className="col-md-auto">
                                     <form action="/subirMovimientos" method="POST" enctype="multipart/form-data"> 
                                    
                                        <div className="form-group">
                                            <label for="excel">Movimientos Auxiliares del Catálogo</label>
                                            <input id="excel-file" accept=".xlsx" type="file" className="form-control" name="excel" onChange={onFileChange} required></input>
                                            <div className="row justify-content-center">
                                                <div className="col-md-auto">
                                                    {/* //onClick={clickFunc} */}
                                                    <button className="btn btn-dark btn-lg" type="submit" onClick={alertaPOST}>
                                                        Subir Excel (Movimientos Auxiliares del Catálogo) </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    <form action="/subirCatalogo" method="POST" encType="multipart/form-data">
                                        <div className="form-group">
                                            <label for="excel">Catálogo de Cuentas</label>
                                            <input type="file" className="form-control" name="excel" onChange={onFileChange} required></input>
                                            <div className="row justify-content-center">
                                                <div className="col-md-auto">
                                                    <button className="btn btn-dark btn-lg" type="submit" onClick={alertaPOST}>Subir Excel (Catálogo de Cuentas)</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    
                                </div>
                            </div>

                        </div>
                        <div className="col">
                            <div className="row justify-content-center">

                                    

                                <div className="col-md-auto">

                                    <div className="col-md-auto">
                                        <Select name="mes1" required 
                                            options = {meses}
                                            onChange = {handleSelect_Mes_Rep1}
                                        />
                                            
                                    </div>

                                    <div className="col-md-auto">
                                        <Select name="mes2" required 
                                            options = {meses}
                                            onChange = {handleSelect_Mes_Rep2}
                                        />
                                            
                                    </div>
                                  
                                    {/* <a href="#myModal" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => generarReporteBG()} >Generar Balance General</a> */}
                                    <a href="#myModal" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => generarReporteBG()} >Generar Balance General</a>

                                    
                                    

                                    
                                    
                                    {/*
                                    <div className="modal-footer">
                                        <Pdf targetRef={reference3} filename="R3.pdf">
                                            {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Balance de Comprobación"</button>}
                                        </Pdf>
                                    </div>
                                    */}

                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={generatePDF}>Descargar PDF "Balance General"</button>
                                    </div>

                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={generatePDF}>Descargar PDF "Balance General 2"</button>
                                    </div>

                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={generatePDF}>Descargar PDF "Balance General 3"</button>
                                    </div>

                                
                                    <div id="result" className="titulo-seccion" hidden >
                                        <h1>Hello World</h1>
                                        <h1>Hello World</h1>
                                    </div>
                                    <div id="result2" hidden style={{color: "red" }}>
                                        <h1>Hello World</h1>
                                    </div>
                                        
    


                                </div>
                                {/*
                                Modalidad generada al presionar el boton
                                */}

                                <div id="reference1" ref={reference1} >
                                    <div id="myModal" className="modal fade">
                                        <div className="modal-dialog modal-xl" role="document">
                                            <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLongTitle">Balance General</h5>
                                                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                                    </div>
                                                    <div className="modal-body">
                                                        <h1> Empresa 1</h1>
                                                        <section className ="flex-container">
                                                            
                                                            <div className="activos">
                                                                <h1 className="titulo-seccion"> Activos </h1>
                                                                <h2 className="subtitulo-seccion"> CIRCULANTE</h2>
                                                                <table id="tabla-activos-circulante">
                                                                    
                                                                </table>
                                                                <h2 className="subtitulo-seccion"> FIJO</h2>
                                                                <table id="tabla-activos-fijo">
                                                                    
                                                                </table>
                                                                <h2 className="subtitulo-seccion"> DIFERIDO</h2>
                                                                <table id="tabla-activos-diferido">
                                                                
                                                                </table>
                                                                
                                                            </div>
                                                            <div className="pasivos-capital">
                                                                <div className="pasivos">
                                                                    <h1 className="titulo-seccion"> Pasivos</h1>
                                                                    <h2 className="subtitulo-seccion">CIRCULANTE</h2>
                                                                    <table id="tabla-pasivos-circulante">
                                                                        
                                                                    </table>
                                                                    <h2 className="subtitulo-seccion"> FIJO</h2>
                                                                    <table id="tabla-pasivos-fijo">
                                                                        
                                                                    </table>
                                                                    <h2 className="subtitulo-seccion"> DIFERIDO</h2>
                                                                    <table id="tabla-pasivos-diferido">
                                                                        
                                                                    </table>
                                                                    <table id="tabla-suma-pasivos">

                                                                    </table>
                                                                </div>
                                                                <div className="capital">
                                                                    <h1 className="titulo-seccion">Capital</h1>
                                                                    <h2 className="subtitulo-seccion"> CAPITAL </h2>
                                                                    <table id="tabla-capital">
                                                                    
                                                                    </table>

                                                                    <table id="tabla-suma-capital">

                                                                    </table>
                                                                    
                                                            
                                                                </div>
                                                            </div>
                                                        </section>
                                                        <section className="flex-container">
                                                            <div className="sumas">
                                                                <table id="tabla-suma-activos">
                                                                    
                                                                </table>
                                                            </div>
                                                            <div className="sumas">
                                                                <table id="tabla-suma-pc">
                                                                    
                                                                </table>
                                                            </div>
                                                        </section>
                                                    </div>
                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                                    </div>

                                                    <div className="modal-footer">
                                                        <Pdf targetRef={reference1} filename="R1.pdf">
                                                            {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF TABLES<i class="far fa-file-pdf ml-1 text-white"></i></button>}
                                                        </Pdf>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ div>
                            
                            <div className="row justify-content-center">
                                <div className="col-md-auto">
                                <a href="#myModal1" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => generarReporteER()}>Generar Estado de Resultados</a>
                                
                                <div id="myModal1" ref={reference2} className="modal fade">
                                    
                                        <div className="modal-dialog modal-xl" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="exampleModalLongTitle">Estado de Resultados</h5>
                                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                                </div>
                                                <div className="modal-body">
                                                    <section className ="flex-container">
                                                        <table id="tablaER" className="table-responsive table-borderless">
                                                            <thead>
                                                                <th scope="col"></th>
                                                                <th className="tituloCentro" scope="col">Periodo</th>
                                                                <th className="tituloCentro" scope="col">%</th>
                                                                <th className="tituloCentro" scope="col">Acomulado</th>
                                                                <th className="tituloCentro" scope="col">%</th>
                                                            </thead>
                                                            <tbody>

                                                            </tbody>
                                                        </table>
                                                    </section>
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                                </div>
                                                <div className="modal-footer">
                                                    <Pdf targetRef={reference2} filename="R2.pdf">
                                                        {({ toPdf }) => <button className="btn btn-primary" onClick={toPdf}>Descargar PDF "Estado de Resultados"</button>}
                                                    </Pdf>
                                                </div>
                                            </div>
                                        </div>  
                                     
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-md-auto">
                                <a href="#myModal2" className="btn btn-dark btn-lg" data-bs-toggle="modal" role="button" onClick={() => generarReporteBC()}>Generar Balance de Comprobacion</a>
                                
                                <div id="myModal2" ref={reference3} className="modal fade">
                                    <div className="modal-dialog modal-xl" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLongTitle">Balance de Comprobación</h5>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div className="modal-body">
                                                <section className ="flex-container">
                                                    <table id="tablaBC" className="table-responsive table-borderless">
                                                        <thead>
                                                            <tr>
                                                            <th scope="col">C&nbsp;u&nbsp;e&nbsp;n&nbsp;t&nbsp;a</th>
                                                            <th scope="col">N&nbsp;o&nbsp;m&nbsp;b&nbsp;r&nbsp;e</th>
                                                            <th scope="col">Saldos Iniciales</th>
                                                            <th scope="col"></th>
                                                            <th scope="col"></th>
                                                            <th scope="col">Saldos Actuales</th>
                                                            </tr>
                                                            <tr>
                                                            <th scope="col"></th>
                                                            <th scope="col"></th>
                                                            <th scope="col">Deudor Acreedor</th>
                                                            <th scope="col">Cargos</th>
                                                            <th scope="col">Abonos</th>
                                                            <th scope="col">Deudor Acreedor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            
                                                        </tbody>
                                                    </table>
                                                </section>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>        
        </div>
    </div>
    );
}

export default Dashboard;