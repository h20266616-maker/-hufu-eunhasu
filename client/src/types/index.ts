export type TabId = 'receipt' | 'map' | 'shop' | 'stamp' | 'community' | 'my';
export type Role = 'traveler' | 'owner';
export type Board = 'traveler' | 'owner';

export type ReceiptCategory = '식비' | '체험' | '숙박' | '특산물';
export type ReceiptSource = 'photo' | 'cash';

export type IconKey =
  | 'island'
  | 'fish'
  | 'lake'
  | 'dam'
  | 'valley'
  | 'bridge'
  | 'market'
  | 'boat'
  | 'restaurant'
  | 'bike'
  | 'produce'
  | 'drink';

export interface StampSpot {
  id: string;
  name: string;
  icon: IconKey;
  hint: string;
  lat: number;
  lng: number;
}

export interface StampRecord {
  spotId: string;
  earnedAt: string;
}

export interface StampReward {
  id: string;
  kind: 'coupon' | 'badge';
  threshold: number;
  title: string;
  description: string;
  cash: number;
  /** 군인 인증 회원에게만 보이는 특전 */
  soldierOnly?: boolean;
}

export type PlaceKind = 'eat' | 'cafe' | 'see';
export type MapFilter = 'all' | PlaceKind | 'bike';

export interface MapPlace {
  id: string;
  kind: PlaceKind;
  name: string;
  description: string;
  icon: IconKey;
  lat: number;
  lng: number;
  stampId?: string;
}

export interface BikeStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  bikes: number;
  distance: string;
}

export interface MapMarker {
  id: string;
  kind: 'eat' | 'cafe' | 'see' | 'bike';
  icon: IconKey;
  label: string;
  lat: number;
  lng: number;
  badge?: number;
}

export interface RideState {
  stationId: string;
  startedAt: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: IconKey;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  badge: string;
}

export interface CashbackTier {
  minCount: number;
  rate: number;
}

export interface MockReceipt {
  shop: string;
  amount: number;
  category: ReceiptCategory;
  stampId: string;
}

export interface SampleReceiptLine {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptRecord {
  id: string;
  shop: string;
  amount: number;
  category: ReceiptCategory;
  source: ReceiptSource;
  rate: number;
  cashback: number;
  createdAt: string;
  /** 촬영한 영수증 사진 (작은 썸네일 data URL). 현금 QR 인증이나 이전 기록에는 없을 수 있다 */
  imageUrl?: string;
}

export interface Profile {
  nickname: string;
  name: string;
  phone: string;
  email: string;
  bankName: string;
  account: string;
  role: Role;
  consent: boolean;
  soldierVerified: boolean;
  soldierUnit: string;
  soldierDischargeDate: string;
}

export type NotificationKey = 'cashback' | 'stamp' | 'community' | 'marketing';

export interface NotificationSetting {
  id: NotificationKey;
  label: string;
  description: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorUid: string;
  body: string;
  createdAt: number;
  mine: boolean;
}

export interface Post {
  id: string;
  board: Board;
  category: string;
  title: string;
  body: string;
  author: string;
  authorUid: string;
  createdAt: number;
  likes: number;
  liked: boolean;
  commentCount: number;
  mine: boolean;
}

export interface SeedComment {
  author: string;
  body: string;
  minutesAgo: number;
}

export interface SeedPost {
  board: Board;
  category: string;
  title: string;
  body: string;
  author: string;
  minutesAgo: number;
  likes: number;
  comments: SeedComment[];
}

export type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'receipt' }
  | { name: 'cashQr' }
  | { name: 'verifyResult'; receipt: ReceiptRecord; stampId: string | null; rewardIds: string[] }
  | { name: 'map' }
  | { name: 'stamp' }
  | { name: 'shop' }
  | { name: 'my' }
  | { name: 'personalInfo' }
  | { name: 'soldierVerify' }
  | { name: 'receiptHistory' }
  | { name: 'notifications' }
  | { name: 'myPosts' }
  | { name: 'community'; board?: Board }
  | { name: 'postDetail'; postId: string }
  | { name: 'postWrite'; board: Board };
