import { useState, useEffect, useRef } from 'react';

// Component to render an animated GIF cycling through cameras
function CameraAnimation({ pixelsByCamera, cameras }) {
    const canvasRef = useRef(null);
    const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
    const [isPlaying, setIsPlaying] = useState(true);
    const [fps, setFps] = useState(2); // frames per second

    useEffect(() => {
        if (!isPlaying || cameras.length === 0) return;

        const interval = setInterval(() => {
            setCurrentCameraIndex(prev => {
                const next = prev + direction;
                
                // Check if we need to bounce back
                if (next >= cameras.length - 1) {
                    setDirection(-1);
                    return cameras.length - 1;
                } else if (next <= 0) {
                    setDirection(1);
                    return 0;
                }
                
                return next;
            });
        }, 1000 / fps);

        return () => clearInterval(interval);
    }, [isPlaying, cameras.length, fps, direction]);

    useEffect(() => {
        if (cameras.length === 0) return;
        
        const currentCamera = cameras[currentCameraIndex];
        const pixels = pixelsByCamera[currentCamera];
        
        if (!pixels || pixels.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Find the dimensions across all cameras for consistent sizing
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        Object.values(pixelsByCamera).forEach(cameraPixels => {
            cameraPixels.forEach(p => {
                minX = Math.min(minX, p.index_x);
                maxX = Math.max(maxX, p.index_x);
                minY = Math.min(minY, p.index_y);
                maxY = Math.max(maxY, p.index_y);
            });
        });

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        // Set canvas size
        const scale = 2;
        canvas.width = height * scale;
        canvas.height = width * scale;

        // Find min/max radiance for current camera
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
    }, [currentCameraIndex, cameras, pixelsByCamera]);

    if (cameras.length === 0) return null;

    return (
        <div className="flex flex-col items-center space-y-4 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-300">Camera Animation</h3>
            <div className="flex flex-col items-center space-y-2">
                <canvas 
                    ref={canvasRef}
                    className="border-2 border-blue-500 rounded-lg shadow-lg"
                    style={{ imageRendering: 'pixelated' }}
                />
                <p className="text-lg font-semibold text-blue-400">Camera: {cameras[currentCameraIndex]}</p>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-400">Speed:</label>
                    <select
                        value={fps}
                        onChange={(e) => setFps(Number(e.target.value))}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[1, 2, 3, 4, 5].map(speed => (
                            <option key={speed} value={speed}>{speed} FPS</option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-sm text-gray-400">Frame {currentCameraIndex + 1} of {cameras.length}</p>
        </div>
    );
}

export default CameraAnimation;