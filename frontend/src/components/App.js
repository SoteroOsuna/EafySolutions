import React from "react";
// react router dom
import { BrowserRouter as Router } from "react-router-dom";
import Direccionamiento from "./Direccionamiento";
import Header from "./partials/Header";
import Footer from "./partials/Footer";


function App(){
    return (
        <Router>
            <div>
                <Header />
                    <Direccionamiento />
                <Footer />
            </div>
        </Router>
    );
}

export default App;