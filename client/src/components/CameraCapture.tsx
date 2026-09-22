import { Images, SwitchCamera, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isCameraSupported } from '../utils/camera';

type Facing = 'environment' | 'user';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  /** 카메라를 못 쓰는 상황에서 앨범으로 바로 넘어갈 수 있게 한다 */
  onFallbackToAlbum: () => void;
}

const JPEG_QUALITY = 0.92;
/** 이 값 이상이어야 프레임 데이터가 실제로 준비된 것이다 (HAVE_CURRENT_DATA) */
const MIN_READY_STATE = 2;
const INSECURE_CONTEXT_MESSAGE = '보안 연결(https)이 아니라서 카메라를 열 수 없어요. 앨범에서 가져와 주세요.';

function describeCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') return '카메라 권한이 거부됐어요. 브라우저 설정에서 카메라 권한을 허용한 뒤 다시 시도해 주세요.';
  if (name === 'NotFoundError') return '사용 가능한 카메라를 찾지 못했어요.';
  if (name === 'NotReadableError') return '다른 앱이 카메라를 사용 중이에요. 다른 앱을 닫고 다시 시도해 주세요.';
  return '카메라를 시작하지 못했어요. 앨범에서 가져오기를 이용해 주세요.';
}

/** play()가 resolve돼도 프레임이 아직 없을 수 있어서, readyState가 올라올 때까지 기다린다 */
function waitForVideoFrame(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= MIN_READY_STATE) return Promise.resolve();
  return new Promise((resolve) => {
    const handle = () => {
      if (video.readyState >= MIN_READY_STATE) {
        video.removeEventListener('loadeddata', handle);
        resolve();
      }
    };
    video.addEventListener('loadeddata', handle);
  });
}

export function CameraCapture({ onCapture, onClose, onFallbackToAlbum }: CameraCaptureProps) {
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

      if (!window.isSecureContext) {
        setError(INSECURE_CONTEXT_MESSAGE);
        return;
      }
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
          await waitForVideoFrame(video);
        }
        if (id !== requestId.current) return;
        setReady(true);
        // 권한을 받은 뒤에 열거해야 기기 목록이 정확해요
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (id !== requestId.current) return;
        setCanSwitch(devices.filter((device) => device.kind === 'videoinput').length > 1);
      } catch (caught) {
        if (id !== requestId.current) return;
        console.error('[CameraCapture] 카메라를 시작하지 못했어요', caught);
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
    if (!video || !ready || video.readyState < MIN_READY_STATE || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('[CameraCapture] canvas 2d context를 만들지 못했어요');
      setError('사진을 만들지 못했어요. 다시 시도해 주세요.');
      return;
    }
    context.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('[CameraCapture] canvas.toBlob이 빈 값을 반환했어요');
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
            <p>{error}</p>
            <button type="button" className="camera__error-action" onClick={onFallbackToAlbum}>
              <Images size={18} aria-hidden="true" />
              앨범에서 가져오기
            </button>
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
