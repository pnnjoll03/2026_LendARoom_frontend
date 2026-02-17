import React, { useState, useEffect } from "react";
import History, { type HistoryItem } from "./History"; 
import RoomList, { type Room } from "./RoomList";
import LoanRequestList, { type LoanRequest } from "./LoanRequestList";

interface userData {
    username: string;
    role: string;
    nrp: string;
}

interface DashboardProps {
    user: userData;
    onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [myBookings, setMyBookings] = useState<LoanRequest[]>([]);
    const [historyLogs, setHistoryLogs] = useState<HistoryItem[]>([]); 
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [borrowDate, setBorrowDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [description, setDescription] = useState("");
    const [editBookingId, setEditBookingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"home" | "history">("home");

    const fetchRoom = () => {
        fetch("http://localhost:5187/api/Room")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((err) => console.error("Gagal ambil data ruangan: ", err));
    };

    const fetchMyBookings = async () => {
        try {
            const url = user.role === "Admin" 
                ? "http://localhost:5187/api/LoanRequest" 
                : `http://localhost:5187/api/LoanRequest/user/${user.username}`;
            const response = await fetch(url);
            const data = await response.json();
            setMyBookings(data);
        } catch (error) {
            console.error("Gagal mengambil status booking: ", error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch("http://localhost:5187/api/LoanHistory");
            if(response.ok) {
                const data = await response.json();
                if (user.role !== "Admin") {
                    const filtered = data.filter((h: any) => h.name === user.username);
                    setHistoryLogs(filtered);
                } else {
                    setHistoryLogs(data);
                }
            }
        } catch (error) {
            console.error("Gagal mengambil history: ", error);
        }
    }

    const fetchAllData = () => {
        fetchRoom();
        fetchMyBookings();
        fetchHistory(); 
    };

    useEffect(() => {
        fetchAllData();
    }, [user.role, user.username]);

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editBookingId 
            ? `http://localhost:5187/api/LoanRequest/${editBookingId}/editloanrequest` 
            : "http://localhost:5187/api/LoanRequest/booking";
        const method = editBookingId ? "PUT" : "POST";
        const payload = editBookingId 
            ? { BorrowDate: borrowDate, ReturnDate: returnDate, Description: description } 
            : { Name: user.username, NRP: user.nrp, RoomId: selectedRoom?.id, BorrowDate: borrowDate, ReturnDate: returnDate, Description: description };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert(editBookingId ? "Berhasil diperbarui!" : "Berhasil diajukan!");
                resetForm();
                fetchAllData();
            } else {
                const err = await response.text();
                alert(err);
            }
        } catch (err) { alert("Koneksi error"); }
    };

    const resetForm = () => {
        setSelectedRoom(null);
        setEditBookingId(null);
        setBorrowDate("");
        setReturnDate(""); 
        setDescription("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", backgroundColor: "green", padding: "0 15px", color: "white" }}>
                <h1>LendARoom</h1>
                <button onClick={onLogout} style={{ backgroundColor: "red", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
            </header>

            <div style={{ display: "flex", flex: 1 }}>
                <aside style={{ width: "200px", display: "flex", flexDirection: "column", backgroundColor: "green" }}>
                    <button onClick={() => setActiveTab("home")} style={{ padding: "15px", textAlign: "left", backgroundColor: activeTab === "home" ? "white" : "transparent", color: activeTab === "home" ? "green" : "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>Home</button>
                    <button onClick={() => setActiveTab("history")} style={{ padding: "15px", textAlign: "left", backgroundColor: activeTab === "history" ? "white" : "transparent", color: activeTab === "history" ? "green" : "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>History</button>
                </aside>

                <main style={{ flex: 1, padding: "20px", backgroundColor: "white", color: "black", overflowY: "auto" }}>
                    {activeTab === "home" ? (
                        <>
                            <RoomList 
                                rooms={rooms} 
                                role={user.role} 
                                onRoomUpdate={fetchAllData} 
                                onBookingClick={(room) => setSelectedRoom(room)} 
                            />
                            <hr style={{ margin: "30px 0" }} />
                            <LoanRequestList 
                                bookings={myBookings} 
                                role={user.role} 
                                onRefresh={fetchAllData} 
                                onEditClick={(booking) => {
                                    setEditBookingId(booking.id);
                                    setSelectedRoom(booking.room as Room);
                                    setBorrowDate(booking.borrowDate.substring(0, 16));
                                    setReturnDate(booking.returnDate ? booking.returnDate.substring(0, 16) : "");
                                    setDescription(booking.description);
                                }}
                            />
                        </>
                    ) : (
                        <History bookings={historyLogs} role={user.role} onRefresh={fetchAllData} />
                    )}
                </main>
            </div>

            {selectedRoom && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "350px", color: "black" }}>
                        <h3>{editBookingId ? `Edit Booking` : `Booking ${selectedRoom.name}`}</h3>
                        <form onSubmit={handleConfirmBooking}>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ display: "block", fontWeight: "bold" }}>Waktu Mulai</label>
                                <input type="datetime-local" required style={{ width: "100%", padding: "8px" }} value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", fontWeight: "bold" }}>Waktu Selesai</label>
                                <input type="datetime-local" required style={{ width: "100%", padding: "8px" }} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontWeight: "bold" }}>Keperluan</label>
                                <textarea required style={{ width: "100%", padding: "8px" }} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: "#28a745", color: "white", padding: "10px", border: "none", borderRadius: "5px" }}>{editBookingId ? "Simpan" : "Kirim"}</button>
                                <button type="button" onClick={resetForm} style={{ flex: 1, backgroundColor: "#dc3545", color: "white", padding: "10px", border: "none", borderRadius: "5px" }}>Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}