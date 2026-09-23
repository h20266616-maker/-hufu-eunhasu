import type { ReactElement } from 'react';
import { CashQrPage } from '../pages/CashQrPage';
import { CommunityPage } from '../pages/CommunityPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { MapPage } from '../pages/MapPage';
import { MyPage } from '../pages/MyPage';
import { MyPostsPage } from '../pages/MyPostsPage';
import { NotificationSettingsPage } from '../pages/NotificationSettingsPage';
import { PersonalInfoPage } from '../pages/PersonalInfoPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { PostWritePage } from '../pages/PostWritePage';
import { ReceiptHistoryPage } from '../pages/ReceiptHistoryPage';
import { ReceiptPage } from '../pages/ReceiptPage';
import { ShopPage } from '../pages/ShopPage';
import { SoldierVerifyPage } from '../pages/SoldierVerifyPage';
import { StampPage } from '../pages/StampPage';
import { VerifyResultPage } from '../pages/VerifyResultPage';
import type { Route } from '../types';

export function Router({ route }: { route: Route }): ReactElement {
  switch (route.name) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'receipt':
      return <ReceiptPage />;
    case 'cashQr':
      return <CashQrPage />;
    case 'verifyResult':
      return <VerifyResultPage receipt={route.receipt} stampId={route.stampId} rewardIds={route.rewardIds} />;
    case 'map':
      return <MapPage />;
    case 'stamp':
      return <StampPage />;
    case 'shop':
      return <ShopPage />;
    case 'my':
      return <MyPage />;
    case 'personalInfo':
      return <PersonalInfoPage />;
    case 'soldierVerify':
      return <SoldierVerifyPage />;
    case 'receiptHistory':
      return <ReceiptHistoryPage />;
    case 'notifications':
      return <NotificationSettingsPage />;
    case 'myPosts':
      return <MyPostsPage />;
    case 'community':
      return <CommunityPage board={route.board} />;
    case 'postDetail':
      return <PostDetailPage postId={route.postId} />;
    case 'postWrite':
      return <PostWritePage board={route.board} />;
  }
}
