# LinkedOut DB 설계

## 기술 스택
- **MySQL**: 메인 DB (영구 데이터, 관계형, ACID 필요한 결제 등)
- **Redis**: 세션, 인증 코드, 조회수 카운터, 캐시

---

## MySQL 테이블 설계

### Users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| email | VARCHAR(255) UNIQUE NOT NULL | |
| password_hash | VARCHAR(255) | 소셜 로그인 시 NULL 가능 |
| phone | VARCHAR(20) UNIQUE NOT NULL | 다계정 방지 핵심 |
| phone_verified | BOOLEAN DEFAULT FALSE | |
| nickname | VARCHAR(50) NOT NULL | |
| is_real_name | BOOLEAN DEFAULT FALSE | 실명 여부 (강제 아님) |
| job_category | VARCHAR(50) NOT NULL | MVP: IT/개발 직군 |
| profile_image_url | VARCHAR(500) | |
| free_views_remaining | INT DEFAULT 3 | 신규 가입자 무료 열람 횟수 |
| trust_score | INT DEFAULT 100 | 허위 신고 누적 시 차감 |
| role | ENUM('user', 'admin') DEFAULT 'user' | |
| created_at | DATETIME DEFAULT NOW() | |
| updated_at | DATETIME | |

---

### Profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK(Users.id) UNIQUE | |
| bio | TEXT | 자기소개 |
| github_url | VARCHAR(500) | |
| linkedin_url | VARCHAR(500) | |
| portfolio_url | VARCHAR(500) | |
| updated_at | DATETIME | |

---

### Experiences
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK(Users.id) NOT NULL | |
| title | VARCHAR(200) NOT NULL | |
| summary | VARCHAR(500) NOT NULL | 한 줄 요약 |
| category | VARCHAR(50) NOT NULL | |
| problem | TEXT NOT NULL | 당시 문제 상황 |
| role | TEXT NOT NULL | 맡은 역할 |
| goal | TEXT NOT NULL | 목표 |
| action | TEXT NOT NULL | 내가 한 행동 |
| result | TEXT NOT NULL | 결과 |
| achievement | TEXT | 수치 기반 성과 |
| lesson | TEXT | 배운 점 |
| status | ENUM('draft','pending','approved','rejected','hidden') DEFAULT 'draft' | |
| grade | DECIMAL(2,1) | 확정 등급 (1.0~9.0), 승인 전 NULL |
| view_count | INT DEFAULT 0 | |
| created_at | DATETIME DEFAULT NOW() | |
| updated_at | DATETIME | |

---

### ExperienceProofs (증빙 자료)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| experience_id | BIGINT FK(Experiences.id) NOT NULL | |
| file_url | VARCHAR(500) NOT NULL | 업로드된 파일 경로 |
| file_type | ENUM('image','pdf','url') NOT NULL | |
| ai_verified | BOOLEAN DEFAULT FALSE | AI 진위 판단 결과 |
| ai_confidence | FLOAT | AI 신뢰도 점수 (0~1) |
| created_at | DATETIME DEFAULT NOW() | |

---

### Votes (평가/투표)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| experience_id | BIGINT FK(Experiences.id) NOT NULL | |
| voter_id | BIGINT FK(Users.id) NOT NULL | |
| difficulty | TINYINT NOT NULL | 난이도 (1~9) |
| impact | TINYINT NOT NULL | 임팩트 (1~9) |
| work_value | TINYINT NOT NULL | 실무 가치 (1~9) |
| authenticity | TINYINT NOT NULL | 진정성 (1~9) |
| created_at | DATETIME DEFAULT NOW() | |
| updated_at | DATETIME | |
| UNIQUE | (experience_id, voter_id) | 중복 투표 방지 |

---

### ExperienceGrades (경험 등급)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| experience_id | BIGINT FK(Experiences.id) UNIQUE NOT NULL | |
| grade | DECIMAL(2,1) NOT NULL | 최종 등급 (1.0~9.0) |
| vote_count | INT DEFAULT 0 | 투표에 참여한 인원 수 |
| admin_adjusted | BOOLEAN DEFAULT FALSE | 운영자가 수동 조정했는지 여부 |
| graded_at | DATETIME DEFAULT NOW() | |

---

### UserGrades (사용자 종합 등급)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK(Users.id) UNIQUE NOT NULL | |
| total_score | INT DEFAULT 0 | 상위 100개 경험 점수 합산 (최대 900) |
| experience_count | INT DEFAULT 0 | 승인된 전체 경험 수 |
| updated_at | DATETIME | |

**종합 점수 계산 방식**
- 경험 점수 = `10 - grade` (1등급 → 9점, 9등급 → 1점)
- 승인된 경험 중 점수 상위 100개의 합 = total_score
- **갱신 시점**: 경험이 승인되어 등급이 확정되는 순간 즉시 재계산
- Redis `user_grade:{user_id}` 에 캐싱 → 경험 승인 시 캐시 무효화 후 재계산

---

### PremiumContents (프리미엄 콘텐츠)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| experience_id | BIGINT FK(Experiences.id) UNIQUE NOT NULL | |
| preview | TEXT NOT NULL | 무료 미리보기 |
| content | TEXT NOT NULL | 전체 내용 (결제 후 열람) |
| price | INT DEFAULT 0 | 0이면 무료 |
| status | ENUM('draft','pending','approved') DEFAULT 'draft' | |
| created_at | DATETIME DEFAULT NOW() | |
| updated_at | DATETIME | |

---

### Purchases (구매 내역)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK(Users.id) NOT NULL | |
| premium_content_id | BIGINT FK(PremiumContents.id) NOT NULL | |
| amount | INT NOT NULL | 결제 금액 (원) |
| payment_key | VARCHAR(200) | PG사 결제 키 |
| status | ENUM('completed','refunded') DEFAULT 'completed' | |
| purchased_at | DATETIME DEFAULT NOW() | |
| UNIQUE | (user_id, premium_content_id) | 중복 구매 방지 |

---

### Reports (신고)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| reporter_id | BIGINT FK(Users.id) NOT NULL | |
| experience_id | BIGINT FK(Experiences.id) NOT NULL | |
| reason | ENUM('fake','stolen','inappropriate','privacy','other') NOT NULL | |
| detail | TEXT | |
| status | ENUM('pending','reviewed','dismissed') DEFAULT 'pending' | |
| created_at | DATETIME DEFAULT NOW() | |
| UNIQUE | (reporter_id, experience_id) | 중복 신고 방지 |

---

### AdminReviews (운영자 검수)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| experience_id | BIGINT FK(Experiences.id) NOT NULL | |
| admin_id | BIGINT FK(Users.id) NOT NULL | |
| status | ENUM('approved','rejected','pending') NOT NULL | |
| grade_assigned | DECIMAL(2,1) | 운영자가 부여한 등급 |
| note | TEXT | 반려/보류 사유 |
| reviewed_at | DATETIME DEFAULT NOW() | |

---

## Redis 설계

| 키 | 타입 | TTL | 용도 |
|----|------|-----|------|
| `session:{user_id}` | String | 7일 | 로그인 세션 토큰 |
| `phone_verify:{phone}` | String | 5분 | 휴대폰 인증 코드 |
| `view_count:{experience_id}` | String (counter) | 없음 | 조회수 실시간 카운터 → 1시간마다 MySQL flush |
| `popular_experiences` | Sorted Set | 1시간 | 인기순 정렬 캐시 |
| `user_grade:{user_id}` | String | 없음 | 종합 점수 캐시 → 경험 승인 시 무효화 |
| `free_views:{user_id}` | String | 없음 | 무료 열람 잔여 횟수 캐시 |

---

## 테이블 관계 요약

```
Users 1:1 Profiles
Users 1:N Experiences
Users 1:1 UserGrades
Experiences 1:N ExperienceProofs
Experiences 1:N Votes
Experiences 1:1 ExperienceGrades
Experiences 1:1 PremiumContents
Experiences 1:N Reports
Experiences 1:N AdminReviews
Users 1:N Purchases
PremiumContents 1:N Purchases
```
