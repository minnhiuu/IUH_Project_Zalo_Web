# BondHub Frontend Architecture Guidelines

Welcome to the official architecture guide for the BondHub project. This document provides a deep dive into our folder structure, design patterns, and coding standards.

---

## 1. High-Level Folder Anatomy

Our project follows a strict separation of concerns between global infrastructure and feature-specific modules.

```text
src/
├── assets/             # STATIC ASSETS: Images, icons, and fonts.
├── components/         # GLOBAL COMPONENTS
│   ├── ui/             # Atomic components (shadcn/ui). DO NOT edit directly.
│   └── common/         # Shared complex components (Used in >= 2 features).
├── constants/          # GLOBAL STATIC DATA
│   ├── path.ts         # Centralized route definitions.
│   ├── enum.ts         # Shared system enums (Gender, Status, etc.).
│   └── query-policies.ts # React Query global configurations.
├── features/           # BUSINESS MODULES (The core of the application).
├── layouts/            # WRAPPER COMPONENTS (e.g., MainLayout, AuthLayout).
├── lib/                # THIRD-PARTY CONFIGS
│   ├── axios-client.ts # API interceptors, headers, and base URL.
│   ├── query-client.ts # Global TanStack Query instance.
│   └── i18n/           # Global translation setup and type declarations.
├── locales/            # GLOBAL TRANSLATIONS
│   └── [vi|en]/        # Common UI text like "Submit", "Error", "Search".
├── pages/              # ROUTE ENTRY POINTS (Thin wrappers around features).
├── routes/             # ROUTING LOGIC
│   ├── index.tsx       # Main router assembly.
│   ├── private-route.ts # Auth guard logic.
│   └── [feature].routes.tsx # Modular route splitting.
├── types/              # GLOBAL TYPES (Shared across multiple domains).
├── utils/              # PURE HELPER FUNCTIONS (Date, LocalStorage, Device).
└── index.css           # DESIGN SYSTEM (Variables, Tailwind layers, and global resets).
```

---

## 2. Infrastructure Deep Dive

### 🏗️ Layouts (`src/layouts`)

Layouts are parent shells for our pages.

- **Rules**: They should only contain structural components (Sidebars, Headers) and the `<Outlet />`.
- **Naming**: `kebab-case.tsx` (e.g., `user-layout.tsx`).

### ⚙️ Lib (`src/lib`)

This is the "Engine Room" of the app.

- **Axios Client**: Handles token injection and global 401/500 error handling.
- **Query Client**: Configured with strict stale times to prevent unnecessary re-fetches.
- **i18n**: The setup file that initializes languages and namespace loading.

### 🍱 Locales (`src/locales`)

Contains "System-WIDE" text.

- **What goes here?**: Buttons ("Cancel"), generic errors ("Network Error"), or shared UI elements ("Search").
- **Feature text**: Must stay inside `features/[name]/locales/`.

### 🛣️ Routes (`src/routes`)

Modular routing configuration.

- Every feature group should have its own routes file (e.g., `user.routes.tsx`) to keep `index.tsx` clean.

### 🎨 index.css (The Design Hub)

Contains our Single Source of Truth for aesthetics.

- **Variables**: Defines `--primary`, `--muted`, `--background`.
- **Layers**: Customs `@layer base` and `@layer components`.
- **Rule**: If you need a color, you MUST use a variable from here via Tailwind (e.g., `bg-primary`).

---

## 3. Feature-Based Isolation

Every business requirement (Auth, User, Chat) must live in `src/features/`.

| Folder          | Responsibility                                                        |
| :-------------- | :-------------------------------------------------------------------- |
| **api/**        | Axios calls + specific error transforms.                              |
| **components/** | Private UI components for this feature.                               |
| **i18n/**       | Feature keys, texts, and hooks (`use-feature-text.ts`).               |
| **locales/**    | Feature-specific JSON files.                                          |
| **queries/**    | The 4-file query pattern (`keys`, `options`, `queries`, `mutations`). |
| **schemas/**    | Zod schemas and TypeScript interfaces for data.                       |
| **index.ts**    | The public API. Only export what is necessary.                        |

---

## 4. API & Data Mapping (Strict Backend Sync)

To ensure consistency and ease of maintenance, we follow a strict mapping policy between the Frontend and Backend layers.

### 🔄 1:1 Functional Mapping

Every API service function in `features/[name]/api/` MUST map **1:1 with the Backend Controller/Swagger**.

- **Function Names**: MUST mirror the Backend's action or endpoint (e.g., `getProfile`, `updateSettings`).
- **Request Models**: TypeScript interfaces for request bodies MUST match the Backend's expected JSON structure exactly.
- **Response Models**: Data returned from API functions MUST match the Backend's response structure. **Do not** transform data inside the API layer.
- **Query Hook Names**: MUST match the API function name (e.g., `userApi.getProfile` -> `useGetProfile`).

### 🏷️ Naming Convention

| Action             | API Function Prefix     | Example                        |
| :----------------- | :---------------------- | :----------------------------- |
| Read (Single/List) | `get...`                | `getUserList`, `getUserDetail` |
| Create             | `create...`             | `createMessage`                |
| Update             | `update...`             | `updateProfile`                |
| Delete             | `delete...`             | `deleteChat`                   |
| Special Logic      | `post...` / `handle...` | `postLogin`, `postVerifyOtp`   |

### 🛠️ Example (`features/user/api/user.api.ts`)

```typescript
export const userApi = {
  // GET /api/v1/users/:id -> getDetail (Map 1:1 with Swagger)
  getDetail: (id: string): Promise<UserResponse> => {
    return axiosClient.get(`/users/${id}`)
  },

  // PATCH /api/v1/users/profile -> updateProfile
  updateProfile: (data: UpdateProfileRequest): Promise<UserResponse> => {
    return axiosClient.patch('/users/profile', data)
  }
}
```

---

## 5. TanStack Query: The 4-File Mastery

We never call `useQuery` directly. We follow a strict 4-file separation for ultimate maintainability.

> **⚠️ Mapping Rule:**
>
> - **GET** Requests → Use `useQuery` or `useInfiniteQuery` (Section C).
> - **POST, PUT, PATCH, DELETE** Requests → Use `useMutation` (Section D).

### A. `queries/keys.ts` (The Index)

Prevents key collisions and makes invalidation easy.

```typescript
/**
 * Pattern: [feature, scope, ...params]
 * 1. 'all': Every query in the feature
 * 2. 'lists': Query for arrays
 * 3. 'details': Query for single items
 */
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  list: (filters: object) => [...userKeys.all, 'list', filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const
}
```

### B. `queries/options.ts` (The Brain)

Where query configuration lives. Keeps hooks thin and reusable. **Mandatory: Use `QUERY_POLICIES` from `src/constants/query-policies.ts`**.

```typescript
/**
 * 1. Use 'queryOptions' for standard fetches
 * 2. Use 'infiniteQueryOptions' for paginated lists
 * Rule: Always apply the appropriate QUERY_POLICIES
 */

// Standard List Options
export const getMessageListOptions = (params: object) =>
  queryOptions({
    queryKey: messageKeys.list(params),
    queryFn: () => messageApi.getMessageList(params),
    ...QUERY_POLICIES.LIST
  })

// ⚡ Optimization Pattern: Using 'select'
// Benefit: Components using this ONLY re-render if the count changes
export const getMessageCountOptions = () =>
  queryOptions({
    ...getMessageListOptions({}),
    select: (data) => data.length // Only returns the quantity
  })

// Infinite List Options (Using the same API but adding pagination logic)
export const getMessageListInfiniteOptions = (params: any) =>
  infiniteQueryOptions({
    queryKey: messageKeys.list({ ...params, type: 'infinite' }),
    queryFn: ({ pageParam }) => messageApi.getMessageList({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => lastPage.nextPage ?? undefined,
    ...QUERY_POLICIES.INFINITE
  })
```

### C. `queries/use-queries.ts` (Fetching - GET)

Export custom hooks for consumption. **Naming Rule: `use[ApiFunctionName]`**.

```typescript
// Dual Usage Pattern: Same feature, different consumption needs

// 1. Standard List (e.g., for a fixed dashboard view)
export const useGetMessageList = (params: object) => {
  return useQuery(getMessageListOptions(params))
}

// 2. Infinite Scroll (e.g., for the main chat window)
export const useGetMessageListInfinite = (params: object) => {
  return useInfiniteQuery(getMessageListInfiniteOptions(params))
}
```

### D. `queries/use-mutations.ts` (Modification - POST, PUT, PATCH, DELETE)

Handles `onSuccess` logic, cache invalidation, and optimistic updates. **Naming Rule: `use[ApiFunctionName]`** (e.g., `userApi.updateProfile` -> `useUpdateProfile`).

```typescript
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      // 1. Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
      // 2. Or manually update cache
      // queryClient.setQueryData(userKeys.profile(), data);
    }
  })
}
```

### E. Advanced Pattern: Prefetching (Seamless Pagination)

Improve UX by loading the next dataset before the user requests it. **Rule: Always reuse the `Options` factory.**

```typescript
export const ContactList = () => {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  // 1. Fetch current page
  const { data } = useQuery(getContactListOptions({ page, limit: 50 }))

  // 2. Prefetch next page
  useEffect(() => {
    const nextPage = page + 1
    // Standardize: Reuse the same options factory for prefetching
    queryClient.prefetchQuery(getContactListOptions({ page: nextPage, limit: 50 }))
  }, [queryClient, page])

  /* Render UI */
}
```

---

## 6. i18n Strategy: The Type-Safe Mastery

We use a 4-step architecture to ensure type safety and prevent hardcoded strings.

### Step 1: `locales/vi.json` (The Data)

The source of truth for translations.

```json
{
  "profile": {
    "title": "Thông tin tài khoản",
    "edit": "Chỉnh sửa"
  }
}
```

### Step 2: `i18n/[feature].keys.ts` (The Mapping)

Define the path to the translation keys. This makes it easy to find where a key is used.

```typescript
export const userKeys = {
  profile: {
    title: 'user:profile.title',
    edit: 'user:profile.edit'
  }
}
```

### Step 3: `i18n/[feature].texts.ts` (The Factory)

A function that receives the `t` function and returns the final text structure.

```typescript
export const userTexts = (t: TFunction) => ({
  profile: {
    title: t(userKeys.profile.title),
    edit: t(userKeys.profile.edit)
  }
})
```

### Step 4: `i18n/use-user-text.ts` (The Hook)

The consumption point for components.

```typescript
export const useUserText = () => {
  const { t } = useTranslation('user') // Specify namespace

  return {
    text: userTexts(t)
  }
}
```

### 💡 Why this way?

- **Type Safety**: If you rename a key in the JSON, you only update it once in `.keys.ts`.
- **IntelliSense**: IDE suggests keys like `text.profile.title` automatically.
- **Maintainability**: Components don't deal with `t('user:profile.title')` strings.

---

## 7. Git & Workflow Guidelines

Read more: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)

---

## 8. Pre-Commit Verification

1. `npm run prettier:fix`
2. `npm run lint`
3. Ensure zero hardcoded strings in components.
4. Ensure all colors use `index.css` variables.
