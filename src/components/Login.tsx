import { useState } from "react";

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
                alert(`Selamat datang ${data.username}! Role anda adalah ${data.role}`);
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

    return (
        <div className="auth-card">
            <h2>Login LendARoom</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                <button type="submit">Login</button>
            </form>
            <p>Belum punya akun? <span onClick={onSwitch} style={{color: 'blue', cursor: 'pointer'}}>daftar di sini</span></p>
        </div>
    )
}