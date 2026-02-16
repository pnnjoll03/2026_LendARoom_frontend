export interface LoanRequest {
    id: number;
    userId: number;
    roomId: number;
    requestDate: string;
    borrowDate: string;
    returnDate: string; // BARU
    description: string;
    status: string;
    user?: { username: string; nrp: string };
    room?: { name: string; location: string };
}

interface LoanRequestListProps {
    bookings: LoanRequest[];
    role: string;
    onRefresh: () => void;
    onEditClick: (booking: LoanRequest) => void;
}

export default function LoanRequestList({ bookings, role, onRefresh, onEditClick }: LoanRequestListProps) {
    const handleBookingProcess = async (id: number, action: "approve" | "reject") => {
        if (!window.confirm(`Apakah Anda yakin ingin ${action} booking ini?`)) return;
        const response = await fetch(`http://localhost:5187/api/LoanRequest/${id}/${action}`, {
            method: "PUT"
        });
        if (response.ok) onRefresh();
    };

    const handleCompleteBooking = async (id: number) => {
        if (!window.confirm("Selesaikan peminjaman ini?")) return;
        const response = await fetch(`http://localhost:5187/api/LoanRequest/${id}/completed`, {
            method: "PUT"
        });
        if (response.ok) onRefresh();
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <h2>{role === "Admin" ? "Semua Permohonan Booking" : "Status Pemesanan Saya"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                {(() => {
                    // Filter untuk menampilkan yang aktif (Pending atau Approved)
                    const activeBookings = bookings.filter((b) => b.status === "Pending" || b.status === "Approved");

                    if (activeBookings.length === 0) {
                        return <p style={{ color: "gray", fontStyle: "italic" }}>Tidak ada data booking aktif.</p>
                    }

                    return activeBookings.map((booking) => (
                        <div key={booking.id} style={{ border: "2px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff", color: "black" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{booking.room?.name}</h4>
                                    {role === "Admin" && (
                                        <p style={{ fontSize: "13px", margin: "5px 0", fontWeight: "bold" }}>Peminjam: {booking.user?.username}</p>
                                    )}
                                    <p style={{ fontSize: "11px", color: "#555", margin: "2px 0" }}>
                                        Mulai: {new Date(booking.borrowDate).toLocaleString('id-ID')}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "#555", margin: "2px 0" }}>
                                        Selesai: {new Date(booking.returnDate).toLocaleString('id-ID')}
                                    </p>
                                    <p style={{ fontSize: "12px", marginTop: "5px" }}>Keperluan: {booking.description}</p>
                                </div>
                                <span style={{ 
                                    padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", color: "white", height: "fit-content",
                                    backgroundColor: booking.status === "Pending" ? "orange" : booking.status === "Approved" ? "green" : "red" 
                                }}>{booking.status}</span>
                            </div>

                            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                {role === "Mahasiswa" && booking.status === "Pending" && (
                                    <button onClick={() => onEditClick(booking)} style={{ flex: 1, backgroundColor: "orange", color: "white", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}>Edit</button>
                                )}
                                
                                {role === "Admin" && booking.status === "Pending" && (
                                    <>
                                        <button onClick={() => handleBookingProcess(booking.id, "approve")} style={{ flex: 1, backgroundColor: "green", color: "white", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}>Terima</button>
                                        <button onClick={() => handleBookingProcess(booking.id, "reject")} style={{ flex: 1, backgroundColor: "red", color: "white", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}>Tolak</button>
                                    </>
                                )}

                                {role === "Mahasiswa" && booking.status === "Approved" && (
                                    <button onClick={() => handleCompleteBooking(booking.id)} style={{ width: "100%", backgroundColor: "green", color: "white", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}>Selesai Manual</button>
                                )}
                            </div>
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
}