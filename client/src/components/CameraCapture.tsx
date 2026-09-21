import { SwitchCamera, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isCameraSupported } from '../utils/camera';

type Facing = 'environment' | 'user';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const JPEG_QUALITY = 0.92;

function describeCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') return '카메라 권한이 거부됐어요. 브라우저 설정에서 허용해 주세요.';
  if (name === 'NotFoundError') return '사용 가능한 카메라를 찾지 못했어요.';
  return '카메라를 시작하지 못했어요. 앨범에서 가져오기를 이용해 주세요.';
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestId = useRef(0);
  const [facing, setFacing] = useState<Facing>('environment');
  const [ready, setReady] = useState(false);
  const [canSwitch, setCanSwitch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(
    async (mode: Facing) => {
      requestId.current += 1;
      const id = requestId.current;
      stopStream();
      setReady(false);
      setError(null);

      if (!isCameraSupported()) {
        setError('이 브라우저는 카메라를 지원하지 않아요. 앨범에서 가져오기를 이용해 주세요.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        // 요청 중에 닫히거나 전환됐다면 늦게 도착한 스트림은 즉시 반납한다
        if (id !== requestId.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        if (id !== requestId.current) return;
        setReady(true);
        // 권한을 받은 뒤에 열거해야 기기 목록이 정확해요
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (id !== requestId.current) return;
        setCanSwitch(devices.filter((device) => device.kind === 'videoinput').length > 1);
      } catch (caught) {
        if (id !== requestId.current) return;
        setError(describeCameraError(caught));
      }
    },
    [stopStream],
  );

  useEffect(() => {
    void startStream(facing);
    return () => {
      requestId.current += 1;
      stopStream();
    };
  }, [facing, startStream, stopStream]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !ready || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('사진을 만들지 못했어요. 다시 시도해 주세요.');
          return;
        }
        stopStream();
        onCapture(new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  };

  return (
    <div className="camera" role="dialog" aria-modal="true" aria-label="영수증 촬영">
      <div className="camera__view">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`camera__video${facing === 'user' ? ' camera__video--mirror' : ''}`}
        />
        <div className="camera__guide" aria-hidden="true">
          <div className="camera__guide-box" />
        </div>
        {error ? (
          <div className="camera__error" role="alert">
            {error}
          </div>
        ) : null}
        <button type="button" className="camera__close" aria-label="닫기" onClick={onClose}>
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="camera__bar">
        <div className="camera__side" />
        <button type="button" className="camera__shutter" aria-label="촬영" onClick={capture} disabled={!ready} />
        {canSwitch ? (
          <button
            type="button"
            className="camera__side camera__switch"
            aria-label="카메라 전환"
            onClick={() => setFacing((current) => (current === 'environment' ? 'user' : 'environment'))}
          >
            <SwitchCamera size={22} aria-hidden="true" />
          </button>
        ) : (
          <div className="camera__side" />
        )}
      </div>
    </div>
  );
}
