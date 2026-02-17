import { useState } from "react";
import "../App.css";

interface LoginProps {
    onSwitch: () => void;
    onLoginSuccess: (userData: any) => void;
}

export default function Login({ onSwitch, onLoginSuccess } : LoginProps ){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:5187/api/Auth/Login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password })
            });

            if(response.ok){
                const data = await response.json();
                alert(`Selamat datang ${data.username}!`);
                onLoginSuccess(data);
            }else{
                const errorMsg = await response.text();
                alert(errorMsg);
            }
        }catch(error){
            console.error("Login error: ", error);
            alert("Gagal menghubungi server.")
        }
    };

    const styles = {
        input: {
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ddd",
            fontSize: "16px",
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
            fontWeight: "bold"
        },
        link: {
            color: "green",
            cursor: "pointer",
            fontWeight: "bold",
            textDecoration: "underline"
        }
    }

    return (
        <div  style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f4f4f4", fontFamily: "Arial, sans-serif" }}>
            <div className="auth-card" style={{ backgroundColor: "white", padding: "40px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,1)", width: "100%", maxWidth: "380px", textAlign: "center" as const, borderTop: "10px solid green"}}>
                <h2 style={{ color: "green", marginBottom: "5px" }}>Login LendARoom</h2>
                <p style={{ color: "#666", marginBottom: "25px" }}>Silakan masuk ke akun anda</p>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} style={styles.input} required/>
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={styles.input} required/>
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                <p style={{color: "#666"}}>Belum punya akun? <span onClick={onSwitch} style={styles.link}>daftar di sini</span></p>
            </div>
        </div>
    )
}