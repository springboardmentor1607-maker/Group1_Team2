import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { api } from '../lib/api';

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ lat, lng }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
}

function LocationMarker({ onLocationSelect, lat, lng }) {
    const [position, setPosition] = useState(null);

    // Sync state with props
    useEffect(() => {
        if (lat && lng) {
            setPosition({ lat, lng });
        }
    }, [lat, lng]);

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            if (onLocationSelect) {
                onLocationSelect(lat, lng);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

export default function MapSection({ onLocationSelect, showComplaints = true, lat, lng }) {
    const [center] = useState([10.8505, 76.2711]); // Default: Kerala
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        if (!showComplaints) return;
        const fetchMapData = async () => {
            try {
                const res = await api.get('/complaints');
                const data = res.data || [];
                setComplaints(data.filter(c => c.latitude && c.longitude));
            } catch (err) {
                console.error('Error fetching map data:', err);
            }
        };
        fetchMapData();
        
        const interval = setInterval(fetchMapData, 10000);
        return () => clearInterval(interval);
    }, [showComplaints]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card border-0 shadow-lg p-4 rounded-xl mb-4"
            style={{ height: '400px' }}
        >
            <h3 className="fs-5 fw-semibold text-body mb-4">Complaint Map View</h3>
            <div className="h-100 w-100 rounded overflow-hidden position-relative z-0">
                <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap lat={lat} lng={lng} />
                    {showComplaints && complaints.map(complaint => {
                        const cLat = parseFloat(complaint.latitude);
                        const cLng = parseFloat(complaint.longitude);
                        if (isNaN(cLat) || isNaN(cLng)) return null;

                        return (
                            <Marker key={complaint.id} position={[cLat, cLng]}>
                                <Popup>
                                    <div className="p-1">
                                        <h6 className="fw-bold mb-1">{complaint.title || 'Untitled'}</h6>
                                        <p className="small mb-1"><strong>Type:</strong> {complaint.type || 'Other'}</p>
                                        <p className="small mb-0"><strong>Status:</strong> {complaint.status || 'Pending'}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                    {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} lat={lat} lng={lng} />}
                </MapContainer>
            </div>
        </motion.div>
    );
}
