interface LoanRequest{
    id: number;
    status: string;
    borrowDate: string;
    description: string;
    user?: { username: string; nrp: string};
    room?: { name: string; location: string};
}

interface HistoryProps{
    bookings: LoanRequest[];
    role: string;
}

export default function History({ bookings, role} : HistoryProps) {
    const historyData = bookings.filter(
        (b) => b.status === "Completed" || b.status === "Rejected"
    );

    return(
        <section style={{ padding: "20px" }}>
            <h2>History Peminjaman</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px"}}>
                {historyData.length === 0 ? (
                    <p style={{ color: "gray", fontStyle: "italic" }}>Belum ada riwayat peminjaman</p>
                ) : (
                    historyData.map((item) => (
                        <div key={item.id} style={{
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            padding: "15px",
                            backgroundColor: "#f9f9f9",
                            color: "black"
                        }}>
                            <h4 style={{ margin: "0 0 10px 0", }}>{item.room?.name}</h4>
                            {role === "Admin" && (
                                <p style={{ fontSize: "13px", fontWeight: "bold"}}>Peminjam: {item.user?.username}</p>
                            )}
                            <p style={{ fontSize: "12px"}}>Tanggal: {new Date(item.borrowDate).toLocaleDateString('id-ID')}</p>
                            <p style={{ fontSize: "12px"}}>Keperluan: {item.description}</p>
                            <span style={{ 
                                backgroundColor: item.status === "Completed" ? "green" : "red",
                                color: "white",
                                padding: "2px 4px",
                                borderRadius: "5px"
                            }}>
                                {item.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}  