# Pull Request

## Jira Ticket

- [BH-201](https://tranngochuyen.atlassian.net/browse/BH-201): Feature 13: Message search
- [BH-207](https://tranngochuyen.atlassian.net/browse/BH-207): Build Message Search UI
- [BH-206](https://tranngochuyen.atlassian.net/browse/BH-206): Implement jump-to-message functionality from search results
- [BH-229](https://tranngochuyen.atlassian.net/browse/BH-229): Build Message Search screen

**Related backend tickets covered by this PR:**

- [BH-202](https://tranngochuyen.atlassian.net/browse/BH-202): Setup Elasticsearch for message search
- [BH-203](https://tranngochuyen.atlassian.net/browse/BH-203): Implement message index sync
- [BH-204](https://tranngochuyen.atlassian.net/browse/BH-204): Develop message search API
- [BH-205](https://tranngochuyen.atlassian.net/browse/BH-205): Enforce visibility and security rules for search results
- [BH-291](https://tranngochuyen.atlassian.net/browse/BH-291): Refactor sync/reindex flow and harden failed-event recovery

> This PR body is written from the frontend branch commits after `381b63aee8058eee4eb2ca914898b3fd70ac9f6a`, and only covers the real `search + message` scope in `IUH_Project_Zalo_Web`.

---

## Description

Frontend Web implementation for message search inside chat.

This PR adds a dedicated message-search sidebar, integrates the backend message-search APIs, supports jump-to-message via the cursor-based V2 messages API, improves scroll stability during jump navigation, and updates the admin Elasticsearch UI to work with module-based indexes and DLQ retry flows.

---

## Type of change

- [ ] Bug fix
- [x] New feature
- [x] UI / UX update
- [x] Refactor
- [x] Config / Infrastructure update
- [ ] Other (please describe)

---

## What was changed?

### 1. Message Search Sidebar

| Area | Logic |
| --- | --- |
| Search sidebar entry | Search is opened directly from the chat sidebar / chat window flow instead of a separate page. |
| Search filters | User can search by keyword, sender, and date range. |
| Search sections | Results are split into `Messages` and `Files`. |
| Overview mode | Sidebar first loads compact overview data for both sections. |
| Expand mode | When user expands a section, FE switches to paged infinite results for that section. |
| Empty states | FE shows dedicated empty-keyword and no-result illustrations instead of blank content. |
| Loading states | Result cards have skeleton loaders to reduce layout jumps while fetching. |

**Main FE files involved:**
- `src/features/chat/components/search-message/search-sidebar.tsx`
- `src/features/chat/components/search-message/message-result-card.tsx`
- `src/features/chat/components/search-message/date-filter.tsx`
- `src/features/chat/components/search-message/sender-filter.tsx`
- `src/features/chat/components/search-message/empty-state.tsx`
- `src/features/chat/components/search-sidebar.tsx`

### 2. Search Data Flow

| Area | Logic |
| --- | --- |
| Search API integration | FE calls backend `GET /search/messages` and `GET /search/messages/overview`. |
| Query structure | Search request carries `keyword`, `conversationId`, `senderId`, `from`, `to`, and section info. |
| Query caching | React Query keys/options are separated for overview and infinite section paging. |
| Enable condition | Search queries only run when user provides at least one real filter. |
| Result shape | FE consumes backend `displayContent` and `displayHighlights` directly for sidebar rendering. |

**Main FE files involved:**
- `src/features/search/messages/api/message-search.api.ts`
- `src/features/search/messages/queries/keys.ts`
- `src/features/search/messages/queries/options.ts`
- `src/features/search/messages/queries/use-queries.ts`
- `src/features/search/messages/schemas/message-search.schema.ts`

### 3. Jump-To-Message Flow

| Area | Logic |
| --- | --- |
| Result click behavior | Clicking a search result no longer tries to navigate by old page-index logic. |
| V2 message API | FE uses cursor-based `getMessagesV2(...)` with `aroundMessageId` to load the target chunk. |
| Chat window integration | `ChatWindow` keeps `jumpTargetId` state and re-renders the message list around the selected target. |
| Highlight behavior | Target message is highlighted in the chat bubble using the searched keyword. |
| Near / far jump | Same flow works for a message already in cache or a much older message outside the current DOM window. |

**Main FE files involved:**
- `src/features/chat/api/chat.api.ts`
- `src/features/chat/queries/options.ts`
- `src/features/chat/queries/use-queries.ts`
- `src/features/chat/components/chat-window.tsx`
- `src/features/chat/components/message-bubble.tsx`

### 4. Scroll Stability And Navigation Safety

| Area | Logic |
| --- | --- |
| Scroll behavior | Scroll handling is centralized in `use-chat-scroll.ts` for the reversed chat list. |
| Jump safety | FE suppresses background fetch/observer behavior while a jump is actively snapping to target message. |
| Bottom state | Normal chat browsing still preserves bottom detection and scroll-to-bottom actions. |
| Visual stability | CSS anchoring and updated scroll flow reduce flicker/jitter during jump navigation and fetch-more transitions. |

**Main FE files involved:**
- `src/features/chat/hooks/use-chat-scroll.ts`
- `src/features/chat/components/chat-window.tsx`
- `src/index.css`

### 5. Search Result Presentation

| Area | Logic |
| --- | --- |
| Result card rendering | Result row supports message/file presentation and uses backend highlight output. |
| File presentation | File results display type-specific visual treatment instead of plain text only. |
| Sender presentation | Result shows sender avatar/name for better scanability. |
| Avatar fallback | Avatar rendering is improved so result UI degrades safely when image load fails. |

**Main FE files involved:**
- `src/features/chat/components/search-message/message-result-card.tsx`
- `src/components/common/user-avatar.tsx`
- `public/images/search_empty_keyword_state.png`
- `public/images/search_empty_state.png`

### 6. Admin Elasticsearch UI

| Area | Logic |
| --- | --- |
| Module-aware dashboard | Admin screen is updated to work by selected module (`USER` / `MESSAGE`) instead of treating all indexes as one flow. |
| Reindex actions | Reindex, stats, summary, alias operations now follow the active module. |
| Failed events page | Admin can filter failed events by module, keyword, resolved state, and duration. |
| Retry actions | FE supports retry single, retry bulk, retry all, and retry by duration. |
| Shared typing | Schemas and query hooks are updated so admin UI can consume the new backend response shapes safely. |

**Main FE files involved:**
- `src/features/admin-elasticsearch/api/elasticsearch.api.ts`
- `src/features/admin-elasticsearch/components/elasticsearch-dashboard.tsx`
- `src/features/admin-elasticsearch/components/control-bar.tsx`
- `src/features/admin-elasticsearch/components/failed-events-page.tsx`
- `src/features/admin-elasticsearch/components/user-index-tab.tsx`
- `src/features/admin-elasticsearch/queries/use-queries.ts`
- `src/features/admin-elasticsearch/queries/use-mutations.ts`
- `src/features/admin-elasticsearch/schemas/elasticsearch.schema.ts`

### 7. Business Rules / UI Behavior

| Rule | Current behavior |
| --- | --- |
| Search enable condition | Search only runs when user has at least one filter: keyword, sender, or date. |
| Section split | Search results are grouped into `Messages` and `Files`. |
| Sender filter scope | Sender filter only uses participants of the current conversation. |
| Date filtering | FE can send custom from/to or quick ranges that match backend-supported ranges. |
| Jump flow | Search result navigation depends on `aroundMessageId` in the V2 message API. |
| Highlight behavior | Selected target message is highlighted inside chat bubble after jump. |
| Scroll safety | Background pagination is suppressed during jump snapping to reduce jitter. |
| Admin scope | Elasticsearch dashboard and failed-event actions are scoped by selected module. |

---

## Screenshots / Video

### A. Search Sidebar

- [ ] **A1.** Open search sidebar from chat
- [ ] **A2.** Search sidebar with keyword input + sender filter + date filter
- [ ] **A3.** Initial empty-keyword state
- [ ] **A4.** No-result state after applying filters

### B. Search Results

- [ ] **B1.** Overview mode with `Messages` and `Files`
- [ ] **B2.** Expanded `Messages` section with load more
- [ ] **B3.** Expanded `Files` section with load more
- [ ] **B4.** Result skeleton loading state
- [ ] **B5.** File result card UI

### C. Jump-To-Message

- [ ] **C1.** Jump to a nearby message result
- [ ] **C2.** Jump to an old/far message result via V2 flow
- [ ] **C3.** Highlighted target message after jump
- [ ] **C4.** Stable scroll behavior during repeated jumps

### D. Admin Elasticsearch

- [ ] **D1.** Dashboard switching between `USER` and `MESSAGE` modules
- [ ] **D2.** Failed-events page with filters applied
- [ ] **D3.** Bulk retry selection UI
- [ ] **D4.** Retry all / retry duration actions

---

## How Has This Been Tested? (Manual)

1. Run FE Web locally (`npm run dev`) with backend search/message APIs available.
2. Verify each UI / flow in browser:

| Test Case | Expected | Checked |
| --- | --- | --- |
| Open search sidebar | Search sidebar opens correctly inside chat | [x] |
| Search by keyword | Overview sections show matching messages/files | [x] |
| Filter by sender | Results only show messages from selected participant | [x] |
| Filter by date | Results respect quick range and custom date inputs | [x] |
| Empty state with no keyword | Sidebar shows initial empty illustration | [x] |
| Empty state with no result | Sidebar shows no-result illustration | [x] |
| Expand messages section | FE switches from overview block to paged results | [x] |
| Expand files section | FE switches from overview block to paged file results | [x] |
| Click near result | Chat jumps to target and highlights content | [x] |
| Click far old result | FE loads target chunk via `aroundMessageId` and scrolls correctly | [x] |
| Repeated jump actions | Scroll remains stable without heavy flicker | [x] |
| Result skeleton loading | Skeleton cards appear during result fetch | [x] |
| Switch admin module | Dashboard updates correctly between `USER` and `MESSAGE` | [x] |
| Filter failed events | Failed-events page updates by module / keyword / status / duration | [x] |
| Retry failed events | Retry single / bulk / all actions refresh the failed-event list correctly | [x] |

---

## Risk Level

- [ ] Low - safe logic change
- [x] Medium - affects logic or state
- [ ] High - affects authentication or data flow

**Rationale:** This PR changes chat message fetching, jump-to-message behavior, scroll state handling, and admin Elasticsearch operations. The main regression risk is message navigation and scroll stability when switching between normal browsing and jump mode.

---

## Checklist

- [x] PR title contains `[BH-KEY]`
- [x] Commit messages follow the convention
- [x] Jira ticket is linked
- [x] UI layout is not broken
- [x] Responsive behavior works correctly
- [x] Manual testing completed
- [x] Search sidebar is integrated into chat flow
- [x] Search result click uses V2 message loading with `aroundMessageId`
- [x] Target message highlight is rendered in chat bubble
- [x] Admin Elasticsearch UI supports module-aware failed-event operations
