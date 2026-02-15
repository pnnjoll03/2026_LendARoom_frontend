import React, { useState, useEffect } from "react";

interface Room {
    id: number;
    name: string;
    status: string;
    capacity: number;
    location: string;
}

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
            roomId: selectedRoom?.id, // Menambahkan roomId agar backend tahu ruangan mana
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
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                <h1>Selamat datang, {user.username}!({user.role})</h1>
                <div style={{ display:"flex", justifyContent: "space-between", gap:"8px"}}>
                    {user.role === "Admin" && (
                        <div style={{ margin: "20px 0" }}>
                            <button style={{ backgroundColor: "green" }}>Tambah Ruangan</button>
                        </div>
                    )}
                    <div>
                        <button onClick={onLogout} style={{ backgroundColor: "red", color: "white", margin: "20px 0"}}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <section>
                <h2>Daftar Ruangan</h2>
                <div style={{ display: "flex", overflowX: "auto", gap: "15px", paddingBottom: "10px" }}>
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
                            <p style={{ color: room.status === "Tersedia" ? "green" : "red", fontWeight: "bold" }}>
                                {room.status}
                            </p>
                            { user.role === "Mahasiswa" && (
                                <button
                                    disabled={room.status !== "Tersedia"}
                                    onClick={() => setSelectedRoom(room)}>
                                    Booking Ruangan
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {selectedRoom && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
                    }}>
                        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "350px", color:"black"}}>
                            <h3 style={{ marginTop: 0 }}>
                                {editBookingId ? `Edit Booking: ${selectedRoom.name}` : `Form Booking: ${selectedRoom.name}`}
                            </h3>
                            
                            <form onSubmit={handleConfirmBooking}>
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Waktu Peminjaman</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} 
                                        value={borrowDate} 
                                        onChange={(e) => setBorrowDate(e.target.value)} 
                                    />
                                </div>
                                
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Keperluan</label>
                                    <textarea 
                                        required 
                                        placeholder="Contoh: Rapat Himpunan" 
                                        style={{ width: "100%", padding: "8px", boxSizing: "border-box", minHeight: "80px" }} 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="submit" style={{ flex: 1, backgroundColor: "#28a745", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                                        {editBookingId ? "Simpan Perubahan" : "Kirim Booking"}
                                    </button>
                                    <button type="button" onClick={resetForm} style={{ flex: 1, backgroundColor: "#dc3545", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>

            <hr style={{ margin: "30px 0" }} />

            <section>
                <h2>{user.role === "Admin" ? "Semua Permohonan Booking" : "Status Pemesanan Saya"}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                    {myBookings.length === 0 ? (
                        <p style={{ color: "gray", fontStyle: "italic", }}>{user.role === "Admin" ? "Belum ada yang melakukan booking" : "Anda belum melakukan booking"}</p>
                    ) : (
                        myBookings.map((booking) => (
                            <div key={booking.id} style={{
                                border: "2px solid #ddd",
                                borderRadius: "8px",
                                padding: "15px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                backgroundColor: "#fff"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between"}}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{booking.room?.name}</h4>
                                        {user.role === "Admin" && (
                                            <p style={{ fontSize: "13px", margin: "5px 0", fontWeight: "bold" }}>Peminjam: {booking.user?.username}({booking.user?.nrp})</p>
                                        )}
                                        <p style={{ fontSize: "12px", color: "#666 ", margin: "2px 0" }}>Tanggal: {new Date(booking.borrowDate).toLocaleDateString('id-ID')}</p>
                                        <p style={{ fontSize: "12px", margin: "2px 0" }}> Keperluan: {booking.description}</p>
                                    </div>
                                    <span style={{
                                        padding: "5px 10px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        backgroundColor: booking.status === "Pending" ? "orange" : booking.status === "Approved" ? "green" : "red",
                                        color: "white"
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>

                                { user.role === "Mahasiswa" && booking.status === "Pending" && (
                                    <div style={{ display: "flex", gap:"10px", borderTop:"1px solid #eee",paddingTop: "10px"}}>
                                        <button onClick={() => handleEditBookingRequest(booking)}
                                        style={{ flex: 1, backgroundColor:"orange", color:"white",paddingTop: "8px", borderRadius: "5px", border:"none", cursor: "pointer"}}>
                                            Edit
                                        </button>
                                    </div>
                                )}

                                { user.role === "Admin" && booking.status === "Pending" && (
                                    <div style={{ display: "flex", gap:"10px", borderTop:"1px solid #eee",paddingTop: "10px"}}>
                                        <button onClick={() => handleProcessBooking(booking.id, "approve")} 
                                            style={{ flex: 1, backgroundColor:"green", color:"white",paddingTop: "8px", borderRadius: "5px", border:"none", cursor: "pointer"}}>
                                            Terima
                                        </button>
                                        <button onClick={() => handleProcessBooking(booking.id, "reject")} 
                                            style={{ flex: 1, backgroundColor:"red", color:"white",paddingTop: "8px", borderRadius: "5px", border:"none", cursor: "pointer"}}>
                                            Tolak
                                        </button>
                                    </div>
                                )}

                                { user.role === "Mahasiswa" && booking.status === "Approved" && (
                                    <div style={{borderTop: "1px solid #eee", paddingTop: "10px"}}>
                                        <button onClick={() => handleCompleteBooking(booking.id)}
                                            style={{ backgroundColor:"green", color: "white", paddingTop: "8px", borderRadius: "5px", border: "none", cursor: "pointer"}}>
                                            Selesai
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}