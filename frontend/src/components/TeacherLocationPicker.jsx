import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { MapPin, Navigation, Search, CheckCircle, AlertCircle, Compass, Loader2 } from 'lucide-react';

// Custom Teacher Marker Icon
const teacherIcon = L.divIcon({
  html: `<div class="w-10 h-10 rounded-full bg-[#f97316] border-4 border-white flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"><span class="text-base">🎓</span></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Map Recenter Helper Component
const RecenterOnCoords = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.setView([coords[1], coords[0]], 15);
    }
  }, [coords, map]);
  return null;
};

// Map Click to Place/Move Marker
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lng, e.latlng.lat]);
    }
  });
  return null;
};

const TeacherLocationPicker = ({
  initialCoordinates = null,
  initialAddress = null,
  onLocationChange,
  title = "Teaching Location on Map",
  subtitle = "Pinpoint where you conduct offline tuitions or your teaching center"
}) => {
  // Coordinates in GeoJSON format: [longitude, latitude]
  const [coords, setCoords] = useState(() => {
    if (initialCoordinates && Array.isArray(initialCoordinates) && initialCoordinates.length === 2 && !isNaN(initialCoordinates[0]) && !isNaN(initialCoordinates[1])) {
      return initialCoordinates;
    }
    return null;
  });

  const [addressDetails, setAddressDetails] = useState(() => {
    if (typeof initialAddress === 'object' && initialAddress !== null) {
      return initialAddress;
    }
    return {
      area: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      formattedAddress: typeof initialAddress === 'string' ? initialAddress : ''
    };
  });

  const [status, setStatus] = useState('idle'); // 'detecting', 'success', 'denied', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const markerRef = useRef(null);

  // Auto-detect browser geolocation on mount if no initial coordinates are given
  useEffect(() => {
    if (!coords) {
      detectBrowserLocation();
    } else {
      // Reverse geocode existing coordinates if address is not populated
      if (!addressDetails.formattedAddress) {
        reverseGeocode(coords[0], coords[1]);
      }
    }
  }, []);

  // Browser Geolocation Acquisition
  const detectBrowserLocation = () => {
    setStatus('detecting');
    setStatusMessage('Requesting GPS location access from your device...');

    if (!navigator.geolocation) {
      setStatus('denied');
      setStatusMessage('Geolocation is not supported by your browser. Please search or click on the map.');
      // Safe default: Center on Dhanbad / Jharkhand hotspot
      handleFallbackCoordinates();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        const newCoords = [lng, lat];
        setCoords(newCoords);
        setStatus('success');
        setStatusMessage('Device location detected! Drag the marker if your teaching location is different.');
        await reverseGeocode(lng, lat);
      },
      (error) => {
        console.warn('Browser geolocation failed:', error.message);
        setStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setStatusMessage('Location permission denied. Please click on the map or search your town to place the pin.');
        } else if (error.code === error.TIMEOUT) {
          setStatusMessage('Location request timed out. Please click on the map or search manually.');
        } else {
          setStatusMessage('Location unavailable. Please click on the map or search your town.');
        }
        handleFallbackCoordinates();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleFallbackCoordinates = () => {
    if (!coords) {
      // Default center: Dhanbad, Jharkhand (GuruConnect home region)
      const fallbackLng = 86.4304;
      const fallbackLat = 23.7957;
      setCoords([fallbackLng, fallbackLat]);
      reverseGeocode(fallbackLng, fallbackLat);
    }
  };

  // Reverse Geocode [lng, lat] to readable address components
  const reverseGeocode = async (lng, lat) => {
    setIsGeocoding(true);
    try {
      const { data } = await axios.get(`/api/teachers/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (data && data.address) {
        const addr = data.address;
        const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.county || 'Teaching Area';
        const city = addr.city || addr.town || addr.district || 'Dhanbad';
        const district = addr.county || addr.state_district || '';
        const state = addr.state || 'Jharkhand';
        const pincode = addr.postcode || '';
        const formatted = data.display_name || `${area}, ${city}, ${state} ${pincode}`.trim();

        const updated = {
          area,
          city,
          district,
          state,
          pincode,
          formattedAddress: formatted
        };

        setAddressDetails(updated);
        notifyParent(coords || [lng, lat], updated, false);
      } else {
        const simple = {
          area: 'Teaching Area',
          city: 'Dhanbad',
          district: '',
          state: 'Jharkhand',
          pincode: '',
          formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        };
        setAddressDetails(simple);
        notifyParent(coords || [lng, lat], simple, false);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err.message);
      const fallbackAddr = {
        area: 'Teaching Area',
        city: 'Dhanbad',
        district: '',
        state: 'Jharkhand',
        pincode: '',
        formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      };
      setAddressDetails(fallbackAddr);
      notifyParent(coords || [lng, lat], fallbackAddr, false);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Notify parent component of location updates
  const notifyParent = (newCoords, newAddr, confirmed) => {
    if (onLocationChange) {
      onLocationChange({
        coordinates: newCoords, // [longitude, latitude]
        longitude: newCoords[0],
        latitude: newCoords[1],
        address: newAddr,
        teachingArea: newAddr.area,
        city: newAddr.city,
        state: newAddr.state,
        district: newAddr.district,
        pincode: newAddr.pincode,
        formattedAddress: newAddr.formattedAddress,
        isConfirmed: confirmed
      });
    }
  };

  // Handle marker drag end
  const handleMarkerDragEnd = async () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latlng = marker.getLatLng();
      const newCoords = [latlng.lng, latlng.lat];
      setCoords(newCoords);
      setIsConfirmed(false);
      await reverseGeocode(latlng.lng, latlng.lat);
    }
  };

  // Handle map click
  const handleMapClick = async (newCoords) => {
    setCoords(newCoords);
    setIsConfirmed(false);
    await reverseGeocode(newCoords[0], newCoords[1]);
  };

  // Autocomplete place search
  const handleSearchInput = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);
    try {
      const { data } = await axios.get(`/api/teachers/geocode/search?q=${encodeURIComponent(query)}`);
      setSearchSuggestions(data || []);
    } catch (err) {
      console.error('Search places failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionSelect = async (place) => {
    const lng = parseFloat(place.lon);
    const lat = parseFloat(place.lat);
    const newCoords = [lng, lat];
    setCoords(newCoords);
    setIsConfirmed(false);
    setShowSuggestions(false);
    setSearchQuery('');

    const addr = place.address || {};
    const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.county || 'Teaching Area';
    const city = addr.city || addr.town || addr.district || 'Dhanbad';
    const district = addr.county || addr.state_district || '';
    const state = addr.state || 'Jharkhand';
    const pincode = addr.postcode || '';
    const formatted = place.display_name || `${area}, ${city}, ${state} ${pincode}`.trim();

    const newAddressObj = {
      area,
      city,
      district,
      state,
      pincode,
      formattedAddress: formatted
    };

    setAddressDetails(newAddressObj);
    notifyParent(newCoords, newAddressObj, false);
  };

  // User explicitly clicks "Confirm Location"
  const handleConfirmLocation = () => {
    if (!coords) return;
    setIsConfirmed(true);
    notifyParent(coords, addressDetails, true);
  };

  // Event handlers for marker dragging
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        handleMarkerDragEnd();
      }
    }),
    []
  );

  return (
    <div className="space-y-4">
      {/* Component Title & Instruction */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <MapPin size={16} className="text-[#f97316]" />
            <span>{title}</span>
          </label>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>
        </div>

        {/* Re-detect GPS Button */}
        <button
          type="button"
          onClick={detectBrowserLocation}
          disabled={status === 'detecting'}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-brand-100"
          title="Detect GPS Coordinates"
        >
          {status === 'detecting' ? (
            <Loader2 size={13} className="animate-spin text-brand-600" />
          ) : (
            <Navigation size={13} className="text-brand-600" />
          )}
          <span>{status === 'detecting' ? 'Detecting GPS...' : 'Detect Device GPS'}</span>
        </button>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl flex items-start space-x-2 text-xs font-semibold ${
            status === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
              : status === 'denied'
              ? 'bg-amber-50 text-amber-800 border border-amber-100'
              : 'bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
          ) : status === 'denied' ? (
            <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <Compass size={15} className="text-brand-500 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{statusMessage}</span>
        </div>
      )}

      {/* Location Search Bar for fast rural/town pinpointing */}
      <div className="relative">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            {isSearching ? <Loader2 size={16} className="animate-spin text-brand-500" /> : <Search size={16} />}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => { if (searchSuggestions.length > 0) setShowSuggestions(true); }}
            placeholder="Search village, town, or area (e.g. Dhanbad, Kamardih, Topchanchi)..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs font-semibold text-slate-800 shadow-xs"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
            {searchSuggestions.map((item, idx) => (
              <div
                key={item.place_id || idx}
                onClick={() => handleSuggestionSelect(item)}
                className="p-3 text-left hover:bg-brand-50/60 cursor-pointer transition-colors"
              >
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.display_name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Lat: {parseFloat(item.lat).toFixed(4)}, Lng: {parseFloat(item.lon).toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Interactive Map Container */}
      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
        {coords && coords.length === 2 ? (
          <MapContainer
            center={[coords[1], coords[0]]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[coords[1], coords[0]]}
              icon={teacherIcon}
              draggable={true}
              eventHandlers={eventHandlers}
              ref={markerRef}
            >
              <Popup>
                <div className="p-2 text-center font-sans space-y-1">
                  <p className="font-extrabold text-[#f97316] text-xs">Teaching Location 🎓</p>
                  <p className="text-[10px] text-slate-600 line-clamp-2">{addressDetails.formattedAddress || 'Drag to relocate pin'}</p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    [{coords[0].toFixed(4)}, {coords[1].toFixed(4)}]
                  </p>
                </div>
              </Popup>
            </Marker>

            <RecenterOnCoords coords={coords} />
            <MapClickHandler onLocationSelect={handleMapClick} />
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold">
            <Loader2 className="animate-spin text-brand-500 mr-2" size={16} />
            Initializing map...
          </div>
        )}

        {/* Tip overlay on bottom */}
        <div className="absolute bottom-2 left-2 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg pointer-events-none shadow">
          💡 Drag pin or click anywhere on the map to relocate
        </div>
      </div>

      {/* Address Confirmation & Readable Summary */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Resolved Teaching Address:
            </span>
            <p className="text-xs font-extrabold text-slate-800">
              {isGeocoding ? (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Loader2 size={12} className="animate-spin text-brand-500" />
                  Resolving reverse geocode...
                </span>
              ) : (
                addressDetails.formattedAddress || 'Address will appear after selecting location'
              )}
            </p>
            {coords && (
              <p className="text-[10px] font-mono text-slate-500">
                Coordinates: Longitude {coords[0].toFixed(5)}, Latitude {coords[1].toFixed(5)}
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!coords}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer shrink-0 ${
              isConfirmed
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white active:scale-95'
            }`}
          >
            <CheckCircle size={14} />
            <span>{isConfirmed ? 'Location Confirmed ✓' : 'Confirm Location'}</span>
          </button>
        </div>

        {isConfirmed && (
          <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50/80 border border-emerald-100 p-2 rounded-xl">
            ✓ Your teaching location is confirmed! This location will be saved in your profile and used for 2km student discovery.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeacherLocationPicker;
