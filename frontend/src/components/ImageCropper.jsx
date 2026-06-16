import { useState } from "react";
import Cropper from "react-easy-crop";

function ImageCropper({
  image,
  onClose,
  onSave
}) {

  const [crop, setCrop] = useState({
    x: 0,
    y: 0
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels,
    setCroppedAreaPixels] =
    useState(null);

  return (
    <div className="crop-overlay">

      <div className="crop-container">

        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(
            croppedArea,
            croppedAreaPixels
          ) =>
            setCroppedAreaPixels(
              croppedAreaPixels
            )
          }
        />

        <div className="crop-controls">

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) =>
              setZoom(e.target.value)
            }
          />

          <button
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave(
                image,
                croppedAreaPixels
              )
            }
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}

export default ImageCropper;