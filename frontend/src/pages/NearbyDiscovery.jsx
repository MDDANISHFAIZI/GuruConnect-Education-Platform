import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MapPin, Search, SlidersHorizontal, BookOpen, Clock, Phone, Navigation, AlertCircle, X, Sparkles, Send, Map, Loader2, Compass } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';

// Custom Leaflet DivIcons to prevent broken bundling assets
const userIcon = L.divIcon({
  html: `<div class="w-10 h-10 rounded-full bg-[#1d4ed8] border-4 border-white flex items-center justify-center text-white shadow-xl animate-pulse"><span class="text-lg">📍</span></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const teacherIcon = L.divIcon({
  html: `<div class="w-10 h-10 rounded-full bg-[#f97316] border-4 border-white flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"><span class="text-base">🎓</span></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Map helper to center screen on coordinates
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

// Map click event listener
const MapClickListener = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lng, e.latlng.lat]);
    }
  });
  return null;
};

const NearbyDiscovery = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  
  // Coordinate states
  const [coords, setCoords] = useState(null); // [lng, lat]
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [stateName, setStateName] = useState('');
  const [postcode, setPostcode] = useState('');
  
  // UI Location states
  const [addressName, setAddressName] = useState('Detecting location...');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [geoError, setGeoError] = useState(null);

  // Search autocomplete modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  // Search and Filter states
  const [subject, setSubject] = useState('');
  const [locationQuery, setLocationQuery] = useState(''); // Text search for village/area name
  const [classQuery, setClassQuery] = useState('');
  const [mode, setMode] = useState('');
  const [feeMax, setFeeMax] = useState(2000);
  const [maxDistance, setMaxDistance] = useState(2000); // meters

  // Data states
  const [teachers, setTeachers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState(false); // Notify me success
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredTeacherId, setHoveredTeacherId] = useState(null);

  // Run auto-locate or read passed state on mount
  useEffect(() => {
    if (routeLocation.state) {
      const { coordinates, addressName, areaName, locationQuery } = routeLocation.state;
      if (coordinates) {
        setCoords(coordinates);
        setLongitude(coordinates[0]);
        setLatitude(coordinates[1]);
        setAddressName(addressName || 'Selected Location');
        setAreaName(areaName || '');
        setLoadingLocation(false);
      } else if (locationQuery) {
        setLocationQuery(locationQuery);
        setAddressName(addressName || `Search: "${locationQuery}"`);
        setAreaName(locationQuery);
        setLoadingLocation(false);
      } else {
        detectLocation();
      }
    } else {
      detectLocation();
    }
  }, [routeLocation]);

  // Fetch whenever coordinates, locationQuery or criteria change
  useEffect(() => {
    if (coords || locationQuery) {
      fetchTeachers();
    }
  }, [coords, locationQuery, maxDistance, mode]);

  // Reverse Geocoding via Backend Proxy
  const reverseGeocode = async (lng, lat) => {
    setLoadingLocation(true);
    setGeoError(null);
    try {
      const { data } = await axios.get(`/api/teachers/geocode/reverse?lat=${lat}&lng=${lng}`);
      
      if (data && data.address) {
        const addr = data.address;
        
        // Comprehensive fallback priority: suburb, neighbourhood, village, town, city, county
        const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.city_district || addr.county || 'Detected Area';
        const state = addr.state || '';
        const code = addr.postcode || '';

        setAreaName(area);
        setStateName(state);
        setPostcode(code);
        
        const formatted = code ? `${area}, ${state} (${code})` : (state ? `${area}, ${state}` : area);
        setAddressName(formatted);
      } else {
        setAddressName(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        setAreaName('Unable to detect your area');
        setStateName('');
        setPostcode('');
      }
    } catch (err) {
      console.error('Reverse Geocoding Error:', err);
      setAddressName('Unable to detect your area');
      setAreaName('Unable to detect your area');
      setStateName('');
      setPostcode('');
    } finally {
      setLoadingLocation(false);
    }
  };

  // High Accuracy Location acquisition
  const detectLocation = () => {
    setLoadingLocation(true);
    setGeoError(null);
    setAddressName('Acquiring fresh coordinates...');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      const fallbackLng = 77.2090;
      const fallbackLat = 28.6139;
      setCoords([fallbackLng, fallbackLat]);
      setLatitude(fallbackLat);
      setLongitude(fallbackLng);
      setAddressName('Delhi (Fallback)');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude: lng, latitude: lat } = position.coords;
        setCoords([lng, lat]);
        setLatitude(lat);
        setLongitude(lng);
        await reverseGeocode(lng, lat);
      },
      (error) => {
        console.warn('Geolocation access failed or timed out:', error);
        setGeoError('Please allow location access or select location manually.');
        const fallbackLng = 77.2090;
        const fallbackLat = 28.6139;
        setCoords([fallbackLng, fallbackLat]);
        setLatitude(fallbackLat);
        setLongitude(fallbackLng);
        setAddressName('Delhi (Fallback)');
        setLoadingLocation(false);
      },
      // IMPORTANT: Geolocation system configured for maximum real-time accuracy and fresh queries
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Autocomplete search using Backend Proxy
  const handleLocationSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length < 3) {
      setSearchSuggestions([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const { data } = await axios.get(`/api/teachers/geocode/search?q=${encodeURIComponent(val)}`);
      setSearchSuggestions(data || []);
    } catch (err) {
      console.error('Location Autocomplete Search failed:', err);
    } finally {
      setSearchingPlaces(false);
    }
  };

  // Triggered when user selects a Nominatim search match
  const handleSuggestionSelect = (item) => {
    const lng = parseFloat(item.lon);
    const lat = parseFloat(item.lat);
    
    setCoords([lng, lat]);
    setLongitude(lng);
    setLatitude(lat);

    const addr = item.address || {};
    const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.city_district || addr.county || 'Selected Area';
    const state = addr.state || '';
    const code = addr.postcode || '';

    setAreaName(area);
    setStateName(state);
    setPostcode(code);

    const formatted = code ? `${area}, ${state} (${code})` : (state ? `${area}, ${state}` : area);
    setAddressName(formatted);

    // Close and reset modal parameters
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  const fetchTeachers = async () => {
    if (!coords && !locationQuery) return;
    setLoadingData(true);
    try {
      const payload = {
        maxDistance,
        subject,
        classQuery,
        mode,
        feeMax,
        locationQuery
      };
      if (coords) {
        payload.longitude = coords[0];
        payload.latitude = coords[1];
      }
      const response = await axios.post('/api/teachers/nearby', payload);
      setTeachers(response.data.teachers || []);
      setWaitlistStatus(false);
    } catch (err) {
      console.error('Error fetching nearby teachers:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleWaitlistSubmit = async () => {
    if (!coords) return;
    try {
      await axios.post('/api/teachers/notify-area', {
        longitude: coords[0],
        latitude: coords[1],
        address: addressName
      });
      setWaitlistStatus(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualMapClick = async (newCoords) => {
    setCoords(newCoords);
    setLongitude(newCoords[0]);
    setLatitude(newCoords[1]);
    await reverseGeocode(newCoords[0], newCoords[1]);
  };

  // Role determinations
  const isStudentRole = !user || user.role === 'student';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans relative">
      
      {/* Autocomplete Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-outfit font-black text-slate-800 text-lg flex items-center gap-1.5">
                <Compass className="text-[#f97316] animate-pulse" size={20} />
                <span>Search Location Manually</span>
              </h3>
              <button 
                onClick={() => { setShowSearchModal(false); setSearchSuggestions([]); setSearchQuery(''); }}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleLocationSearch}
                  placeholder="Enter village, neighborhood, town, or city name (e.g. Dhanbad, Bhagalpur)..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                />
              </div>

              {/* Suggestions results List */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {searchingPlaces ? (
                  <div className="flex justify-center items-center py-8 text-slate-400 space-x-2 text-xs font-semibold">
                    <Loader2 size={16} className="animate-spin text-brand-500" />
                    <span>Searching matching hotspots...</span>
                  </div>
                ) : searchSuggestions.length === 0 ? (
                  searchQuery.length >= 3 && (
                    <div className="text-center py-8 text-xs font-bold text-slate-400">
                      No matching areas found in India. Check spelling.
                    </div>
                  )
                ) : (
                  searchSuggestions.map((item) => {
                    const area = item.address.suburb || item.address.neighbourhood || item.address.village || item.address.town || item.address.city || item.address.county || 'Area';
                    const state = item.address.state || '';
                    const code = item.address.postcode || '';
                    return (
                      <button
                        key={item.place_id}
                        onClick={() => handleSuggestionSelect(item)}
                        className="w-full text-left p-3.5 hover:bg-slate-50/80 rounded-2xl border border-slate-100/60 hover:border-brand-100 flex items-start space-x-3 transition-all cursor-pointer"
                      >
                        <span className="text-lg mt-0.5">📍</span>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-sm">{area}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                            {item.display_name} {code && `[PIN: ${code}]`}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 text-center text-[10px] font-bold text-slate-400 border-t border-slate-100">
              ⚡ Powered by OpenStreetMap Nominatim Engine
            </div>
          </div>
        </div>
      )}

      {/* Geolocation Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-[#f97316]">गुरुकनेक्ट</span>
            <span>{t('discovery.title')}</span>
          </h1>

          {/* Premium geocoding location badge */}
          <div className="flex items-center space-x-2 text-slate-600 font-bold text-sm mt-2 bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100/60 px-4 py-2.5 rounded-full inline-flex shadow-sm">
            {loadingLocation ? (
              <Loader2 size={16} className="text-[#f97316] animate-spin" />
            ) : (
              <MapPin size={16} className="text-[#f97316]" />
            )}
            <span className="font-outfit text-brand-700">
              {loadingLocation ? 'Fetching coordinates...' : addressName}
            </span>
            <button 
              onClick={() => setShowSearchModal(true)}
              className="text-xs text-[#f97316] hover:text-orange-600 font-black ml-2 underline cursor-pointer hover:scale-105 transition-all"
            >
              [Change]
            </button>
          </div>
        </div>

        <button
          onClick={detectLocation}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-2xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 text-sm cursor-pointer"
        >
          <Navigation size={15} className={loadingLocation ? 'animate-spin' : ''} />
          <span>Detect GPS Location</span>
        </button>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Subject Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTeachers()}
              placeholder={t('discovery.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
            />
          </div>

          {/* Text Location Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <MapPin size={18} className="text-[#f97316]" />
            </span>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTeachers()}
              placeholder={i18n.language === 'hi' ? 'गाँव या क्षेत्र का नाम दर्ज करें (उदा. Topchanchi, Dhanbad)' : 'Enter Village or Area Name (e.g. Topchanchi, Dhanbad)'}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            <button
              onClick={fetchTeachers}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters details */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-slide-down">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.filterClass')}</label>
              <select
                value={classQuery}
                onChange={(e) => setClassQuery(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
              >
                <option value="">All Classes</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.filterMode')}</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
              >
                <option value="">{t('discovery.modeOptions.all')}</option>
                <option value="offline">Offline Only</option>
                <option value="online">Online Only</option>
                <option value="both">Offline & Online</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 flex justify-between">
                <span>{t('discovery.filterFee')}</span>
                <span className="text-brand-600 font-extrabold">₹{feeMax}</span>
              </label>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={feeMax}
                onChange={(e) => setFeeMax(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 flex justify-between">
                <span>{t('discovery.filterDistance')}</span>
                <span className="text-brand-600 font-extrabold">{(maxDistance / 1000).toFixed(1)} km</span>
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Geolocation Warning alert */}
      {geoError && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-2xl flex items-start space-x-2 text-sm font-semibold mb-6">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Split screen content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px] items-stretch">
        
        {/* Leaflet Map (Left Column - Always Visible) */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative h-[300px] lg:h-full min-h-[300px]">
          {coords && (
            <MapContainer
              center={[coords[1], coords[0]]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={[coords[1], coords[0]]} icon={userIcon}>
                <Popup>
                  <div className="p-3 text-center">
                    <p className="font-bold text-brand-600 text-sm">Your Location 🏠</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{addressName}</p>
                  </div>
                </Popup>
              </Marker>

              {teachers.map((teacher) => (
                <Marker
                  key={teacher._id}
                  position={[teacher.location.coordinates[1], teacher.location.coordinates[0]]}
                  icon={teacherIcon}
                  eventHandlers={{
                    click: () => setHoveredTeacherId(teacher._id)
                  }}
                >
                  <Popup>
                    <div className="p-3 font-sans space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-outfit font-black text-[#1e293b] text-base leading-tight">
                          {teacher.user.name}
                        </h4>
                        {teacher.isVerified && <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded-md">🛡️</span>}
                      </div>
                      
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{teacher.subjects.slice(0, 2).join(', ')}</p>
                      
                      <div className="flex items-center space-x-1.5">
                        <StarRating rating={teacher.rating} size={12} />
                        <span className="text-[10px] text-slate-500 font-bold">({teacher.reviewCount})</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-bold">
                        <span className="text-brand-600">₹{teacher.fees}/mo</span>
                        <span className="text-emerald-600">{(teacher.distance / 1000).toFixed(1)} km</span>
                      </div>
                      
                      <Link
                        to={`/teacher-profile/${teacher._id}`}
                        className="block text-center w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] py-1.5 rounded-lg mt-2 shadow transition-all"
                      >
                        View Full Profile
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <MapRecenter center={[coords[1], coords[0]]} />
              <MapClickListener onMapClick={handleManualMapClick} />
            </MapContainer>
          )}

          <div className="absolute bottom-3 left-3 z-10 glass-card px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 shadow pointer-events-none">
            💡 Tip: Click anywhere on the map to pin another village or town location.
          </div>
        </div>

        {/* Right Column: Dynamic Loader, Cards List, or Role-Based Empty States */}
        <div className="lg:col-span-5 overflow-y-auto pr-1 h-[300px] lg:h-full space-y-4">
          
          {loadingData ? (
            <div className="space-y-4">
              <div className="shimmer rounded-3xl h-36"></div>
              <div className="shimmer rounded-3xl h-36"></div>
              <div className="shimmer rounded-3xl h-36"></div>
            </div>
          ) : teachers.length === 0 ? (
            
            /* DYNAMIC ROLE-BASED EMPTY STATES ("AREA NOT AVAILABLE") */
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col justify-center space-y-6 relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-24 h-24 bg-brand-50 rounded-full blur-2xl opacity-60"></div>
              
              <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full text-xs font-bold text-red-600 w-fit">
                <Sparkles size={13} className="text-[#f97316]" />
                <span>Hotspot Region demand logged</span>
              </div>

              {isStudentRole ? (
                /* STUDENT / GUEST EMPTY STATE */
                <div className="space-y-5 relative z-10">
                  <h2 className="font-outfit font-black text-2xl md:text-3xl text-slate-900 leading-tight">
                    {i18n.language === 'hi' ? 'हम जल्द ही आपके क्षेत्र में उपलब्ध होंगे!' : 'No teachers available nearby yet'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                    GuruConnect is currently expanding village-by-village. Tap "Notify Me" to register your request, click adjacent villages on the map to search elsewhere, or click [Change] above to manually select a different city or town.
                  </p>
                  
                  {waitlistStatus ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-extrabold">
                      ✅ {t('emptyState.successNotify')}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button
                        onClick={handleWaitlistSubmit}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-outfit font-extrabold text-sm py-3.5 rounded-2xl shadow hover:shadow-md transition-all active:scale-95 cursor-pointer text-center"
                      >
                        {t('emptyState.notifyBtn')}
                      </button>
                      
                      <button
                        onClick={() => setShowSearchModal(true)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-outfit font-extrabold text-sm py-3.5 rounded-2xl transition-all active:scale-95 text-center cursor-pointer"
                      >
                        Search Another Location
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* TEACHER REGISTERED EMPTY STATE */
                <div className="space-y-5 relative z-10">
                  <h2 className="font-outfit font-black text-2xl md:text-3xl text-slate-900 leading-tight">
                    {i18n.language === 'hi' ? 'इस क्षेत्र में पहले शिक्षक बनें!' : 'Become First Teacher In This Area!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                    Be the pioneer educator in your village! Complete your MERN teacher profile to mark your center on the OpenStreetMap and get searched by nearby families.
                  </p>
                  
                  <Link
                    to="/teacher"
                    className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-outfit font-extrabold text-sm py-3.5 rounded-2xl shadow hover:shadow-md transition-all active:scale-95"
                  >
                    Complete Your Teacher Profile 👨‍🏫
                  </Link>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>Hotspot: {addressName}</span>
                </div>
                <span className="text-[10px] text-slate-400">Waitlist logged</span>
              </div>

            </div>
          ) : (
            
            /* Nearby Teacher Cards List */
            teachers.map((teacher) => (
              <div
                key={teacher._id}
                onMouseEnter={() => setHoveredTeacherId(teacher._id)}
                onMouseLeave={() => setHoveredTeacherId(null)}
                className={`glass-card p-5 rounded-3xl border transition-all duration-300 flex items-start gap-4 ${
                  hoveredTeacherId === teacher._id
                    ? 'border-[#f97316] shadow-premium bg-gradient-to-br from-white to-orange-50/20 scale-[1.01]'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {getProfilePhotoUrl(teacher.profilePhoto || teacher.profileImage || teacher.user?.profilePhoto || teacher.user?.profileImage) ? (
                    <img src={getProfilePhotoUrl(teacher.profilePhoto || teacher.profileImage || teacher.user?.profilePhoto || teacher.user?.profileImage)} alt={teacher.user.name} className="h-full w-full object-cover" onError={handleProfileImageError} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h3 className="font-outfit font-black text-slate-900 text-lg leading-tight truncate">
                        {teacher.user.name}
                      </h3>
                      {teacher.villageOrArea && (
                        <p className="text-[10px] font-black text-brand-600 bg-brand-50 border border-brand-100/60 px-2 py-0.5 rounded-md w-fit mt-0.5 flex items-center gap-0.5">
                          <span>📍</span>
                          <span>{teacher.villageOrArea}</span>
                        </p>
                      )}
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <StarRating rating={teacher.rating} size={12} />
                        <span className="text-[10px] text-slate-500 font-extrabold">({teacher.reviewCount})</span>
                        {teacher.demoAvailable && (
                          <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">
                            {t('discovery.demoAvailable')}
                          </span>
                        )}
                      </div>
                    </div>

                    {teacher.distance > 0 && (
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                          {(teacher.distance / 1000).toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5 font-semibold">
                    <p className="truncate"><span className="font-bold text-slate-600">{t('discovery.subjectsTaught')}</span>{teacher.subjects.join(', ')}</p>
                    <p className="truncate"><span className="font-bold text-slate-600">{t('discovery.classesTaught')}</span>{teacher.classes.join(', ')}</p>
                    <p className="truncate"><span className="font-bold text-slate-600">{t('discovery.timingsLabel')}</span>{teacher.timings}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-1">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Monthly Fees</p>
                      <p className="font-outfit font-black text-brand-600 text-base leading-none mt-0.5">₹{teacher.fees}</p>
                    </div>
                    <Link
                      to={`/teacher-profile/${teacher._id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                    >
                      {t('discovery.viewProfile')}
                    </Link>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NearbyDiscovery;
