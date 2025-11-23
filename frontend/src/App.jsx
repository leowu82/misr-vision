import { useState, useEffect } from 'react';

function App() {
    const [orbits, setOrbits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/orbits');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setOrbits(data);
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch data:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Orbit Data</h1>
            
            {loading && <p className="text-center text-lg">Loading data...</p>}

            {error && (
                <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-md shadow-lg" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {!loading && !error && (
                <div className="shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-800">
                            <tr>
                                {/* Dynamically create table headers from the first orbit's keys */}
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
                    
                    {/* Optional: Keep your count at the bottom */}
                    <div className="px-5 py-3 bg-gray-800 text-right">
                        <span className="text-sm text-gray-400">Total items: {orbits.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;