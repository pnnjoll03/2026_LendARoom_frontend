import React, { useState } from "react";

export interface Room {
    id: number;
    name: string;
    status: string;
    capacity: number;
    location: string;
}

interface RoomListProps {
    rooms: Room[];
    role: string;
    onRoomUpdate: () => void; // Untuk refresh data setelah Add/Delete/Booking
    onBookingClick: (room: Room) => void; // Membuka modal booking di dashboard
}

export default function RoomList({ rooms, role, onRoomUpdate, onBookingClick }: RoomListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", capacity: 0, location: "" });

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5187/api/Room/AddRoom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Name: newRoom.name,
                    Capacity: newRoom.capacity,
                    Location: newRoom.location, 
                    Status: "Tersedia" 
                })
            });
            if (response.ok) {
                alert("Ruangan berhasil ditambahkan!");
                setIsAddModalOpen(false);
                setNewRoom({ name: "", capacity: 0, location: "" });
                onRoomUpdate();
            }
        } catch (err) { alert("Gagal menambah ruangan"); }
    };

    const handleDeleteRoom = async (id: number) => {
        if (!window.confirm("Hapus ruangan ini?")) return;
        try {
            const response = await fetch(`http://localhost:5187/api/Room/${id}`, { method: "DELETE" });
            if (response.ok) {
                alert("Ruangan dihapus");
                onRoomUpdate();
            }
        } catch (err) { alert("Gagal menghapus"); }
    };

    return (
        <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h2>Daftar Ruangan</h2>
                {role === "Admin" && (
                    <button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: "orange", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", border: "none" }}>
                        + Tambah Ruangan
                    </button>
                )}
            </div>

            <div style={{ display: "flex", overflowX: "auto", gap: "15px", paddingBottom: "10px" }}>
                {rooms.map((room) => (
                    <div key={room.id} style={{ minWidth: "250px", border: "1px solid #ccc", borderRadius: "10px", padding: "10px", backgroundColor: room.status === "Tersedia" ? "#e6fffa" : "#fff5f5", color: "black" }}>
                        <h3>{room.name}</h3>
                        <p>{room.location} | Kapasitas: {room.capacity}</p>
                        <p style={{ color: room.status === "Tersedia" ? "green" : "red", fontWeight: "bold" }}>{room.status}</p>
                        
                        {role === "Mahasiswa" && (
                            <button disabled={room.status !== "Tersedia"} onClick={() => onBookingClick(room)} style={{ width: "100%", padding: "8px", cursor: "pointer" }}>
                                Booking Ruangan
                            </button>
                        )}

                        {role === "Admin" && (
                            <button onClick={() => handleDeleteRoom(room.id)} style={{ width: "100%", padding: "8px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px", marginTop: "5px", cursor: "pointer" }}>
                                Hapus Ruangan
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal Add Room */}
            {isAddModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "300px", color: "black" }}>
                        <h3>Tambah Ruangan</h3>
                        <form onSubmit={handleAddRoom}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>Nama Ruangan</label>
                                <input placeholder="Nama" required style={{ width: "100%", marginBottom: "10px" }} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>Kapasitas</label>
                                <input type="number" required style={{ width: "100%", marginBottom: "10px" }} onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>Lokasi</label>
                                <input placeholder="Lokasi" required style={{ width: "100%", marginBottom: "10px" }} onChange={e => setNewRoom({ ...newRoom, location: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: "green", color: "white" }}>Simpan</button>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}