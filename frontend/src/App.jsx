import { useState, useEffect } from 'react';
import PixelMap from './components/PixelMap';

function App() {
    const [orbits, setOrbits] = useState([]);
    const [pixels, setPixels] = useState([]);
    const [rectangles, setRectangles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('orbits');
    const [selectedRectangle, setSelectedRectangle] = useState('');
    const [loadTime, setLoadTime] = useState(null);
    
    // Form States
    const [editingRect, setEditingRect] = useState(null);
    const [showRectForm, setShowRectForm] = useState(false);
    const [rectForm, setRectForm] = useState({
        rect_id: '', location_name: '', ulc_lat: '', ulc_lon: '', lrc_lat: '', lrc_lon: ''
    });
    const [filterParams, setFilterParams] = useState({
        orbit_id: '105254', block_id: '75', camera_name: 'DA', limit: '',
        ulc_lat: '', ulc_lon: '', lrc_lat: '', lrc_lon: '',
        min_index_x: '', max_index_x: '', min_index_y: '', max_index_y: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        setError(null);
        try {
            const [orbitsResponse, rectanglesResponse] = await Promise.all([
                fetch('/api/orbits'),
                fetch('/api/rectangles')
            ]);

            if (!orbitsResponse.ok || !rectanglesResponse.ok) throw new Error('Failed to fetch initial data');

            const orbitsData = await orbitsResponse.json();
            const rectanglesData = await rectanglesResponse.json();

            setOrbits(orbitsData);
            setRectangles(rectanglesData);
        } catch (e) {
            setError(e.message);
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchData() {
        setLoading(true);
        setError(null);
        setLoadTime(null);
        const startTime = performance.now();
        
        try {
            const pixelParams = new URLSearchParams();
            Object.entries(filterParams).forEach(([key, value]) => {
                if (value) pixelParams.append(key, value);
            });

            const [orbitsResponse, pixelsResponse] = await Promise.all([
                fetch('/api/orbits'),
                fetch(`/api/pixels?${pixelParams.toString()}`)
            ]);
            
            if (!orbitsResponse.ok || !pixelsResponse.ok) throw new Error('API Error');

            const orbitsData = await orbitsResponse.json();
            const pixelsData = await pixelsResponse.json();
            
            setLoadTime(performance.now() - startTime);
            setOrbits(orbitsData);
            setPixels(pixelsData.pixels || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({ ...prev, [name]: value }));
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
            setFilterParams(prev => ({
                ...prev, ulc_lat: '', ulc_lon: '', lrc_lat: '', lrc_lon: ''
            }));
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    // --- CRUD Handlers (Reduced for brevity, logic remains same) ---
    const handleRectFormChange = (e) => setRectForm({ ...rectForm, [e.target.name]: e.target.value });
    
    const handleCreateRect = () => {
        setEditingRect(null);
        setRectForm({ rect_id: '', location_name: '', ulc_lat: '', ulc_lon: '', lrc_lat: '', lrc_lon: '' });
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
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rectForm)
            });
            if (!response.ok) throw new Error('Failed to save rectangle');
            
            const rects = await (await fetch('/api/rectangles')).json();
            setRectangles(rects);
            setShowRectForm(false);
            setEditingRect(null);
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDeleteRect = async (rect_id) => {
        if (!confirm(`Delete rectangle ${rect_id}?`)) return;
        try {
            await fetch(`/api/rectangles/${rect_id}`, { method: 'DELETE' });
            const rects = await (await fetch('/api/rectangles')).json();
            setRectangles(rects);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6">MISR Data Viewer</h1>
            
            {/* Tabs */}
            <div className="mb-6 flex justify-center space-x-4">
                {['orbits', 'pixels', 'rectangles'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg font-semibold capitalize ${
                            activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                    >
                        {tab === 'pixels' ? 'Pixel Data' : tab}
                    </button>
                ))}
            </div>
            
            {loading && <p className="text-center text-lg">Loading data...</p>}
            {error && <div className="bg-red-800 p-4 text-white rounded">{error}</div>}

            {/* ORBITS TAB */}
            {!loading && !error && activeTab === 'orbits' && (
                <div className="shadow-lg rounded-lg overflow-hidden bg-gray-800">
                     <table className="min-w-full text-white">
                        <thead className="bg-gray-900">
                            <tr>
                                {orbits.length > 0 && Object.keys(orbits[0]).map(key => <th key={key} className="p-3 text-left">{key}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {orbits.map((orbit, i) => (
                                <tr key={i} className="border-t border-gray-700 hover:bg-gray-700">
                                    {Object.values(orbit).map((val, idx) => <td key={idx} className="p-3">{val}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PIXELS TAB */}
            {!loading && !error && activeTab === 'pixels' && (
                <div className="space-y-6">
                    {/* Filter Form (Keep your existing JSX here, heavily abbreviated for clarity) */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-300 mb-4">Filters</h2>
                        <form onSubmit={handleFilterSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input name="orbit_id" value={filterParams.orbit_id} onChange={handleFilterChange} placeholder="Orbit ID" className="bg-gray-700 p-2 rounded text-white" />
                                <input name="block_id" value={filterParams.block_id} onChange={handleFilterChange} placeholder="Block ID" className="bg-gray-700 p-2 rounded text-white" />
                                <input name="camera_name" value={filterParams.camera_name} onChange={handleFilterChange} placeholder="Camera" className="bg-gray-700 p-2 rounded text-white" />
                                <select value={selectedRectangle} onChange={handleRectangleSelect} className="bg-gray-700 p-2 rounded text-white">
                                    <option value="">Select Rectangle...</option>
                                    {rectangles.map(r => <option key={r.rect_id} value={r.rect_id}>{r.location_name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Load Data</button>
                        </form>
                    </div>

                    {/* PIXEL MAP COMPONENT */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        {loadTime && <p className="text-green-400 mb-2">Loaded in {loadTime.toFixed(0)}ms</p>}
                        {pixels.length > 0 ? <PixelMap pixels={pixels} /> : <p className="text-gray-400">No data</p>}
                    </div>
                </div>
            )}

            {/* RECTANGLES TAB */}
            {!loading && !error && activeTab === 'rectangles' && (
                <div>
                     <button onClick={handleCreateRect} className="bg-green-600 text-white px-4 py-2 rounded mb-4">Add New</button>
                     {/* Rectangle Form Modal (Shortened) */}
                     {showRectForm && (
                         <div className="bg-gray-800 p-6 rounded border border-blue-500 mb-6">
                             <form onSubmit={handleRectFormSubmit} className="space-y-4">
                                 <input name="rect_id" value={rectForm.rect_id} onChange={handleRectFormChange} placeholder="ID" className="bg-gray-700 p-2 rounded text-white w-full" disabled={!!editingRect} />
                                 <input name="location_name" value={rectForm.location_name} onChange={handleRectFormChange} placeholder="Name" className="bg-gray-700 p-2 rounded text-white w-full" />
                                 {/* Add Lat/Lon inputs here... */}
                                 <div className="flex space-x-2">
                                     <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                                     <button type="button" onClick={() => setShowRectForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                                 </div>
                             </form>
                         </div>
                     )}
                     
                     {/* Rectangles List */}
                     <div className="bg-gray-800 rounded overflow-hidden">
                        {rectangles.map(r => (
                            <div key={r.rect_id} className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <span className="text-white">{r.location_name} ({r.rect_id})</span>
                                <div>
                                    <button onClick={() => handleEditRect(r)} className="text-blue-400 mr-2">Edit</button>
                                    <button onClick={() => handleDeleteRect(r.rect_id)} className="text-red-400">Delete</button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
}

export default App;