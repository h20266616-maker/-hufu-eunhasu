import { Banknote, Camera, ImagePlus, LogIn, RotateCcw, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { CashbackSummary } from '../components/CashbackSummary';
import { ReceiptPaper } from '../components/ReceiptPaper';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/StateMessage';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { MAX_IMAGE_BYTES, MISSIONS } from '../data';
import { useVerifyFlow } from '../hooks/useVerifyFlow';
import { isCameraSupported } from '../utils/camera';
import { createReceiptThumbnail, resizeImageFile } from '../utils/image';

export function ReceiptPage() {
  const { uid } = useApp();
  const { push, setCameraActive } = useNav();
  const { status, errorMessage, submit, reset } = useVerifyFlow();
  const loggedIn = uid !== null;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const albumInput = useRef<HTMLInputElement>(null);
  const loading = status === 'loading';

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  // 카메라 화면이 열려 있는 동안은 하단 탭바를 완전히 숨긴다
  useEffect(() => {
    setCameraActive(cameraOpen);
    return () => setCameraActive(false);
  }, [cameraOpen, setCameraActive]);

  const acceptFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPickError('이미지 파일만 선택할 수 있어요.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPickError('사진 용량이 너무 커요. 15MB 이하 사진을 선택해 주세요.');
      return;
    }
    setPickError(null);
    reset();
    setProcessing(true);
    try {
      // 고해상도 사진은 캔버스로 줄여서 미리보기·업로드가 느려지지 않게 한다
      const resized = await resizeImageFile(file);
      setPreviewUrl(URL.createObjectURL(resized));
      try {
        // 영수증 내역에 함께 저장할 작은 썸네일. 실패해도 인증 자체는 계속 진행한다
        setImageDataUrl(await createReceiptThumbnail(file));
      } catch (thumbnailError) {
        console.error('[ReceiptPage] 썸네일을 만들지 못했어요', thumbnailError);
        setImageDataUrl(null);
      }
    } catch (error) {
      console.error('[ReceiptPage] 이미지를 처리하지 못했어요', error);
      setPickError('사진을 처리하지 못했어요. 다른 사진으로 다시 시도해 주세요.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void acceptFile(file);
  };

  // getUserMedia를 못 쓰는 환경(http 접속 등)에서는 기기 기본 카메라 앱으로 대체한다
  const handleCameraOpen = () => {
    if (isCameraSupported()) setCameraOpen(true);
    else cameraInput.current?.click();
  };

  const handleCameraCapture = (file: File) => {
    setCameraOpen(false);
    void acceptFile(file);
  };

  const handleCameraFallbackToAlbum = () => {
    setCameraOpen(false);
    albumInput.current?.click();
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setImageDataUrl(null);
    setPickError(null);
    reset();
  };

  const handleVerifyClick = () => {
    if (!loggedIn) {
      push({ name: 'login' });
      return;
    }
    void submit({ source: 'photo', imageUrl: imageDataUrl ?? undefined });
  };

  return (
    <div className="page">
      {loggedIn ? null : (
        <Card className="row">
          <div>
            <strong>로그인하고 시작해요</strong>
            <div className="sm">인증·스탬프·커뮤니티 글쓰기는 로그인 후 이용할 수 있어요</div>
          </div>
          <Button className="btn--small" icon={<LogIn size={16} aria-hidden="true" />} onClick={() => push({ name: 'login' })}>
            로그인
          </Button>
        </Card>
      )}

      <CashbackSummary />

      <section aria-labelledby="verify-title">
        <h2 id="verify-title" className="section-title">
          영수증 인증
        </h2>
        <p className="sub">
          {previewUrl ? '내용이 잘 보이는지 확인하고 인증해 주세요.' : '영수증을 촬영하거나 앨범에서 가져오세요.'}
        </p>

        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFile}
        />
        <input
          ref={albumInput}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFile}
        />

        {previewUrl ? null : (
          <div className="btn-pair">
            <Button icon={<Camera size={18} aria-hidden="true" />} onClick={handleCameraOpen} disabled={processing}>
              촬영하기
            </Button>
            <Button
              variant="line"
              icon={<ImagePlus size={18} aria-hidden="true" />}
              onClick={() => albumInput.current?.click()}
              disabled={processing}
            >
              앨범에서 가져오기
            </Button>
          </div>
        )}

        {previewUrl ? null : (
          <Button
            variant="ghost"
            icon={<Banknote size={18} aria-hidden="true" />}
            onClick={() => push({ name: 'cashQr' })}
            disabled={loading}
          >
            현금만 받는 가게인가요?
          </Button>
        )}

        {processing ? <Spinner label="사진을 준비하는 중…" /> : null}

        <ReceiptPaper imageUrl={previewUrl} loading={loading} />

        {pickError ? <ErrorState title="사진을 사용할 수 없어요" description={pickError} /> : null}
        {status === 'error' && errorMessage ? (
          <ErrorState
            title="인증에 실패했어요"
            description={errorMessage}
            action={
              <Button variant="line" onClick={handleVerifyClick}>
                다시 시도
              </Button>
            }
          />
        ) : null}

        {previewUrl ? (
          <div className="btn-pair">
            <Button variant="line" icon={<RotateCcw size={18} aria-hidden="true" />} onClick={handleRetake} disabled={loading}>
              다시 선택
            </Button>
            <Button icon={<ScanLine size={18} aria-hidden="true" />} onClick={handleVerifyClick} disabled={loading}>
              {loading ? '인증 중…' : loggedIn ? '인증하기' : '로그인하고 인증하기'}
            </Button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="mission-title">
        <h2 id="mission-title" className="section-title">
          진행 중인 미션
        </h2>
        {MISSIONS.map((mission) => (
          <Card key={mission.id} className="row">
            <div>
              <strong>{mission.title}</strong>
              <div className="sm">{mission.description}</div>
            </div>
            <Tag>{mission.badge}</Tag>
          </Card>
        ))}
      </section>

      {cameraOpen ? (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setCameraOpen(false)}
          onFallbackToAlbum={handleCameraFallbackToAlbum}
        />
      ) : null}
    </div>
  );
}
