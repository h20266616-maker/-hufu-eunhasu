/** http 접속이나 구형 WebView에서는 mediaDevices 자체가 없다 */
export function isCameraSupported(): boolean {
  return typeof navigator.mediaDevices?.getUserMedia === 'function';
}
