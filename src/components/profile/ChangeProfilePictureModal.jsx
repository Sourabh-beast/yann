"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export default function ChangeProfilePictureModal({ isOpen, onClose, onSuccess }) {
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setImageSrc("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError("");
      setIsSaving(false);
    }
  }, [isOpen]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size should be under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result?.toString() || "");
      setError("");
    };
    reader.onerror = () => {
      setError("Unable to read the file. Please try another image.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError("Upload and adjust your photo before saving.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 400);
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: croppedImage }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update profile picture");
      }

      onSuccess?.(data.profileImage || croppedImage);
      onClose?.();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [imageSrc, croppedAreaPixels, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Update profile picture</h3>
            <p className="text-sm text-gray-500">Upload a clear square photo to personalise your account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 px-6 pb-6 pt-5">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-6 text-center">
            <input
              type="file"
              id="avatar-upload-input"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="avatar-upload-input"
              className="inline-flex cursor-pointer items-center rounded-full border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4-4 4 4m0 0l4-4 4 4M4 8h16" />
              </svg>
              Upload new photo
            </label>
            <p className="mt-2 text-xs text-gray-500">PNG, JPG, or WEBP up to 4MB. Cropped to 1:1.</p>
          </div>

          {imageSrc ? (
            <div className="relative h-72 overflow-hidden rounded-2xl bg-gray-900/80">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div className="absolute bottom-4 left-1/2 w-3/5 -translate-x-1/2 rounded-full bg-black/40 px-4 py-2">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-12">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 1.105-.672 2-1.5 2S9 12.105 9 11s.672-2 1.5-2S12 9.895 12 11zm-5.25 9a3.75 3.75 0 01-3.75-3.75V9.75A3.75 3.75 0 015.75 6h1.03A3 3 0 019.5 4h5a3 3 0 012.72 1.75h1.03a3.75 3.75 0 013.75 3.75v6.5A3.75 3.75 0 0118.25 20H6.75z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-600">Select an image to preview and crop.</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save picture"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
