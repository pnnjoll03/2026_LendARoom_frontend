import { useState, useEffect } from "react";

interface Room {
    id: number;
    name: string;
    status: string;
    capacity: number;
    location: string;
}

interface userData{
    username: string;
    role: string;
}

interface DashboardProps{
    user: userData;
    onLogout: () => void;
}

export default function Dashboard({ user, onLogout} : DashboardProps){
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        fetch("http://localhost:5187/api/Room")
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch((err) => console.error("Gagal mengambil data room: ", err));
    }, []);

    return (
        <div className="dashboard-container" style={{padding: '20px'}}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
                <h1>Selamat datang, {user.username}!({user.role})</h1>
                <button onClick={onLogout} style={{backgroundColor: "red", color: "white"}}>
                    Logout
                </button>
            </header>

            {user.role === "Admin" && (
                <div style={{margin: "20px 0"}}>
                    <button style={{ backgroundColor: "orange" }}>Tambah Ruangan</button>
                </div>
            )} 

            <section>
                <h2>Daftar Ruangan</h2>
                <div style={{display: "flex", overflowX: "auto", gap: "15px", paddingBottom: "10px" }}>
                    {rooms.map((room) => (
                        <div key={room.id} style={{
                            minWidth: "250px",
                            border: "1px solid #ccc",
                            borderRadius: "10px",
                            padding: "10px",
                            backgroundColor: room.status === "Tersedia" ? "#e6fffa" : "#fff5f5"
                        }}>
                        
                            <h3>{room.name}</h3>
                            <p>{room.location}</p>
                            <p>Kapasita : {room.capacity} mahasiswa</p>
                            <p style={{color: room.status === "Tersedia" ? "green" : "red", fontWeight: "bold"}}>
                                {room.status}
                            </p>
                            <button disabled={room.status !== "Tersedia"}>Booking Ruangan</button>
                        </div>
                    ))}
                </div>
            </section>

            <hr style={{margin: "30px 0"}} />

            <section>
                <h2></h2>
            </section>
        </div>
    )
}