import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, addToast } from '@heroui/react';
import { Camera } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';

/**
 * Props for the CameraModal component.
 * @interface CameraModalProps
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {function} onClose - Callback to close the modal.
 * @property {function} onCapture - Callback when images are captured.
 */
interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (files: File[]) => void;
}

/**
 * CameraModal component.
 * Provides a full-screen camera interface for capturing images.
 * @param {CameraModalProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
    const { t } = useTexts();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImages, setCapturedImages] = useState<File[]>([]);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            addToast({ title: t('test.questions.camera.error'), color: 'danger' });
            console.error('Camera error:', err);
            onClose(); // Close the modal if camera fails
        }
    }, [onClose]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setCapturedImages([]);
        }
        return () => stopCamera();
    }, [isOpen, startCamera, stopCamera]);

    const handleCapture = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setCapturedImages(prev => [...prev, file]);
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    }, []);

    const handleDone = useCallback(() => {
        if (capturedImages.length > 0) {
            onCapture(capturedImages);
        }
        onClose();
    }, [capturedImages, onCapture, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" classNames={{ base: "bg-black text-white" }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('test.questions.camera.title')}</ModalHeader>
                        <ModalBody className="flex flex-col items-center justify-center relative p-0 overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Capture Button Overlay */}
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                                <Button
                                    isIconOnly
                                    size="lg"
                                    radius="full"
                                    className="w-20 h-20 bg-white/20 border-4 border-white text-white backdrop-blur-md"
                                    onPress={handleCapture}
                                >
                                    <Camera className="w-8 h-8" />
                                </Button>
                            </div>

                            {/* Captured Count Badge */}
                            {capturedImages.length > 0 && (
                                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-bold">
                                    {t('test.questions.camera.photosCount', { count: capturedImages.length })}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter className="justify-between">
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="primary" onPress={handleDone} isDisabled={capturedImages.length === 0}>
                                {t('test.questions.camera.done', { count: capturedImages.length })}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
