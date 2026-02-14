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
    const [myBookings, setMyBookings] = useState<any[]>([]);
const fetchMyBookings = async () => {
    try{
        const url = user.role === "Admin" ? 
            "http://localhost:5187/api/LoanRequest" :
            `http://localhost:5187/api/LoanRequest/user/${user.username}`;
        const response = await fetch(url);
        const data = await response.json();
        setMyBookings(data);
    }catch(error){
        console.error("Gagal mengambil status booking: ", error);
    }
};
    useEffect(() => {
        fetchMyBookings();
    }, [user.role, user.username]);

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
                            backgroundColor: room.status === "Tersedia" ? "#e6fffa" : "#fff5f5",
                            color: "black"
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
                <h2>{user.role === "Admin" ? "Semua Permohonan Booking" : "Status Pemesanan Saya"}</h2>
                <div style={{ display: "grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap: "15px"}}>
                    {myBookings.length === 0 ? (
                        <p style={{color: "gray", fontStyle: "italic", }}>Anda belum melakukan booking</p>
                    ) : (
                        myBookings.map((booking) => (
                            <div key={booking.id} style={{
                                border: "2px solid #ddd",
                                borderRadius: "8px",
                                padding: "15px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#fff"
                            }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{booking.room?.name}</h4>
                                    {user.role === "Admin" && (
                                        <p style={{fontSize: "13px", margin:"5px 0", fontWeight: "bold"}}>Peminjam: {booking.user?.username}({booking.user?.nrp})</p>
                                    )}
                                    <p style={{ fontSize: "12px", color: "#666 ", margin: "2px 0"}}>Tanggal: {new Date(booking.borrowDate).toLocaleDateString('id-ID')}</p>
                                    <p style={{fontSize: "12px", margin: "2px 0"}}> Keperluan: {booking.description}</p>
                                </div>
                                <span style={{
                                    padding: "5px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    backgroundColor: booking.status === "Pending" ? "orange" : booking.status === "Approved" ? "green" : "red",
                                    color : "white"
                                }}>
                                    {booking.status}
                                </span>
                            </div>
                        ))
                    )
                }
                </div>
            </section>
        </div>
    )
}