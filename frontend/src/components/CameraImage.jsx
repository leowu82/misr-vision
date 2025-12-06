import { useState, useEffect, useRef } from 'react';

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

        // Set canvas size with scaling factor
        const scale = 2;
        canvas.width = height * scale;
        canvas.height = width * scale;

        setCanvasMetadata({ minX, maxX, minY, maxY, scale });

        // Create lookup map
        const pixelMap = new Map();
        pixels.forEach(pixel => {
            const key = `${pixel.index_x},${pixel.index_y}`;
            pixelMap.set(key, pixel);
        });

        const radiances = pixels.map(p => p.radiance).filter(r => r != null);
        const minRad = Math.min(...radiances);
        const maxRad = Math.max(...radiances);
        const rangeRad = maxRad - minRad || 1;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw pixels
        pixels.forEach(pixel => {
            if (pixel.radiance == null) return;
            const x = (pixel.index_y - minY) * scale;
            const y = (pixel.index_x - minX) * scale;
            const normalized = Math.floor(((pixel.radiance - minRad) / rangeRad) * 255);
            ctx.fillStyle = `rgb(${normalized}, ${normalized}, ${normalized})`;
            ctx.fillRect(x, y, scale, scale);
        });

        canvas.pixelMap = pixelMap;
    }, [pixels]);

    const handleMouseMove = (e) => {
        if (!canvasMetadata || !pixels || pixels.length === 0) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const { minX, minY, scale } = canvasMetadata;

        const index_y = Math.floor(x / scale) + minY;
        const index_x = Math.floor(y / scale) + minX;

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
                        <div className="text-gray-400">Lat:</div>
                        <div className="text-right">{hoverInfo.latitude?.toFixed(4) || 'N/A'}</div>
                        <div className="text-gray-400">Lon:</div>
                        <div className="text-right">{hoverInfo.longitude?.toFixed(4) || 'N/A'}</div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Hover over image for details
                    </div>
                )}
            </div>
        </div>
    );
}

export default CameraImage;