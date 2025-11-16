// Note: We don't need 'import React from "react"'
// because React is already loaded from the script tag in index.html
// and is available as a global variable.

const { useState, useEffect } = React;

// Define our main App component
function App() {
    // Set up state to hold our data, loading status, and errors
    const [orbits, setOrbits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This function runs when the component first loads
    useEffect(() => {
        // Define the async function to fetch data
        async function fetchData() {
            try {
                // Make the API call
                const response = await fetch('/api/orbits');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setOrbits(data); // Put the data into state
            } catch (e) {
                setError(e.message); // Store any errors
                console.error("Failed to fetch data:", e);
            } finally {
                setLoading(false); // We're done loading, even if it failed
            }
        }

        // Call the fetch function
        fetchData();
    }, []); // The empty array [] means this runs only once on mount

    // --- Render the UI ---
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Orbit Data</h1>
            
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

            {/* Show the data table if loading is done and there's no error */}
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
                                    {/* Dynamically create table cells */}
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
        </div>
    );
}

// --- Render the App component into the "root" div ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);