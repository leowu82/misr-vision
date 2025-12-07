import { useState, useEffect, useRef } from 'react';

// Component to render pixel data on a canvas for a single camera
function CameraImage({ pixels, cameraName }) {
    const canvasRef = useRef(null);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [canvasMetadata, setCanvasMetadata] = useState(null);

    useEffect(() => {
        if (!pixels || pixels.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Find the dimensions of the pixel grid
        const minX = Math.min(...pixels.map(p => p.index_x));
        const maxX = Math.max(...pixels.map(p => p.index_x));
        const minY = Math.min(...pixels.map(p => p.index_y));
        const maxY = Math.max(...pixels.map(p => p.index_y));
        
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        // Set canvas size with scaling factor for better visibility
        // Flip width and height since we're swapping x and y axes
        const scale = 2;
        canvas.width = height * scale;
        canvas.height = width * scale;

        // Store metadata for hover functionality
        setCanvasMetadata({ minX, maxX, minY, maxY, scale });

        // Create a lookup map for quick pixel access
        const pixelMap = new Map();
        pixels.forEach(pixel => {
            const key = `${pixel.index_x},${pixel.index_y}`;
            pixelMap.set(key, pixel);
        });

        // Find min/max radiance for normalization
        const radiances = pixels.map(p => p.radiance).filter(r => r != null);
        const minRad = Math.min(...radiances);
        const maxRad = Math.max(...radiances);
        const rangeRad = maxRad - minRad || 1;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw each pixel with flipped axes
        pixels.forEach(pixel => {
            if (pixel.radiance == null) return;

            // Flip x and y: what was x becomes y, what was y becomes x
            const x = (pixel.index_y - minY) * scale;
            const y = (pixel.index_x - minX) * scale;

            // Normalize radiance to 0-255 range
            const normalized = Math.floor(((pixel.radiance - minRad) / rangeRad) * 255);
            
            // Use grayscale for radiance
            ctx.fillStyle = `rgb(${normalized}, ${normalized}, ${normalized})`;
            ctx.fillRect(x, y, scale, scale);
        });

        // Store pixel map for hover
        canvas.pixelMap = pixelMap;
    }, [pixels]);

    const handleMouseMove = (e) => {
        if (!canvasMetadata || !pixels || pixels.length === 0) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const { minX, minY, scale } = canvasMetadata;

        // Convert canvas coordinates back to pixel indices (accounting for flipped axes)
        const index_y = Math.floor(x / scale) + minY;
        const index_x = Math.floor(y / scale) + minX;

        // Look up the pixel data
        const key = `${index_x},${index_y}`;
        const pixel = canvas.pixelMap?.get(key);

        if (pixel) {
            setHoverInfo({
                index_x: pixel.index_x,
                index_y: pixel.index_y,
                radiance: pixel.radiance,
                latitude: pixel.latitude,
                longitude: pixel.longitude,
                som_x: pixel.som_x,
                som_y: pixel.som_y
            });
        } else {
            setHoverInfo(null);
        }
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-300">Camera: {cameraName}</h3>
            <canvas 
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="border-2 border-gray-600 rounded-lg shadow-lg cursor-crosshair"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="bg-gray-700 text-white text-sm p-3 rounded-lg shadow-lg border border-gray-600 w-64" style={{ height: '184px' }}>
                {hoverInfo ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 h-full">
                        <div className="text-gray-400">Index X:</div>
                        <div className="text-right">{hoverInfo.index_x}</div>
                        <div className="text-gray-400">Index Y:</div>
                        <div className="text-right">{hoverInfo.index_y}</div>
                        <div className="text-gray-400">Radiance:</div>
                        <div className="text-right">{hoverInfo.radiance?.toFixed(4)}</div>
                        <div className="text-gray-400">Latitude:</div>
                        <div className="text-right">{hoverInfo.latitude != null ? hoverInfo.latitude?.toFixed(6) : 'N/A'}</div>
                        <div className="text-gray-400">Longitude:</div>
                        <div className="text-right">{hoverInfo.longitude != null ? hoverInfo.longitude?.toFixed(6) : 'N/A'}</div>
                        <div className="text-gray-400">SOM X:</div>
                        <div className="text-right">{hoverInfo.som_x != null ? hoverInfo.som_x?.toFixed(2) : 'N/A'}</div>
                        <div className="text-gray-400">SOM Y:</div>
                        <div className="text-right">{hoverInfo.som_y != null ? hoverInfo.som_y?.toFixed(2) : 'N/A'}</div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Hover over image for details
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-400">{pixels.length} pixels</p>
        </div>
    );
}

export default CameraImage;