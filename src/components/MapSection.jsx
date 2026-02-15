import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapSection() {
    const [position, setPosition] = useState([51.505, -0.09]); // Default: London (Placeholder)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card shadow-lg border p-3 p-sm-4 p-lg-5 mb-4 mb-sm-5"
            style={{ height: '300px' }}
        >
            <h3 className="card-title fs-6 fs-sm-5 fw-semibold mb-3 mb-sm-4">Complaint Map View</h3>
            <div className="h-100 w-100 rounded overflow-hidden position-relative" style={{ zIndex: 0 }}>
                <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            A sample complaint location. <br /> Type: Pothole.
                        </Popup>
                    </Marker>
                    <Marker position={[51.51, -0.1]}>
                        <Popup>
                            Another complaint. <br /> Type: Garbage.
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </motion.div>
    );
}
