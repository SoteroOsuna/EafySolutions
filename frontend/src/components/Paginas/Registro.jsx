import React, {useState} from "react";
import axios from "axios";
const bcrypt = require('bcryptjs');

function Registro() {
    
    // declaración objeto inicial
    const[input, setInput] = useState ({
        nombre: "",
        email: "",
        contraseña: ""
    });
    
    // cambiar el valor por el que escribe el usuario
    function handleChange(event){
        const {name, value} = event.target;
        // guardar el valor previo.
        setInput(prevInput => {
            return {
                ...prevInput,
                [name]: value
            }
        });
    }

    // se activa cuando se oprime el botón
    function handleClick(event){
        // evita el parpadeo predefinido
        event.preventDefault();
        input.contraseña = bcrypt.hashSync(input.contraseña, 10);

        // crear objeto para pasar a servidor
        const nUsuario = {
            nombre: input.nombre,
            email: input.email,
            contraseña: input.contraseña
        }

        

        // pasar datos a servidor o bd.
        axios.post("/registrar", nUsuario);

    }





    return (
        <div className="container micontenedor">
            <h1>Registro</h1>
            <p>A continuación, puedes registrarte aquí!</p>

            <main className="form-signin">
                <form>


                    <div className="form-floating">
                        <input
                            onChange={handleChange}
                            name="nombre"
                            value={input.name}
                            type="text"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"/>
                        <label for="floatingInput">Nombre</label>
                    </div>

                    <div className="form-floating">
                        <input
                            onChange={handleChange}
                            name="email"
                            value={input.email}
                            type="email"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"/>
                        <label for="floatingInput">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            onChange={handleChange}
                            name="contraseña"
                            value={input.contraseña}
                            type="password"
                            className="form-control"
                            id="floatingPassword"
                            placeholder="Password"/>
                        <label for="floatingPassword">Password</label>
                    </div>

                    <button onClick={handleClick} className="w-100 btn btn-lg btn-primary" type="submit">Registrar</button>
                    <p className="mt-5 mb-3 text-muted">&copy; 2022 Eafy Solutions</p>
                </form>
            </main>

        </div>
    );
}

export default Registro;