import React, { useState, useEffect } from "react";
import History from "./History";
import RoomList from "./RoomList";
import type { Room } from "./RoomList";


interface userData {
    username: string;
    role: string;
    nrp: string;
}

interface DashboardProps {
    user: userData;
    onLogout: () => void;
}

interface LoanRequest {
    id: number;
    userId: number;
    roomId: number;
    requestDate: string;
    borrowDate: string;
    description: string;
    status: string;
    user?: { username: string; nrp: string };
    room?: { name: string; location: string };
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [myBookings, setMyBookings] = useState<LoanRequest[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [borrowDate, setBorrowDate] = useState("");
    const [description, setDescription] = useState("");
    const [editBookingId, setEditBookingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"home" | "history">("home");
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", capacity: 0, location: "" });
    
    const fetchRoom = () => {
        fetch("http://localhost:5187/api/Room")
            .then((response) => response.json())
            .then((data) => setRooms(data))
            .catch((error) => console.error("Gagal ambil data ruangan: ", error));
    };

    const fetchMyBookings = async () => {
        try {
            const url = user.role === "Admin" ?
                "http://localhost:5187/api/LoanRequest" :
                `http://localhost:5187/api/LoanRequest/user/${user.username}`;
            const response = await fetch(url);
            const data = await response.json();
            setMyBookings(data);
        } catch (error) {
            console.error("Gagal mengambil status booking: ", error);
        }
    };

    useEffect(() => {
        fetchRoom();
        fetchMyBookings();
    }, [user.role, user.username]);

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5187/api/Room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newRoom, status: "Tersedia" })
            });
            if (response.ok) {
                alert("Ruangan berhasil ditambahkan!");
                setIsAddRoomModalOpen(false);
                setNewRoom({ name: "", capacity: 0, location: "" });
                fetchRoom(); // Refresh list ruangan
            } else {
                const err = await response.text();
                alert("Gagal menambah ruangan: " + err);
            }
        } catch (error) {
            alert("Terjadi kesalahan koneksi.");
        }
    };

    const handleEditBookingRequest = (booking: LoanRequest) => {
        setEditBookingId(booking.id);
        setSelectedRoom(booking.room as Room);
        const formattedDate = booking.borrowDate.substring(0, 16);
        setBorrowDate(formattedDate);
        setDescription(booking.description);
    }

    const handleCompleteBooking = async (id: number) => {
        if(!window.confirm("Apakah peminjaman sudah selesai? Ruangan akan otomatis tersedia kembali.")) return;
        try{
            const response = await fetch(`http://localhost:5187/api/LoanRequest/${id}/completed`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"}
            });
            if(response.ok){
                alert("Peminjaman selesai! Terima kasih.");
                fetchMyBookings();
                fetchRoom();
            }else{
                const err = await response.text();
                alert("Gagal menyelesaikan: " + err);
            }
        }catch(error){
            console.error("Error completing booking:", error);
            alert("Terjadi kesalahan koneksi.")
        }
    };

    const handleProcessBooking = async (id: number, action: "approve" | "reject") => {
        const confirmMsg = action === "approve" ? "Setujui peminjaman ini?" : "Tolak peminjaman ini?";
        if( !window.confirm(confirmMsg)) return;
        try{
            const response = await fetch(`http://localhost:5187/api/LoanRequest/${id}/${action}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"}
            });
            if(response.ok){
                alert(`Berhasil ${action === "approve" ? "menyetujui" : "menolak"} booking!`);
                fetchMyBookings();
                fetchRoom();
            }else{
                const err =  await response.text();
                alert("Gagal memproses: " + err);
            }
        }catch(error){
            console.error("Error processing booking:", error);
            alert("Terjadi kesalahan koneksi.");
        }
    }

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            nrp: user.nrp,
            roomId: selectedRoom?.id,
            borrowDate: borrowDate,
            description: description
        };
        const url = editBookingId ? `http://localhost:5187/api/LoanRequest/booking/${editBookingId}` : "http://localhost:5187/api/LoanRequest/booking";
        const method = editBookingId ? "PUT" : "POST";
        try{
            const response = await fetch(url, {
                method: method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert(editBookingId ? "Booking berhasil diperbarui!" : "Booking berhasil diajukan!");
                resetForm();
                fetchMyBookings();
            } else {
                const error = await response.text();
                alert(error);
            }
        }catch(err){
            alert("Terjadi kesalahan koneksi.");
        }
    }

    const resetForm = () => {
        setSelectedRoom(null);
        setEditBookingId(null);
        setBorrowDate("");
        setDescription("");
    }

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", backgroundColor:"green", padding: "0 15px", color: "white"}}>
                <h1>Selamat datang, {user.username}!({user.role})</h1>
                <div style={{ display:"flex", justifyContent: "space-between", gap:"8px"}}>
                    {user.role === "Admin" && (
                        <div style={{ margin: "20px 0" }}>
                            <button 
                                onClick={() => setIsAddRoomModalOpen(true)}
                                style={{ backgroundColor: "orange", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                                Tambah Ruangan
                            </button>
                        </div>
                    )}
                    <div>
                        <button onClick={onLogout} style={{ backgroundColor: "red", color: "white", margin: "20px 0", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer"}}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            
            <div style={{ display: "flex", minHeight: "100vh", color: "black", backgroundColor: "white"}}>
                <aside style={{ width: "200px", padding: "20px 0", display: "flex", flexDirection: "column", gap: "10px", backgroundColor:"green" }}>
                    <button onClick={() => setActiveTab("home")} style={{ padding: "15px", textAlign: "left", backgroundColor: activeTab === "home" ? "white" : "transparent", color: activeTab === "home" ? "green" : "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>Home</button>
                    <button onClick={() => setActiveTab("history")} style={{ padding: "15px", textAlign: "left", backgroundColor: activeTab === "history" ? "white" : "transparent", color: activeTab === "history" ? "green" : "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>History</button>
                </aside>

                <main style={{ flex: "1" , overflow: "auto", marginLeft: "10px"}}>
                    {activeTab === "home" ? (
                        <section>
                            <RoomList
                                rooms={rooms}
                                role={user.role}
                                onRoomUpdate={fetchRoom}
                                onBookingClick={(room) => setSelectedRoom(room)}
                            />

                            <hr style={{ margin: "30px 0" }} />

                            <h2>{user.role === "Admin" ? "Semua Permohonan Booking" : "Status Pemesanan Saya"}</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                                {myBookings.length === 0 ? (
                                    <p style={{ color: "gray", fontStyle: "italic", }}>{user.role === "Admin" ? "Belum ada yang melakukan booking" : "Anda belum melakukan booking"}</p>
                                ) : (
                                    myBookings.map((booking) => (
                                        <div key={booking.id} style={{ border: "2px solid #ddd", borderRadius: "8px", padding: "15px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between"}}>
                                                <div>
                                                    <h4 style={{ margin: 0 }}>{booking.room?.name}</h4>
                                                    {user.role === "Admin" && (
                                                        <p style={{ fontSize: "13px", margin: "5px 0", fontWeight: "bold" }}>Peminjam: {booking.user?.username}({booking.user?.nrp})</p>
                                                    )}
                                                    <p style={{ fontSize: "12px", color: "#666 ", margin: "2px 0" }}>Tanggal: {new Date(booking.borrowDate).toLocaleDateString('id-ID')}</p>
                                                    <p style={{ fontSize: "12px", margin: "2px 0" }}> Keperluan: {booking.description}</p>
                                                </div>
                                                <span style={{ padding: "5px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", backgroundColor: booking.status === "Pending" ? "orange" : booking.status === "Approved" ? "green" : "red", color: "white", height: "fit-content" }}>{booking.status}</span>
                                            </div>
                                            { user.role === "Mahasiswa" && booking.status === "Pending" && (
                                                <button onClick={() => handleEditBookingRequest(booking)} style={{ backgroundColor:"orange", color:"white", padding: "8px", borderRadius: "5px", border:"none", cursor: "pointer"}}>Edit</button>
                                            )}
                                            { user.role === "Admin" && booking.status === "Pending" && (
                                                <div style={{ display: "flex", gap:"10px" }}>
                                                    <button onClick={() => handleProcessBooking(booking.id, "approve")} style={{ flex: 1, backgroundColor:"green", color:"white", padding: "8px", borderRadius: "5px", border:"none", cursor: "pointer"}}>Terima</button>
                                                    <button onClick={() => handleProcessBooking(booking.id, "reject")} style={{ flex: 1, backgroundColor:"red", color:"white", padding: "8px", borderRadius: "5px", border:"none", cursor: "pointer"}}>Tolak</button>
                                                </div>
                                            )}
                                            { user.role === "Mahasiswa" && booking.status === "Approved" && (
                                                <button onClick={() => handleCompleteBooking(booking.id)} style={{ width: "100%", backgroundColor:"green", color: "white", padding: "8px", borderRadius: "5px", border: "none", cursor: "pointer"}}>Selesai</button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    ) : (
                        <section>
                            <History bookings={myBookings} role={user.role} />
                        </section>
                    )}

                    {isAddRoomModalOpen && (
                        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "350px", color:"black"}}>
                                <h3 style={{ marginTop: 0 }}>Tambah Ruangan Baru</h3>
                                <form onSubmit={handleAddRoom}>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Nama Ruangan</label>
                                        <input type="text" required style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} value={newRoom.name} onChange={(e) => setNewRoom({...newRoom, name: e.target.value})} />
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Kapasitas</label>
                                        <input type="number" required style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} />
                                    </div>
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Lokasi / Gedung</label>
                                        <input type="text" required style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} value={newRoom.location} onChange={(e) => setNewRoom({...newRoom, location: e.target.value})} />
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button type="submit" style={{ flex: 1, backgroundColor: "#28a745", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Simpan</button>
                                        <button type="button" onClick={() => setIsAddRoomModalOpen(false)} style={{ flex: 1, backgroundColor: "#dc3545", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Batal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {selectedRoom && (
                        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "350px", color:"black"}}>
                                <h3 style={{ marginTop: 0 }}>{editBookingId ? `Edit Booking: ${selectedRoom.name}` : `Form Booking: ${selectedRoom.name}`}</h3>
                                <form onSubmit={handleConfirmBooking}>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Waktu Peminjaman</label>
                                        <input type="datetime-local" required style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} />
                                    </div>
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Keperluan</label>
                                        <textarea required placeholder="Contoh: Rapat Himpunan" style={{ width: "100%", padding: "8px", boxSizing: "border-box", minHeight: "80px" }} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button type="submit" style={{ flex: 1, backgroundColor: "#28a745", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>{editBookingId ? "Simpan Perubahan" : "Kirim Booking"}</button>
                                        <button type="button" onClick={resetForm} style={{ flex: 1, backgroundColor: "#dc3545", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Batal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}