import React, { useState } from "react";

export interface HistoryItem {
    id: number;
    status: string;
    borrowDate: string;
    returnDate: string; 
    description: string;
    name: string;      
    roomName: string;  
}

interface HistoryProps {
    bookings: HistoryItem[];
    role: string;
    onRefresh: () => void;
}

export default function History({ bookings, role, onRefresh }: HistoryProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    
    const [editForm, setEditForm] = useState({ 
        borrowDate: "", 
        returnDate: "",
        description: "", 
        status: "" 
    });
    
    const [searchItem, setSearchItem] = useState("");

    const historyData = bookings.filter((b) => {
        const matchSearch = role === "Admin"
            ? b.name.toLowerCase().includes(searchItem.toLowerCase())
            : b.roomName.toLowerCase().includes(searchItem.toLowerCase());
            
        return matchSearch;
    });

    const handleDelete = async (id: number) => {
        if(!window.confirm("Hapus history ini permanen?")) return;
        const response = await fetch(`http://localhost:5187/api/LoanHistory/${id}`, {
            method: "DELETE"
        });

        if(response.ok){
            onRefresh();
        } else {
            alert("Gagal menghapus. Pastikan ID history valid.");
        }
    };

    const handleEditClick = (item: HistoryItem) => {
        setSelectedItem(item);
        setEditForm({
            borrowDate: item.borrowDate.split('T')[0],
            returnDate: item.returnDate.split('T')[0],
            description: item.description,
            status: item.status
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedItem) return;

        // Endpoint sudah benar
        const response = await fetch(`http://localhost:5187/api/LoanHistory/${selectedItem.id}/editloanhistory`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                BorrowDate: editForm.borrowDate,
                ReturnDate: editForm.returnDate,
                Description: editForm.description,
                Status: editForm.status
            })
        });

        if(response.ok){
            setIsEditModalOpen(false);
            onRefresh();
        } else {
            alert("Gagal update history.");
        }
    };

    return (
        <section style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>History Peminjaman (Arsip)</h2>
                <input 
                    type="text"
                    placeholder={role === "Admin" ? "Cari nama peminjam..." : "Cari ruangan..."}
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "20px", border: "1px solid #ccc", width: "250px" }}
                />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                {historyData.length === 0 ? (
                    <p style={{ color: "gray" }}>Belum ada data history.</p>
                ) : (
                    historyData.map((item) => (
                        <div key={item.id} style={{ border: "1px solid #eee", padding: "15px", borderRadius: "8px", backgroundColor: "#f9f9f9", color: "black" }}>
                            <h4 style={{ margin: "0 0 10px 0" }}>{item.roomName}</h4>
                            
                            {role === "Admin" && <p style={{ fontWeight: "bold" }}>Peminjam: {item.name}</p>}
                            
                            <p style={{ fontSize: "12px" }}>Pinjam: {new Date(item.borrowDate).toLocaleDateString()}</p>
                            <p style={{ fontSize: "12px" }}>Kembali: {new Date(item.returnDate).toLocaleDateString()}</p>
                            <p style={{ fontSize: "12px" }}>Ket: {item.description}</p>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                <span style={{ backgroundColor: item.status === "Completed" ? "green" : "red", color: "white", padding: "2px 8px", borderRadius: "5px", fontSize: "11px" }}>
                                    {item.status}
                                </span>
                                
                                {role === "Admin" && (
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <button onClick={() => handleEditClick(item)} style={{ cursor: "pointer", border: "none", backgroundColor: "#ffc107", padding: "4px 8px", borderRadius: "4px" }}>Edit</button>
                                        <button onClick={() => handleDelete(item.id)} style={{ cursor: "pointer", border: "none", backgroundColor: "#dc3545", color: "white", padding: "4px 8px", borderRadius: "4px" }}>Hapus</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isEditModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <form onSubmit={handleSaveEdit} style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "300px", color: "black" }}>
                        <h3>Edit History</h3>
                        
                        <label>Tgl Pinjam:</label>
                        <input type="date" value={editForm.borrowDate} onChange={(e) => setEditForm({ ...editForm, borrowDate: e.target.value })} style={{ width: "100%", marginBottom: "10px" }} />

                        <label>Tgl Kembali:</label>
                        <input type="date" value={editForm.returnDate} onChange={(e) => setEditForm({ ...editForm, returnDate: e.target.value })} style={{ width: "100%", marginBottom: "10px" }} />
                        
                        <label>Deskripsi:</label>
                        <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={{ width: "100%", marginBottom: "10px" }} />

                        <label>Status:</label>
                        <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ width: "100%", marginBottom: "15px" }}>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button type="submit" style={{ flex: 1, backgroundColor: "green", color: "white", border: "none", padding: "8px", borderRadius: "4px" }}>Simpan</button>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, border: "1px solid #ccc", padding: "8px", borderRadius: "4px" }}>Batal</button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}