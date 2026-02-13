import { useState, useEffect } from 'react'
import './App.css'

interface Room{
  id: number;
  name: string;
  status: string;
  capacity: number;
  location: string;
}

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = "http://localhost:5187/api/Room";

  useEffect(() => {
    const fetchRoom = async() => {
      try{
        const response = await fetch(API_URL);
        const data = await response.json();
        setRooms(data);
      }catch(error){
        console.error("Gagal mengambil data:", error);
      }finally{
        setLoading(false);
      }
    };

    fetchRoom();
  }, []);

  return (
    <>
      <div>
        <h1>Daftar Ruangan</h1>

        {loading ? (
          <p>Sedang memuat data...</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            { rooms.map((room) => (
              <div key={room.id} style={{ border: '1px solid #ccc', padding: '10px',borderRadius: '8px'}}>
                <h3>{ room.name }</h3>
                <p>{ room.location }</p>
                <p>Kapasitas: { room.capacity }</p>
                <p>Status:  
                  <span style={{ color: room.status === 'Tersedia' ? 'green' : 'red', fontWeight: 'bold'}}>
                    { room.status }
                  </span>
                </p>
              </div>
            ))}
          </div>
        )
      }
      </div>
    </>
  )
}

export default App
