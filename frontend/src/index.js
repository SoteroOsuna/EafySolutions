import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App";
import { AuthProvider } from "./components/AuthProvider";

ReactDOM.render( 
    <AuthProvider>
        <App />
    </AuthProvider>,
document.getElementById('root')
);