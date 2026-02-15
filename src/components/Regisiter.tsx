import React, { useState } from "react";
import "../App.css";

interface RegisterProps{
    onSwitch: () => void;
}

export default function Register({onSwitch}: RegisterProps){
    const [form, setForm] = useState({
        username: "",
        password: "",
        nrp: "",
        class: ""
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5187/api/Auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if(response.ok){
            alert("Registrasi berhasil! Silakan Login.")
        }else{
            const error = await response.text();
            alert(error);
        }
    };

    return (
        <div className="auth-card">
            <h2>Daftar Akun Baru</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Username" onChange={(e) => setForm({...form, username: e.target.value})} required/>
                <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} required/>
                <input type="text" placeholder="NRP" onChange={(e) => setForm({...form, nrp: e.target.value})} required/>
                <input type="text" placeholder="Kelas" onChange={(e) => setForm({...form, class: e.target.value})} required/>
                <button type="submit">Daftar</button>
            </form>
            <p>Sudah punya akun?<span onClick={onSwitch} style={{ color: 'blue', cursor: 'pointer'}}>Login di sini</span></p>
        </div>
    )
}