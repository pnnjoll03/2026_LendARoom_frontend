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

    const styles = {
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f4f4f4",
            fontFamily: "Arial, sans-serif"
        },
        card: {
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center" as const,
            borderTop: "10px solid green"
        },
        input: {
            width: "100%",
            padding: "12px",
            margin: "8px 0",
            borderRadius: "5px",
            border: "1px solid #ddd",
            fontSize: "15px",
            boxSizing: "border-box" as const
        },
        button: {
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "green",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
        },
        link: {
            color: "green",
            cursor: "pointer",
            fontWeight: "bold",
            textDecoration: "underline"
        }
    };

    return (
        <div style={styles.container}>
            <div className="auth-card" style={styles.card}>
                <h2 style={{ color: "green", marginBottom: "5px" }}>Daftar Akun Baru</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>Lengkapi data dibawah ini</p>
                <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Username" onChange={(e) => setForm({...form, username: e.target.value})} style={styles.input} required/>
                    <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} style={styles.input} required/>
                    <input type="text" placeholder="NRP" onChange={(e) => setForm({...form, nrp: e.target.value})} style={styles.input} required/>
                    <input type="text" placeholder="Kelas" onChange={(e) => setForm({...form, class: e.target.value})} style={styles.input} required/>
                    <button type="submit" style={styles.button}>Daftar</button>
                </form>
                <p>Sudah punya akun?<span onClick={onSwitch} style={styles.link}>Login di sini</span></p>
            </div>
        </div>
    )
}