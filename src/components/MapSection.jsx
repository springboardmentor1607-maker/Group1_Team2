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

export default function MapSection({ 
    onLocationSelect, 
    showComplaints = true, 
    lat, lng, 
    activeFilters,
    height = '400px',
    hideHeader = false
}) {
    const [center] = useState([10.8505, 76.2711]); // Default: Kerala
    const [complaints, setComplaints] = useState([]);

    // Custom Marker Icons
    const createIcon = (color) => new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const icons = {
        red: createIcon('red'),
        yellow: createIcon('gold'),
        green: createIcon('green'),
        blue: createIcon('blue')
    };

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

    // Apply filtering
    const filteredComplaints = complaints.filter(c => {
        if (!activeFilters) return true;
        const type = (c.type || '').toLowerCase();
        if (type.includes('garbage') && !activeFilters.garbage) return false;
        if ((type.includes('light') || type.includes('lamp')) && !activeFilters.streetlight) return false;
        if (type.includes('pothole') && !activeFilters.pothole) return false;
        return true;
    });

    const getMarkerIcon = (complaint) => {
        const status = (complaint.status || '').toLowerCase();
        const priority = (complaint.priority || '').toLowerCase();

        if (status === 'resolved') return icons.green;
        if (status === 'in progress' || status === 'in_progress' || priority === 'critical') return icons.red;
        return icons.yellow; // Default to pending/yellow
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`card border-0 shadow-lg p-0 rounded-4 overflow-hidden ${height === '100%' ? 'h-100' : ''}`}
            style={{ 
                background: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(10px)',
                height: height 
            }}
        >
            {!hideHeader && (
                <div className="card-header bg-transparent border-0 p-4 pb-0">
                    <h3 className="fs-5 fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                        <i className="bi bi-geo-alt-fill text-primary"></i>
                        Complaint Map View
                    </h3>
                </div>
            )}
            <div className={`card-body p-4 ${hideHeader ? 'h-100' : 'pt-3'}`} style={{ height: hideHeader ? '100%' : 'calc(100% - 60px)' }}>
                <div className="h-100 w-100 rounded-4 overflow-hidden position-relative z-0 border shadow-inner">
                    <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap lat={lat} lng={lng} />
                        {showComplaints && filteredComplaints.map(complaint => {
                            const cLat = parseFloat(complaint.latitude);
                            const cLng = parseFloat(complaint.longitude);
                            if (isNaN(cLat) || isNaN(cLng)) return null;

                            return (
                                <Marker 
                                    key={complaint.id} 
                                    position={[cLat, cLng]}
                                    icon={getMarkerIcon(complaint)}
                                >
                                    <Popup className="custom-popup">
                                        <div className="p-2" style={{ minWidth: '180px' }}>
                                            <h6 className="fw-bold mb-2 border-bottom pb-2">{complaint.title || 'Untitled'}</h6>
                                            <div className="d-flex flex-column gap-1">
                                                <p className="small mb-0 d-flex justify-content-between">
                                                    <span className="text-muted">Type:</span>
                                                    <span className="fw-medium">{complaint.type || 'Other'}</span>
                                                </p>
                                                <p className="small mb-0 d-flex justify-content-between">
                                                    <span className="text-muted">Status:</span>
                                                    <span className={`badge ${
                                                        complaint.status?.toLowerCase() === 'resolved' ? 'bg-success' :
                                                        (complaint.status?.toLowerCase().includes('progress') ? 'bg-danger' : 'bg-warning')
                                                    }`}>{complaint.status || 'Pending'}</span>
                                                </p>
                                                {complaint.priority && (
                                                    <p className="small mb-0 d-flex justify-content-between">
                                                        <span className="text-muted">Priority:</span>
                                                        <span className="fw-bold text-uppercase" style={{ fontSize: '10px' }}>{complaint.priority}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                        {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} lat={lat} lng={lng} />}
                    </MapContainer>
                </div>
            </div>
        </motion.div>
    );
}
