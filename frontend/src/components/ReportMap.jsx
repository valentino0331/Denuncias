import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick, mode }) {
    useMapEvents({
        click: (e) => {
            if (mode) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
}

const ReportMap = ({ points, exactLocation, onAddPoint, onSetExactLocation, mode, centerCoords }) => {
    const mapRef = useRef();


    const defaultCenter = centerCoords || [-5.1945, -80.6328]; //coords Piura
    const [center] = useState(defaultCenter);

    const handleMapClick = (latlng) => {

        if (mode === 'points' && points.length < 3) {
            onAddPoint({ lat: latlng.lat, lng: latlng.lng, id: Date.now() });
        } else if (mode === 'exact') {
            onSetExactLocation({ lat: latlng.lat, lng: latlng.lng });
        }
    };


    const createNumberedIcon = (number) => {
        return L.divIcon({
            html: `<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${number}</div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });
    };

    const exactLocationIcon = L.divIcon({
        html: '<div style="background-color: #10b981; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    return (
        <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onMapClick={handleMapClick} mode={mode} />


                {points.map((point, idx) => (

                    (point && point.lat !== undefined && point.lng !== undefined) && (
                        <React.Fragment key={point.id}>
                            <Marker
                                position={[point.lat, point.lng]}
                                icon={createNumberedIcon(idx + 1)}
                            >
                                <Popup>Punto {idx + 1} del área de riesgo</Popup>
                            </Marker>
                            <Circle
                                center={[point.lat, point.lng]}
                                radius={50} // 50 metros
                                pathOptions={{
                                    color: '#ef4444',
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.2
                                }}
                            />
                        </React.Fragment>
                    )
                ))}

                {points.length === 3 && (
                    <Polygon
                        positions={points.map(p => [p.lat, p.lng])}
                        pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.4,
                            weight: 2
                        }}
                    />
                )}


                {exactLocation && exactLocation.lat !== undefined && exactLocation.lng !== undefined && (
                    <Marker
                        position={[exactLocation.lat, exactLocation.lng]}
                        icon={exactLocationIcon}
                    >
                        <Popup>Ubicación exacta del incidente</Popup>
                    </Marker>
                )}
            </MapContainer>

            <div className="absolute top-4 left-4 bg-white/95 px-4 py-3 rounded-lg shadow-lg text-sm max-w-xs z-[1000]">
                {mode === 'points' && (
                    <p className="text-gray-700">
                        <span className="font-semibold">📍 Modo: Área de Riesgo</span>
                        <br />
                        Haz clic en el mapa para marcar hasta 3 puntos ({points.length}/3)
                    </p>
                )}
                {mode === 'exact' && (
                    <p className="text-gray-700">
                        <span className="font-semibold">🎯 Modo: Ubicación Exacta</span>
                        <br />
                        Haz clic en el mapa para marcar la ubicación exacta del incidente
                    </p>
                )}
                {!mode && (
                    <p className="text-gray-700">
                        Selecciona una opción para marcar en el mapa
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReportMap;