# الحالة الراهنة للمشروع (Current State)

تم إنشاء هذا المستند بناءً على الفحص الشامل والقراءة المباشرة لكود المشروع الحالي في مستودع `smart-schedule`. يعكس هذا التوثيق واقع الكود الفعلي دون أي افتراضات أو إضافات غير موجودة.

---

## 1. شجرة الملفات تحت `src` (وملفات الاختبارات)

### 1.1. حالة مجلد الاختبارات (`tests`)
- **غير متوفر**: لا يوجد أي مجلد باسم `tests` أو `__tests__` أو `test` داخل المشروع، كما لا توجد أي ملفات اختبارات وحدة أو تكامل (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`).

### 1.2. شجرة ملفات `src`
```text
src/
├── app/
│   ├── (main)/
│   │   └── schedule-planner.tsx    # شاشة مخطط الجدول الرئيسية
│   ├── _layout.tsx                 # موجه التطبيق الجذري وإعدادات RTL و DialogProvider
│   └── index.tsx                   # نقطة الدخول وفحص جلسة المستخدم وشاشات المصادقة
├── components/
│   ├── auth/
│   │   ├── auth-container.tsx      # حاوية التبديل بين شاشات المصادقة المختلفة
│   │   ├── forgot-password.tsx     # شاشة طلب رمز استعادة كلمة المرور
│   │   ├── login.tsx               # شاشة تسجيل الدخول
│   │   ├── register.tsx            # شاشة إنشاء حساب جديد
│   │   ├── reset-password.tsx      # شاشة تعيين كلمة المرور الجديدة
│   │   └── verify-code.tsx         # شاشة التحقق من الرمز المرسل
│   ├── profile/
│   │   ├── change-password.tsx     # نافذة تغيير كلمة المرور للمستخدم المسجل
│   │   └── edit-profile.tsx        # نافذة تعديل بيانات الملف الشخصي
│   ├── schedule/
│   │   ├── colors.ts               # لوحة ألوان واجهة الجداول والسمات
│   │   ├── CourseFormModal.tsx     # نافذة إضافة/تعديل مقرر أو شعبة يدوياً
│   │   ├── data.ts                 # أنواع البيانات الخاصة بالمقررات والشعب والجلسات
│   │   ├── offered-courses.tsx     # شاشة استعراض وبحث الشعب المطروحة
│   │   ├── preferences.tsx         # شاشة إعداد تفضيلات الجدول وتوليد المقترحات
│   │   ├── registered-courses.tsx  # شاشة إدارة المقررات المسجلة حالياً
│   │   ├── schedule-planner.tsx    # الشاشة الحاوية للتنقل بين تبويبات الجدول الأربعة
│   │   ├── ScheduleContext.tsx     # سياق إدارة حالة الجداول والتفضيلات وعمليات الـ API
│   │   └── schedules-view.tsx      # شاشة عرض الجداول (أجندة/قائمة) وخطة التنفيذ وتكبير العرض
│   └── ui/
│       ├── app-dialog.tsx          # المكون الحواري الموحد للتنبيهات والأخطاء والتأكيدات
│       └── dialog-provider.tsx     # مزود سياق النوافذ الحوارية لكامل التطبيق
├── lib/
│   ├── api.ts                      # عميل استدعاء الـ HTTP (fetch) وإدارة الأخطاء والمصادقة
│   ├── auth.ts                     # دوال واستدعاءات API الخاصة بالمصادقة والحساب الشخصي
│   ├── mappers.ts                  # دوال تحويل البيانات بين واجهات الـ API ومكونات الـ UI
│   ├── schedule-api.ts             # استدعاءات API لإدارة الشعب والجداول والمقترحات والتفضيلات
│   └── token-storage.ts            # إدارة حفظ واسترجاع التوكن عبر SecureStore أو LocalStorage
└── global.css                      # ملف إعدادات أنماط Tailwind / NativeWind الأساسية
```

---

## 2. المسارات (Routes) ونقاط الاتصال (Endpoints)

المشروع يمثل تطبيق واجهة أمامية للجوال مبنياً باستخدام Expo Router. لذلك تنقسم المسارات إلى:
1. **مسارات الملاحة للشاشات (Expo Router Screens)**.
2. **مسارات الـ API الخارجية (HTTP Endpoints)** التي يستدعيها التطبيق للتواصل مع الخادم الخلفي.

> **ملاحظة:** لا يحتوي مجلد `src/app` على أي مسارات خادم داخلية من نوع `+api.ts`؛ جميع عمليات البيانات تعتمد على خادم خارجي محدد عبر المتغير `EXPO_PUBLIC_API_URL`.

### 2.1. مسارات الشاشات في التطبيق (Expo Router Navigation)
| المسار (Path) | الملف المعالج | الوصف والدور |
| :--- | :--- | :--- |
| `/` (Index) | `src/app/index.tsx` | فحص حالة تسجيل الدخول عبر التوكن؛ عرض شاشات المصادقة في حال عدم وجود جلسة، أو التحويل التلقائي لشاشة المخطط. |
| `/(main)/schedule-planner` | `src/app/(main)/schedule-planner.tsx` | شاشة المخطط الرئيسية التي تستدعي المكون `SchedulePlanner`. |

### 2.2. مسارات الـ API المستدعاة من قبل التطبيق (HTTP API Endpoints)
تتم إدارة هذه الاستدعاءات داخل ملفات `src/lib/` ويتم إرسالها إلى الخادم الخلفي المحدد في المتغير `EXPO_PUBLIC_API_URL`:

#### أ) مسارات المصادقة والملف الشخصي (`src/lib/auth.ts`)
| Method | Endpoint Path | الدالة والملف المعالج | الاستخدام في الواجهة |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `login` في `src/lib/auth.ts` | تسجيل الدخول باستخدام البريد وكلمة المرور وحفظ التوكن. |
| `POST` | `/api/auth/register` | `register` في `src/lib/auth.ts` | إنشاء حساب طالب جديد. |
| `GET` | `/api/auth/me` | `fetchMe` في `src/lib/auth.ts` | جلب بيانات الطالب المسجل حالياً والتحقق من صلاحية التوكن. |
| `PATCH` | `/api/auth/me` | `updateProfile` في `src/lib/auth.ts` | تحديث بيانات الملف الشخصي (الاسم، البريد، الجوال، التخصص، إلخ). |
| `POST` | `/api/auth/forgot-password` | `requestPasswordReset` في `src/lib/auth.ts` | طلب إرسال رمز التحقق لاستعادة كلمة المرور عبر البريد. |
| `POST` | `/api/auth/verify-code` | `verifyResetCode` في `src/lib/auth.ts` | التحقق من رمز الاستعادة واستلام `resetToken`. |
| `POST` | `/api/auth/reset-password` | `resetPassword` في `src/lib/auth.ts` | تعيين كلمة المرور الجديدة باستخدام `resetToken`. |
| `PATCH` | `/api/auth/password` | `changePassword` في `src/lib/auth.ts` | تغيير كلمة المرور من داخل التطبيق وحفظ التوكن الجديد. |

#### ب) مسارات المقررات والشعب والجداول والتفضيلات (`src/lib/schedule-api.ts`)
| Method | Endpoint Path | الدالة والملف المعالج | الاستخدام في الواجهة |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sections` | `fetchSections` في `src/lib/schedule-api.ts` | جلب قائمة الشعب الدراسية المطروحة. |
| `POST` | `/api/sections` | `createSection` في `src/lib/schedule-api.ts` | إضافة شعبة دراسية جديدة يدوياً. |
| `PUT` | `/api/sections/:id` | `updateSection` في `src/lib/schedule-api.ts` | تعديل بيانات شعبة دراسية مطروحة. |
| `PATCH` | `/api/sections/:id/status` | `patchSectionStatus` في `src/lib/schedule-api.ts` | تبديل حالة الشعبة بين مفتوحة ومغلقة. |
| `DELETE` | `/api/sections/:id` | `removeSection` في `src/lib/schedule-api.ts` | حذف شعبة دراسية مطروحة. |
| `GET` | `/api/schedules/original` | `fetchOriginal` في `src/lib/schedule-api.ts` | استرجاع الجدول الدراسي الفعلي للمستخدم وشعبه المسجلة. |
| `POST` | `/api/schedules/original/sections` | `registerSectionApi` في `src/lib/schedule-api.ts` | إضافة/تسجيل شعبة في الجدول الأصلي (مع خيار الاستبدال وفحص المتطلبات). |
| `DELETE` | `/api/schedules/original/sections/:sectionId` | `unregisterSectionApi` في `src/lib/schedule-api.ts` | إلغاء تسجيل شعبة من الجدول الأصلي. |
| `PATCH` | `/api/schedules/original/courses/:code/lock` | `setCourseLockApi` في `src/lib/schedule-api.ts` | تثبيت أو إلغاء تثبيت مقرر لمنع استبداله عند توليد المقترحات. |
| `GET` | `/api/preferences` | `fetchPreferences` في `src/lib/schedule-api.ts` | جلب تفضيلات الطالب المسجلة للجدول. |
| `PUT` | `/api/preferences` | `savePreferencesApi` في `src/lib/schedule-api.ts` | حفظ وتحديث تفضيلات الطالب (أوقات الدوام، أيام الأوف، الساعات، أوقات الراحة). |
| `POST` | `/api/schedules/generate` | `generateApi` في `src/lib/schedule-api.ts` | إرسال طلب توليد المقترحات الذكية بناءً على التفضيلات. |
| `GET` | `/api/schedules/suggestions` | `fetchSuggestions` في `src/lib/schedule-api.ts` | جلب المقترحات المولدة مسبقاً والتقييم الأصلي. |
| `POST` | `/api/schedules/:id/apply` | `applySuggestionApi` في `src/lib/schedule-api.ts` | اعتماد مقترح جدول معين وتطبيقه ليصبح الجدول الأصلي. |

---

## 3. ملخص `schema.prisma`

- **حالة الملف في المشروع:** **غير موجود**.
- **السبب الفعلي في الكود:** هذا المشروع يمثل **تطبيق واجهة أمامية للهواتف الذكية (Expo / React Native Client)** فقط، ولا يحتوي على خادم محلي أو طبقة ORM لقاعدة البيانات، ولا توجد حزمة `@prisma/client` أو `prisma` ضمن تبعيات `package.json`.
- **نماذج البيانات (Data Contracts / Interfaces) الموازية في الكود:**
  يعتمد التطبيق على هياكل TypeScript معرفة في `src/lib/mappers.ts` و `src/lib/auth.ts` و `src/components/schedule/data.ts` لتمثيل كائنات الخادم:
  - **`Student`**: (`id`, `name`, `email`, `gender`, `studentId`, `major`, `academicLevel`, `phone`, `dob`).
  - **`ApiSection`**: (`id`, `name`, `code`, `credits`, `section`, `type: THEORY | PRACTICAL`, `mode: ONSITE | REMOTE`, `status: OPEN | CLOSED`, `instructor`, `room`, `sessions`, `prerequisites`).
  - **`ApiSession`**: (`id`, `day: SUN | MON | TUE | WED | THU`, `startTime`, `endTime`).
  - **`ApiSchedule`**: (`id`, `totalCredits`, `maxCredits`, `overCredits`, `sections: (ApiSection & { locked: boolean })[]`).
  - **`ApiPreferences`**: (`preferredTime: MORNING | EVENING | ANY`, `offDays`, `density: COMPACT | MEDIUM | RELAXED`, `maxBreakMinutes`, `minCredits`, `maxCredits`, `blockedTimes`).
  - **`ApiSuggestion`**: (`id`, `score`, `perks`, `totalCredits`, `changes: { added, dropped, swapped }`, `prerequisiteWarnings`, `sections`).

---

## 4. أوامر التشغيل والاختبار من `package.json`

تتطابق الأوامر المتاحة تماماً مع ما هو مسجل في حقل `scripts` بملف `package.json`:

```json
"scripts": {
  "start": "expo start",
  "reset-project": "node ./scripts/reset-project.js",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint"
}
```

### 4.1. تفاصيل أوامر التشغيل:
- **`npm run start`** (أو `npx expo start`): تشغيل خادم التطوير التفاعلي لـ Expo (Metro bundler).
- **`npm run android`** (أو `npx expo start --android`): تشغيل خادم التطوير وفتح التطبيق مباشرة على محاكي أندرويد أو جهاز متصل.
- **`npm run ios`** (أو `npx expo start --ios`): تشغيل خادم التطوير وفتح التطبيق على محاكي iOS.
- **`npm run web`** (أو `npx expo start --web`): تشغيل خادم التطوير وتجهيز نسخة المتصفح (Web).
- **`npm run reset-project`**: تنفيذ سكربت `scripts/reset-project.js` لنقل/تصفير هيكل المشروع الحالي.

### 4.2. تفاصيل أوامر الفحص والاختبار:
- **`npm run lint`** (أو `npx expo lint`): فحص جودة وتنسيق الكود المصدري باستخدام ESLint (ينفذ بنجاح دون أي تحذيرات أو أخطاء).
- **أوامر الاختبار (Tests):** **لا يوجد أي أمر اختبار** (مثل `npm test` أو `test`) معرف في `package.json`، ولا توجد أدوات اختبار مثبتة ضمن `devDependencies`.
- **أمر التحقق من الأنواع (Type Checking):** يمكن تشغيله يدوياً عبر `npx tsc --noEmit` (ينفذ بنجاح 0 أخطاء).

---

## 5. قائمة الـ TODO والكود غير المكتمل

بناءً على الفحص الآلي واليدوي لكافة ملفات الكود المصدري تحت `src`:

1. **وسوم TODO و FIXME:**
   - **لا توجد أي وسوم `TODO` أو `FIXME` أو `XXX`** في أي ملف من ملفات الكود المصدري تحت `src`.

2. **حالة اكتمال الربط والوظائف:**
   - دوال المصادقة وإدارة الحساب مربوطة فعلياً بالـ API مع معالجة الأخطاء وحفظ التوكن وحذفه عند انتهاء الصلاحية (401).
   - دوال إدارة الشعب والمقررات والتفضيلات وتوليد وتطبيق المقترحات مربوطة بالـ API بالكامل مع إدارة حالات التحميل (`ActivityIndicator`) والأخطاء ونوافذ الحوار المخصصة (`AppDialog`).
   - فحص وتوافق الأنواع (`TypeScript`) سليم ومكتمل بنسبة 100% بدون أي أخطاء (`npx tsc --noEmit`).
   - فحص التنسيق والجودة (`ESLint`) نظيف تماماً (`npx expo lint`).

3. **النواقص الملحوظة في بنية المشروع العامة (دون اختراع):**
   - غياب أي إطار لاختبارات الوحدة أو التكامل (لا يوجد `jest`, `@testing-library/react-native`, أو سكربت `test`).
   - مجلد `example/` الموجود في جذر المشروع فارغ تماماً.
