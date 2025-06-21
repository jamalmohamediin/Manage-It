// src/components/ImageCropperModal.tsx
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import Modal from './Modal';

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  title?: string;
}

const ImageCropperModal: React.FC<Props> = ({ imageSrc, onCancel, onCropComplete, title }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropDone = async () => {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
  };

  return (
    <Modal onClose={onCancel}>
      <div className="max-w-2xl p-4 mx-auto bg-white rounded-xl">
        <h2 className="mb-4 text-lg font-bold">{title || "Crop Image"}</h2>
        <div className="relative w-full bg-gray-200 h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={onCropDone} className="px-4 py-2 bg-[#5c3a21] text-white rounded">Crop & Save</button>
        </div>
      </div>
    </Modal>
  );
};

export default ImageCropperModal;
