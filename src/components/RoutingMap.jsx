import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const volunteerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const complaintIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length >= 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

const RoutingMap = ({ volunteerLoc, complaintLoc, complaintTitle }) => {
    if (!complaintLoc) return (
        <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '300px' }}>
            <p className="text-muted">Loading destination...</p>
        </div>
    );

    const positions = volunteerLoc ? [
        [volunteerLoc.lat, volunteerLoc.lng],
        [complaintLoc.lat, complaintLoc.lng]
    ] : [];

    const center = volunteerLoc ? [volunteerLoc.lat, volunteerLoc.lng] : [complaintLoc.lat, complaintLoc.lng];

    return (
        <div className="rounded-4 overflow-hidden shadow-sm border" style={{ height: '400px', width: '100%' }}>
            <MapContainer 
                center={center} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {volunteerLoc && (
                    <Marker position={[volunteerLoc.lat, volunteerLoc.lng]} icon={volunteerIcon}>
                        <Popup>
                            <div className="text-center">
                                <strong>Your Location</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <Marker position={[complaintLoc.lat, complaintLoc.lng]} icon={complaintIcon}>
                    <Popup>
                        <div className="p-1">
                            <strong>Complaint Location</strong>
                            <p className="small mb-0">{complaintTitle}</p>
                        </div>
                    </Popup>
                </Marker>

                {volunteerLoc && (
                    <Polyline 
                        positions={positions} 
                        color="var(--bs-primary, #0d6efd)" 
                        weight={4} 
                        opacity={0.7} 
                        dashArray="10, 10"
                    />
                )}
                
                <MapBounds points={positions.length > 0 ? positions : [center]} />
            </MapContainer>
        </div>
    );
};

export default RoutingMap;
