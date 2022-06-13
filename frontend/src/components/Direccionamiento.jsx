import React from "react";
// react router dom
import { Routes, Route } from "react-router-dom";
// paginas
import Home from "./Paginas/Home";
import Registro from "./Paginas/Registro";
import Dashboard from "./Paginas/Dashboard";
import Login from "./Paginas/Login";
import RequireAuth from "./RequireAuth";

function Direccionamiento(){
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/*
            <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            */}
        </Routes>
    );   
}


export default Direccionamiento;