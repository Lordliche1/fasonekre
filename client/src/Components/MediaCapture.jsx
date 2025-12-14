import React, { useState, useRef } from 'react';

export default function MediaCapture({ onMediaCapture }) {
    const [mediaType, setMediaType] = useState(null); // 'photo', 'video', 'audio'
    const [recording, setRecording] = useState(false);
    const [mediaFiles, setMediaFiles] = useState({
        photos: [],
        videos: [],
        audio: []
    });
    const [previewURL, setPreviewURL] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);

    // Capture Photo depuis la caméra
    const startPhotoCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Caméra arrière sur mobile
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMediaType('photo');
            setPreviewURL(null);
        } catch (err) {
            alert('Erreur accès caméra: ' + err.message);
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

            setPreviewURL(url);
            const newPhotos = [...mediaFiles.photos, { file, url, type: 'photo' }];
            setMediaFiles({ ...mediaFiles, photos: newPhotos });
            onMediaCapture({ photos: newPhotos, videos: mediaFiles.videos, audio: mediaFiles.audio });

            stopStream();
            setMediaType(null);
        }, 'image/jpeg', 0.9);
    };

    // Upload Photo depuis fichier
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            type: 'photo'
        }));

        const updatedPhotos = [...mediaFiles.photos, ...newPhotos];
        setMediaFiles({ ...mediaFiles, photos: updatedPhotos });
        onMediaCapture({ photos: updatedPhotos, videos: mediaFiles.videos, audio: mediaFiles.audio });
    };

    // Enregistrement Vidéo
    const startVideoRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: true
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });

                const newVideos = [...mediaFiles.videos, { file, url, type: 'video' }];
                setMediaFiles({ ...mediaFiles, videos: newVideos });
                onMediaCapture({ photos: mediaFiles.photos, videos: newVideos, audio: mediaFiles.audio });

                stopStream();
                setMediaType(null);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            setMediaType('video');
        } catch (err) {
            alert('Erreur enregistrement vidéo: ' + err.message);
        }
    };

    const stopVideoRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    // Enregistrement Audio
    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });

                const newAudio = [...mediaFiles.audio, { file, url, type: 'audio' }];
                setMediaFiles({ ...mediaFiles, audio: newAudio });
                onMediaCapture({ photos: mediaFiles.photos, videos: mediaFiles.videos, audio: newAudio });

                stream.getTracks().forEach(track => track.stop());
                setMediaType(null);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            setMediaType('audio');
        } catch (err) {
            alert('Erreur enregistrement audio: ' + err.message);
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const removeMedia = (type, index) => {
        const updated = { ...mediaFiles };
        updated[type].splice(index, 1);
        setMediaFiles(updated);
        onMediaCapture(updated);
    };

    const totalMediaCount = mediaFiles.photos.length + mediaFiles.videos.length + mediaFiles.audio.length;

    return (
        <div className="media-capture border-2 rounded-xl p-4 my-4">
            <h3 className="text-xl font-bold mb-3">📸 Médias ({totalMediaCount})</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <button
                    onClick={startPhotoCapture}
                    className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                    disabled={mediaType !== null}
                >
                    📷 Caméra
                </button>

                <label className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 flex items-center justify-center gap-2 cursor-pointer">
                    🖼️ Upload
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />
                </label>

                <button
                    onClick={recording && mediaType === 'video' ? stopVideoRecording : startVideoRecording}
                    className={`${recording && mediaType === 'video' ? 'bg-red-600' : 'bg-purple-600'} text-white px-4 py-3 rounded hover:opacity-90 flex items-center justify-center gap-2`}
                    disabled={mediaType !== null && mediaType !== 'video'}
                >
                    {recording && mediaType === 'video' ? '⏹️ Stop' : '🎥 Vidéo'}
                </button>

                <button
                    onClick={recording && mediaType === 'audio' ? stopAudioRecording : startAudioRecording}
                    className={`${recording && mediaType === 'audio' ? 'bg-red-600' : 'bg-orange-600'} text-white px-4 py-3 rounded hover:opacity-90 flex items-center justify-center gap-2`}
                    disabled={mediaType !== null && mediaType !== 'audio'}
                >
                    {recording && mediaType === 'audio' ? '⏹️ Stop' : '🎤 Audio'}
                </button>
            </div>

            {/* Caméra/Vidéo Preview */}
            {(mediaType === 'photo' || mediaType === 'video') && (
                <div className="mb-4">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted={mediaType === 'photo'}
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
                    />
                    {mediaType === 'photo' && (
                        <button
                            onClick={takePhoto}
                            className="mt-2 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 w-full max-w-md mx-auto block"
                        >
                            📸 Prendre la Photo
                        </button>
                    )}
                    {mediaType === 'video' && recording && (
                        <div className="mt-2 text-center">
                            <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded">
                                <span className="animate-pulse">🔴</span> Enregistrement en cours...
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Audio Recording Indicator */}
            {mediaType === 'audio' && recording && (
                <div className="mb-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg">
                        <span className="animate-pulse">🔴</span>
                        <span className="text-lg">Enregistrement audio...</span>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Media Gallery */}
            {totalMediaCount > 0 && (
                <div className="mt-4">
                    <h4 className="font-bold mb-2">Médias capturés:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {mediaFiles.photos.map((item, idx) => (
                            <div key={`photo-${idx}`} className="relative group">
                                <img src={item.url} alt={`Photo ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                                <button
                                    onClick={() => removeMedia('photos', idx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                                <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">📷 Photo</span>
                            </div>
                        ))}
                        {mediaFiles.videos.map((item, idx) => (
                            <div key={`video-${idx}`} className="relative group">
                                <video src={item.url} className="w-full h-32 object-cover rounded" />
                                <button
                                    onClick={() => removeMedia('videos', idx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                                <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">🎥 Vidéo</span>
                            </div>
                        ))}
                        {mediaFiles.audio.map((item, idx) => (
                            <div key={`audio-${idx}`} className="relative group bg-gray-200 rounded p-3 flex flex-col items-center justify-center h-32">
                                <span className="text-4xl mb-2">🎤</span>
                                <audio src={item.url} controls className="w-full" />
                                <button
                                    onClick={() => removeMedia('audio', idx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
