import React, {useState, useContext} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../AuthProvider";
const Swal = require('sweetalert2');


function Login(){
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    // declaración objeto inicial
    const[input, setInput] = useState ({
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

    async function validateUsuario(nUsuario){
        try{
        const result = await axios.post("/login", nUsuario);
        console.log(JSON.stringify(result));
        const email = result?.data?.email;
        const accessToken = result?.data?.accessToken;
        setAuth({ email, accessToken });
        navigate('/dashboard');
        }
        catch(err){
            if (!err?.response){
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'Sin respuesta del servidor'
                })
            }
            else if (err.response?.status===404){
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'El correo introducido no ha sido registrado'
                })
            }
            else if (err.response?.status===401){
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'Contraseña incorrecta'
                })
            }
            else{
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR:',
                    text: 'Ocurrio un error inesperado'
                })
            }
        }
    }

    // se activa cuando se oprime el botón
    function handleClick(event){
        // evita el parpadeo predefinido
        event.preventDefault();
        
        if (input.email === "" || input.contraseña === ""){
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia:',
                text: 'Complete ambos campos para continuar'
            })
            return;
        }

        const nUsuario = {
            email: input.email,
            contraseña: input.contraseña
        }

        validateUsuario(nUsuario)
        
    }

    
    
    return (
        <div className="container micontenedor">
            <h1>Login</h1>
            <p>A continuación, puedes iniciar sesión aquí!</p>

            <main className="form-signin">
                <form>
                    <div className="form-floating">
                        <input
                            onChange={handleChange}
                            name="email"
                            value={input.email}
                            type="email"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                            required />
                            
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
                            placeholder="Password"
                            required />
                        <label for="floatingPassword">Password</label>
                    </div>

                    <button onClick={handleClick} className="w-100 btn btn-lg btn-primary" type="submit">Login</button>
                    <p className="mt-5 mb-3 text-muted">&copy; 2022 Eafy Solutions</p>
                </form>
            </main>

        </div>
    );


}

export default Login;