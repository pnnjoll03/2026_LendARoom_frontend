import { useState } from "react";

export interface Room{
    id: number;
    name: string;
    status: string;
    capacity: string;
    location: string;
}

interface RoomListProps{
    rooms: Room[];
    role: string;
    onRoomUpdate: () => void;
    onBookingClick: (room: Room) => void;
}

export default function RoomList({ rooms, role, onRoomUpdate, onBookingClick} : RoomListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", capacity: 0, location: ""});

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:5187/api/Room", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...newRoom, status: "Tersedia"})
            });

            if(response.ok){
                alert("Ruangan berhasil ditambahkan!");
                setIsAddModalOpen(false);
                setNewRoom({name: "", capacity: 0, location: ""});
                onRoomUpdate();
            }
        }catch(error){
            alert("Gagal menambahkan ruangan.");
        }
    }

    const handleDeleteRoom = async (id: number) => {
        if(!window.confirm("Apakah anda yakin ingin menghapus ruangan ini?")) return;
        try{
            const response = await fetch(`http://localhost:5187/api/Room/${id}`, {
                method: "DELETE"
            });

            if(response.ok){
                alert("Ruangan berhasil dihapus!");
                onRoomUpdate();
            }
        }catch(error){
            alert("Gagagl menghapus ruangan");
        }
    }

    return (
        <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h2>Daftar Ruangan</h2>
                {role === "Admin" && (
                    <button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: "orange", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", border: "none"}}>
                        Tambah Ruangan
                    </button>
                )}
            </div>

            <div>
                <div style={{ display: "flex", overflowX: "auto", gap: "15px", paddingBottom: "10px" }}>
                    {rooms.map((room) => (
                        <div key={room.id} style={{ minWidth: "250px", border: "1px solid #ccc", borderRadius: "10px", padding: "10px", backgroundColor: room.status === "Tersedia" ? "#e6fffa" : "#fff5f5", color: "black"}}>
                            <h3>{room.name}</h3>
                            <p>{room.location} | Kapasitas: {room.capacity}</p>
                            <p style={{ color: room.status === "Tersedia" ? "green" : "red", fontWeight: "bold" }}>{room.status}</p>

                            {role === "Mahawsiswa" && (
                                <button disabled={room.status !== "Tersedia"} onClick={() => onBookingClick(room)} style={{ width: "100%", padding: "8px", cursor: "pointer"}}>
                                    Booking Ruangan
                                </button>
                            )}

                            {role === "Admin" && (
                                <button onClick={() => handleDeleteRoom(room.id)} style={{ width: "100%", padding: "8px",backgroundColor: "red", color: "white", border: "none", borderRadius: "5px", marginTop: "5px", cursor: "pointer"}}>
                                    Hapus Ruangan
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {isAddModalOpen && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                        <h3>Tambah Ruangan</h3>
                        <form onSubmit={handleAddRoom}>
                            <input placeholder="Masukkan nama Ruangan" required style={{ width: "100%", marginBottom: "10px" }} onChange={e => setNewRoom({...newRoom, name: e.target.value})}/>
                            <input type="number" required style={{ width: "100%", marginBottom: "10px" }} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}/>
                            <input placeholder="Masukkan lokasi ruangan" required style={{ width: "100%", marginBottom: "10px" }} onChange={e => setNewRoom({...newRoom, location: e.target.value})}/>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: "green", color: "white" }}>Simpan</button>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </section>
    )
}