import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Component to handle map events
function MapEvents() {
    const map = useMap();
    
    useEffect(() => {
        // Force map to invalidate size after mount
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [map]);
    
    return null;
}

export default function MapSection() {
    const [position, setPosition] = useState([51.505, -0.09]); // Default: London
    const [isLoading, setIsLoading] = useState(true);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        // Simulate map loading and force rerender
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Force map to reinitialize after a short delay
            setTimeout(() => {
                setMapKey(prev => prev + 1);
            }, 100);
        }, 600);
        
        return () => clearTimeout(timer);
    }, []);

    // Force map resize on component mount
    useEffect(() => {
        if (!isLoading) {
            const resizeTimer = setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 200);
            return () => clearTimeout(resizeTimer);
        }
    }, [isLoading]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card shadow-lg border p-0 mb-0 bg-card h-100"
            style={{ minHeight: '400px' }}
        >
            <div className="card-header bg-transparent border-0 p-4 pb-2">
                <div className="d-flex align-items-center justify-content-between">
                    <h3 className="card-title fs-5 fw-semibold mb-0" style={{ color: 'var(--bs-body-color)' }}>
                        Complaint Map View
                    </h3>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary">
                            <i className="fas fa-filter"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                            <i className="fas fa-search-location"></i>
                        </button>
                    </div>
                </div>
                <p className="text-muted small mb-0 mt-1">Real-time visualization of complaint locations</p>
            </div>
            <div className="card-body p-4 pt-2 h-100">
                {isLoading ? (
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading map...</span>
                            </div>
                            <p className="text-muted">Loading map data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-100 w-100 rounded overflow-hidden position-relative" style={{ minHeight: '320px' }}>
                        <MapContainer 
                            key={mapKey}
                            center={position} 
                            zoom={13} 
                            scrollWheelZoom={false}
                            zoomControl={true}
                            doubleClickZoom={false}
                            closePopupOnClick={false}
                            dragging={true}
                            trackResize={true}
                            touchZoom={true}
                            style={{ 
                                height: '100%', 
                                width: '100%', 
                                minHeight: '320px',
                                borderRadius: '0.5rem',
                                backgroundColor: '#f8f9fa'
                            }}
                            className="leaflet-container"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                maxZoom={19}
                            />
                            <MapEvents />
                            <Marker position={position}>
                                <Popup>
                                    <div><strong>Road Maintenance</strong><br />Type: Pothole<br />Status: Reported</div>
                                </Popup>
                            </Marker>
                            <Marker position={[51.51, -0.1]}>
                                <Popup>
                                    <div><strong>Waste Management</strong><br />Type: Garbage Collection<br />Status: In Progress</div>
                                </Popup>
                            </Marker>
                            <Marker position={[51.515, -0.072]}>
                                <Popup>
                                    <div><strong>Street Lighting</strong><br />Type: Broken Street Light<br />Status: Resolved</div>
                                </Popup>
                            </Marker>
                            <Marker position={[51.495, -0.105]}>
                                <Popup>
                                    <div><strong>Water Issues</strong><br />Type: Pipe Leak<br />Status: Under Review</div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
