import { useState, useEffect } from 'react';
import PixelMap from './components/PixelMap';
import AuthParams from './components/AuthParams';

// Define our main App component
function App() {
    // Set up user state to track logged-in user
    const [user, setUser] = useState(localStorage.getItem('username'));
    // Set up state to hold our data, loading status, and errors
    const [orbits, setOrbits] = useState([]);
    const [pixels, setPixels] = useState([]);
    const [rectangles, setRectangles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('orbits'); // 'orbits', 'pixels', or 'rectangles'
    const [selectedRectangle, setSelectedRectangle] = useState('');
    const [loadTime, setLoadTime] = useState(null);
    const [editingRect, setEditingRect] = useState(null);
    const [showRectForm, setShowRectForm] = useState(false);
    const [rectForm, setRectForm] = useState({
        rect_id: '',
        location_name: '',
        ulc_lat: '',
        ulc_lon: '',
        lrc_lat: '',
        lrc_lon: ''
    });
    const [filterParams, setFilterParams] = useState({
        orbit_id: '105254',
        block_id: '75',
        camera_name: 'DA',
        limit: '',
        ulc_lat: '',
        ulc_lon: '',
        lrc_lat: '',
        min_index_x: '',
        max_index_x: '',
        min_index_y: '',
        max_index_y: '',
        lrc_lon: ''
    });

    // This function runs when the component first loads
    useEffect(() => {
        fetchInitialData();
    }, []); // The empty array [] means this runs only once on mount

    // Function to fetch initial data (orbits and rectangles)
    async function fetchInitialData() {
        setLoading(true);
        setError(null);
        try {
            const [orbitsResponse, rectanglesResponse] = await Promise.all([
                fetch('/api/orbits'),
                fetch('/api/rectangles')
            ]);

            if (!orbitsResponse.ok || !rectanglesResponse.ok) {
                throw new Error(`HTTP error! status: ${orbitsResponse.status || rectanglesResponse.status}`);
            }

            const orbitsData = await orbitsResponse.json();
            const rectanglesData = await rectanglesResponse.json();

            setOrbits(orbitsData);
            setRectangles(rectanglesData);
        } catch (e) {
            setError(e.message);
            console.error("Failed to fetch initial data:", e);
        } finally {
            setLoading(false);
        }
    }

    // Function to fetch pixel data
    async function fetchData() {
        setLoading(true);
        setError(null);
        setLoadTime(null);
        
        // Start timing
        const startTime = performance.now();
        
        try {
            // Build query string for pixels
            const pixelParams = new URLSearchParams();
            if (filterParams.orbit_id) pixelParams.append('orbit_id', filterParams.orbit_id);
            if (filterParams.block_id) pixelParams.append('block_id', filterParams.block_id);
            if (filterParams.camera_name) pixelParams.append('camera_name', filterParams.camera_name);
            if (filterParams.limit) pixelParams.append('limit', filterParams.limit);
            if (filterParams.ulc_lat) pixelParams.append('ulc_lat', filterParams.ulc_lat);
            if (filterParams.ulc_lon) pixelParams.append('ulc_lon', filterParams.ulc_lon);
            if (filterParams.lrc_lat) pixelParams.append('lrc_lat', filterParams.lrc_lat);
            if (filterParams.lrc_lon) pixelParams.append('lrc_lon', filterParams.lrc_lon);
            if (filterParams.min_index_x) pixelParams.append('min_index_x', filterParams.min_index_x);
            if (filterParams.max_index_x) pixelParams.append('max_index_x', filterParams.max_index_x);
            if (filterParams.min_index_y) pixelParams.append('min_index_y', filterParams.min_index_y);
            if (filterParams.max_index_y) pixelParams.append('max_index_y', filterParams.max_index_y);

            // Make the API calls
            const [orbitsResponse, pixelsResponse] = await Promise.all([
                fetch('/api/orbits'),
                fetch(`/api/pixels?${pixelParams.toString()}`)
            ]);
            
            if (!orbitsResponse.ok || !pixelsResponse.ok) {
                throw new Error(`HTTP error! status: ${orbitsResponse.status || pixelsResponse.status}`);
            }

            const orbitsData = await orbitsResponse.json();
            const pixelsData = await pixelsResponse.json();
            
            // End timing
            const endTime = performance.now();
            const loadTimeMs = endTime - startTime;
            setLoadTime(loadTimeMs);
            
            setOrbits(orbitsData); // Put the data into state
            setPixels(pixelsData.pixels || []); // Extract pixels array from response
        } catch (e) {
            setError(e.message); // Store any errors
            console.error("Failed to fetch data:", e);
        } finally {
            setLoading(false); // We're done loading, even if it failed
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRectangleSelect = (e) => {
        const rectId = e.target.value;
        setSelectedRectangle(rectId);
        
        if (rectId) {
            const rect = rectangles.find(r => r.rect_id == rectId);
            if (rect) {
                setFilterParams(prev => ({
                    ...prev,
                    ulc_lat: rect.ulc_lat.toString(),
                    ulc_lon: rect.ulc_lon.toString(),
                    lrc_lat: rect.lrc_lat.toString(),
                    lrc_lon: rect.lrc_lon.toString()
                }));
            }
        } else {
            // Clear rectangle coordinates if "None" is selected
            setFilterParams(prev => ({
                ...prev,
                ulc_lat: '',
                ulc_lon: '',
                lrc_lat: '',
                lrc_lon: ''
            }));
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    // Rectangle CRUD handlers
    const handleRectFormChange = (e) => {
        const { name, value } = e.target;
        setRectForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateRect = () => {
        setEditingRect(null);
        setRectForm({
            rect_id: '',
            location_name: '',
            ulc_lat: '',
            ulc_lon: '',
            lrc_lat: '',
            lrc_lon: ''
        });
        setShowRectForm(true);
    };

    const handleEditRect = (rect) => {
        setEditingRect(rect.rect_id);
        setRectForm({
            rect_id: rect.rect_id.toString(),
            location_name: rect.location_name,
            ulc_lat: rect.ulc_lat.toString(),
            ulc_lon: rect.ulc_lon.toString(),
            lrc_lat: rect.lrc_lat.toString(),
            lrc_lon: rect.lrc_lon.toString()
        });
        setShowRectForm(true);
    };

    const handleRectFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingRect ? `/api/rectangles/${editingRect}` : '/api/rectangles';
            const method = editingRect ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rectForm)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh rectangles list
            const rectanglesResponse = await fetch('/api/rectangles');
            const rectanglesData = await rectanglesResponse.json();
            setRectangles(rectanglesData);

            // Close form
            setShowRectForm(false);
            setEditingRect(null);
        } catch (e) {
            alert(`Failed to ${editingRect ? 'update' : 'create'} rectangle: ${e.message}`);
            console.error("Failed to submit rectangle:", e);
        }
    };

    const handleDeleteRect = async (rect_id) => {
        if (!confirm(`Are you sure you want to delete rectangle ${rect_id}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/rectangles/${rect_id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh rectangles list
            const rectanglesResponse = await fetch('/api/rectangles');
            const rectanglesData = await rectanglesResponse.json();
            setRectangles(rectanglesData);
        } catch (e) {
            alert(`Failed to delete rectangle: ${e.message}`);
            console.error("Failed to delete rectangle:", e);
        }
    };

    const handleCancelRectForm = () => {
        setShowRectForm(false);
        setEditingRect(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    // --- Render the UI ---
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4">
                 <h1 className="text-3xl font-bold text-center mb-6">MISR Data Vision</h1>
                 <AuthParams onLogin={(username) => setUser(username)} />
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">MISR Data Viewer</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-400">Hello, {user}</span>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-6 flex justify-start space-x-4">
                <button 
                    onClick={() => setActiveTab('orbits')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        activeTab === 'orbits' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Orbits
                </button>
                <button 
                    onClick={() => setActiveTab('pixels')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        activeTab === 'pixels' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Pixel Data with Geolocation
                </button>
                <button 
                    onClick={() => setActiveTab('rectangles')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        activeTab === 'rectangles' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Manage Rectangles
                </button>
            </div>
            
            {/* Show a loading message */}
            {loading && <p className="text-center text-lg">Loading data...</p>}

            {/* Show an error message if something went wrong */}
            {error && (
                <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-md shadow-lg" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                    <p className="text-sm mt-2">
                        Failed to fetch data. Is the API server (`node index.js`) running? 
                        Is the Cloud SQL Proxy connected?
                    </p>
                </div>
            )}

            {/* Show the orbits table */}
            {!loading && !error && activeTab === 'orbits' && (
                <div className="shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-800">
                            <tr>
                                {orbits.length > 0 && Object.keys(orbits[0]).map(key => (
                                    <th key={key} className="px-5 py-3 border-b-2 border-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-gray-700">
                            {orbits.map((orbit, index) => (
                                <tr key={index} className="hover:bg-gray-600">
                                    {Object.values(orbit).map((value, i) => (
                                        <td key={i} className="px-5 py-5 border-b border-gray-600 text-sm">
                                            <p className="text-gray-100 whitespace-no-wrap">{value}</p>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Show the pixel map visualization */}
            {!loading && !error && activeTab === 'pixels' && (
                <div className="space-y-6">
                    {/* Filter Form */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-300 mb-4">Filters</h2>
                        <form onSubmit={handleFilterSubmit} className="space-y-6">
                            {/* Basic Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Orbit ID</label>
                                    <input
                                        type="text"
                                        name="orbit_id"
                                        value={filterParams.orbit_id}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 105254"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Block ID</label>
                                    <input
                                        type="text"
                                        name="block_id"
                                        value={filterParams.block_id}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 75"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Camera Name</label>
                                    <input
                                        type="text"
                                        name="camera_name"
                                        value={filterParams.camera_name}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., DA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Limit (Optional)</label>
                                    <input
                                        type="text"
                                        name="limit"
                                        value={filterParams.limit}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="No limit (all results)"
                                    />
                                </div>
                            </div>

                            {/* Pixel Index Filter */}
                            <div>
                                <h3 className="text-md font-semibold text-gray-300 mb-3">Pixel Index Range (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Index X Range */}
                                    <div className="bg-gray-700 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Index X Range</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Min Index X</label>
                                                <input
                                                    type="text"
                                                    name="min_index_x"
                                                    value={filterParams.min_index_x}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Max Index X</label>
                                                <input
                                                    type="text"
                                                    name="max_index_x"
                                                    value={filterParams.max_index_x}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 100"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Index Y Range */}
                                    <div className="bg-gray-700 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Index Y Range</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Min Index Y</label>
                                                <input
                                                    type="text"
                                                    name="min_index_y"
                                                    value={filterParams.min_index_y}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Max Index Y</label>
                                                <input
                                                    type="text"
                                                    name="max_index_y"
                                                    value={filterParams.max_index_y}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Geographic Rectangle Filter */}
                            <div>
                                <h3 className="text-md font-semibold text-gray-300 mb-3">Geographic Rectangle (Optional)</h3>
                                
                                {/* Rectangle Selector */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Predefined Rectangle</label>
                                    <select
                                        value={selectedRectangle}
                                        onChange={handleRectangleSelect}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- None (Manual Entry) --</option>
                                        {rectangles.map(rect => (
                                            <option key={rect.rect_id} value={rect.rect_id}>
                                                {rect.location_name} (ID: {rect.rect_id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Upper Left Corner */}
                                    <div className="bg-gray-700 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Upper Left Corner</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                                                <input
                                                    type="text"
                                                    name="ulc_lat"
                                                    value={filterParams.ulc_lat}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 45.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                                                <input
                                                    type="text"
                                                    name="ulc_lon"
                                                    value={filterParams.ulc_lon}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., -122.0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lower Right Corner */}
                                    <div className="bg-gray-700 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Lower Right Corner</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                                                <input
                                                    type="text"
                                                    name="lrc_lat"
                                                    value={filterParams.lrc_lat}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 44.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                                                <input
                                                    type="text"
                                                    name="lrc_lon"
                                                    value={filterParams.lrc_lon}
                                                    onChange={handleFilterChange}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., -121.0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Load Pixel Data
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Pixel Map Display */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-300">MISR Satellite Image</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Showing {pixels.length} pixels {filterParams.orbit_id && `from orbit ${filterParams.orbit_id}`}
                                {filterParams.block_id && `, block ${filterParams.block_id}`}
                                {filterParams.camera_name && `, camera ${filterParams.camera_name}`}
                            </p>
                            {loadTime && (
                                <p className="text-green-400 text-sm mt-1">
                                    ⚡ Loaded in {loadTime < 1000 ? `${loadTime.toFixed(0)} ms` : `${(loadTime / 1000).toFixed(2)} seconds`}
                                </p>
                            )}
                        </div>
                        {pixels.length > 0 ? (
                            <PixelMap pixels={pixels} />
                        ) : (
                            <p className="text-gray-400 text-center py-8">No pixel data to display. Try adjusting the filters.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Rectangles Management Tab */}
            {!loading && !error && activeTab === 'rectangles' && (
                <div className="space-y-6">
                    {/* Header with Add Button */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-300">Manage Rectangles</h2>
                        <button
                            onClick={handleCreateRect}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            + Add New Rectangle
                        </button>
                    </div>

                    {/* Rectangle Form Modal */}
                    {showRectForm && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-blue-500">
                            <h3 className="text-xl font-semibold text-gray-300 mb-4">
                                {editingRect ? 'Edit Rectangle' : 'Create New Rectangle'}
                            </h3>
                            <form onSubmit={handleRectFormSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Rectangle ID</label>
                                        <input
                                            type="text"
                                            name="rect_id"
                                            value={rectForm.rect_id}
                                            onChange={handleRectFormChange}
                                            disabled={editingRect !== null}
                                            required
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                            placeholder="e.g., 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Location Name</label>
                                        <input
                                            type="text"
                                            name="location_name"
                                            value={rectForm.location_name}
                                            onChange={handleRectFormChange}
                                            required
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., San Francisco Bay"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-700 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Upper Left Corner</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                                                <input
                                                    type="text"
                                                    name="ulc_lat"
                                                    value={rectForm.ulc_lat}
                                                    onChange={handleRectFormChange}
                                                    required
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 45.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                                                <input
                                                    type="text"
                                                    name="ulc_lon"
                                                    value={rectForm.ulc_lon}
                                                    onChange={handleRectFormChange}
                                                    required
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., -122.0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-700 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Lower Right Corner</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                                                <input
                                                    type="text"
                                                    name="lrc_lat"
                                                    value={rectForm.lrc_lat}
                                                    onChange={handleRectFormChange}
                                                    required
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 44.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                                                <input
                                                    type="text"
                                                    name="lrc_lon"
                                                    value={rectForm.lrc_lon}
                                                    onChange={handleRectFormChange}
                                                    required
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., -121.0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editingRect ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelRectForm}
                                        className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Rectangles Table */}
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">ID</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">Location Name</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">ULC Lat</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">ULC Lon</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">LRC Lat</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">LRC Lon</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">Date Created</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">Date Modified</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-600 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800">
                                {rectangles.map((rect) => (
                                    <tr key={rect.rect_id} className="hover:bg-gray-700">
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">{rect.rect_id}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">{rect.location_name}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">{rect.ulc_lat?.toFixed(4)}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">{rect.ulc_lon?.toFixed(4)}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">{rect.lrc_lat?.toFixed(4)}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">{rect.lrc_lon?.toFixed(4)}</td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">
                                            {rect.date_created ? new Date(rect.date_created).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm text-gray-100">
                                            {rect.date_modified ? new Date(rect.date_modified).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-700 text-sm">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditRect(rect)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRect(rect.rect_id)}
                                                    className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rectangles.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No rectangles found. Click "Add New Rectangle" to create one.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;