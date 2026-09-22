#!/usr/bin/env node
// 커뮤니티 시드 게시글을 Firestore에 한 번만 심는 관리자 스크립트.
// 보안 규칙(firestore.rules)은 클라이언트 SDK만 제한하므로, admin SDK로 우회해서 씁니다.
//
// 사용법:
//   1. Firebase 콘솔 > 프로젝트 설정 > 서비스 계정에서 키 JSON을 내려받는다.
//   2. cd client && node scripts/seedCommunity.mjs ./serviceAccountKey.json
//      (경로를 생략하면 GOOGLE_APPLICATION_CREDENTIALS 환경변수를 사용한다)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import admin from 'firebase-admin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = process.argv[2];

if (keyPath) {
  const serviceAccount = JSON.parse(readFileSync(path.resolve(keyPath), 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();
const MINUTE_MS = 60_000;

// src/data/community.ts가 읽는 것과 같은 파일이라 앱 화면과 항상 같은 내용을 심는다
const seedPath = path.join(__dirname, '..', 'src', 'data', 'seed-posts.json');
const SEED_POSTS = JSON.parse(readFileSync(seedPath, 'utf8'));

async function main() {
  const now = Date.now();
  const existing = await db.collection('posts').limit(1).get();
  if (!existing.empty) {
    console.log('posts 컬렉션에 이미 문서가 있어요. 중복 방지를 위해 아무 것도 하지 않았어요.');
    return;
  }

  for (const [index, seed] of SEED_POSTS.entries()) {
    const authorUid = `seed-${index}`;
    const postRef = await db.collection('posts').add({
      board: seed.board,
      category: seed.category,
      title: seed.title,
      body: seed.body,
      author: seed.author,
      authorUid,
      createdAt: now - seed.minutesAgo * MINUTE_MS,
      likedBy: [],
      commentCount: seed.comments.length,
    });

    for (const [commentIndex, comment] of seed.comments.entries()) {
      await postRef.collection('comments').add({
        author: comment.author,
        authorUid: `seed-${index}-comment-${commentIndex}`,
        body: comment.body,
        createdAt: now - comment.minutesAgo * MINUTE_MS,
      });
    }
    console.log(`+ ${seed.title}`);
  }

  console.log(`완료: 게시글 ${SEED_POSTS.length}개를 심었어요.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
