import React from 'react';
import CameraImage from './CameraImage';
import CameraAnimation from './CameraAnimation';

// Component to render multiple camera images
function PixelMap({ pixels }) {
    // Group pixels by camera
    const pixelsByCamera = {};
    pixels.forEach(pixel => {
        const camera = pixel.camera_name;
        if (!pixelsByCamera[camera]) {
            pixelsByCamera[camera] = [];
        }
        pixelsByCamera[camera].push(pixel);
    });

    // Define the specific camera order
    const cameraOrder = ['DF', 'CF', 'BF', 'AF', 'AN', 'AA', 'BA', 'CA', 'DA'];
    const cameras = Object.keys(pixelsByCamera).sort((a, b) => {
        return cameraOrder.indexOf(a) - cameraOrder.indexOf(b);
    });

    return (
        <div className="space-y-6">
            {cameras.length > 1 && (
                <>
                    <p className="text-center text-gray-400">
                        Displaying {cameras.length} camera views
                    </p>
                    {/* Camera Animation */}
                    <CameraAnimation pixelsByCamera={pixelsByCamera} cameras={cameras} />
                </>
            )}
            {/* Individual Camera Images */}
            <div className={`grid gap-6 ${cameras.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {cameras.map(camera => (
                    <CameraImage 
                        key={camera}
                        pixels={pixelsByCamera[camera]}
                        cameraName={camera}
                    />
                ))}
            </div>
        </div>
    );
}

export default PixelMap;