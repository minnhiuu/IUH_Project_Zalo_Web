# Pull Request

## Jira Ticket

- [BH-200](https://tranngochuyen.atlassian.net/browse/BH-200)
- Parent Epic: [BH-194](https://tranngochuyen.atlassian.net/browse/BH-194)

**Related backend tickets covered by this PR:**

- [BH-261](https://tranngochuyen.atlassian.net/browse/BH-261): Join request system — create, approve, reject, cancel join requests + join question UI.
- [BH-197](https://tranngochuyen.atlassian.net/browse/BH-197): Block/unblock members, self-block from being added, transfer ownership, admin candidate queries.

---

## Description

Frontend Web implementation for join request system, member blocking, transfer ownership UI, and admin management flows. Covers the full join-request lifecycle UI (request → approve/reject/cancel), membership approval with join question dialog, block list management for Owner/Admin, self-block from being re-added, standalone transfer ownership dialog, admin candidate/list steps, and real-time system message rendering for 6 new action types.

---

## Type of change

- [x] Bug fix
- [x] New feature
- [x] UI / UX update
- [x] Refactor
- [ ] Other (please describe)

---

## What was changed?

### 1. New/Updated Components (15+ components)

| Component                        | File                                                  | Description                                                                                                      |
| -------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `JoinGroupDialog`                | `group/dialogs/join-group-dialog.tsx`                 | **NEW** — Full join-group flow: shows group preview, handles direct join / pending request / blocked / answer question states |
| `JoinRequestApprovalDialog`      | `group/dialogs/join-request-approval-dialog.tsx`      | **NEW** — Approve/reject join request dialog: shows requester info + join answer                                  |
| `UpdateJoinQuestionDialog`       | `group/dialogs/update-join-question-dialog.tsx`       | **NEW** — Set/update join question dialog with character counter (max 250 chars)                                  |
| `TransferOwnerFinalConfirmDialog`| `group/dialogs/transfer-owner-final-confirm-dialog.tsx`| **NEW** — Final confirmation dialog before transferring ownership                                                |
| `JoinRequestsSection`            | `group/members/join-requests-section.tsx`             | **NEW** — Pending join requests list with approve/reject actions (Owner/Admin only)                               |
| `MemberRoleBadge`                | `group/members/member-role-badge.tsx`                 | **NEW** — Reusable role badge component (Owner gold / Admin silver)                                               |
| `CharacterCounterInput`          | `ui/character-counter-input.tsx`                      | **NEW** — Input with live character count display                                                                 |
| `CharacterCounterTextarea`       | `ui/character-counter-textarea.tsx`                   | **NEW** — Textarea with live character count display                                                              |
| `GroupManagementStep`            | `group/steps/group-management-step.tsx`               | **UPDATED** — Added: membership approval toggle, join question section, block list entry, pending requests badge  |
| `GroupMembersStep`               | `group/steps/group-members-step.tsx`                  | **UPDATED** — Added: join requests section at top (with pending count badge), block button in member actions      |
| `GroupAdminsStep`                | `group/steps/group-admins-step.tsx`                   | **UPDATED** — Rewired to use new `getGroupAdmins` + `getAdminCandidates` APIs with infinite scroll               |
| `GroupBlockedStep`               | `group/steps/group-blocked-step.tsx`                  | **UPDATED** — Rewired to use new `getBlockedMembers` + `getBlockCandidates` + `blockMember`/`unblockMember` APIs |
| `GroupInfoDialog`                | `group/dialogs/group-info-dialog.tsx`                 | **UPDATED** — Added step navigation for admin/blocked views inside the modal                                      |
| `LeaveGroupDialog`               | `group/dialogs/leave-group-dialog.tsx`                | **UPDATED** — Added `blockReJoin` checkbox ("Don't allow re-add") option                                          |
| `MemberActionMenu`               | `group/members/member-action-menu.tsx`                | **UPDATED** — Added "Block from group" action (Owner/Admin, role-constrained)                                     |
| `MemberItem`                     | `group/members/member-item.tsx`                       | **UPDATED** — Added blocked indicator, role badge display                                                        |
| `PromoteAdminDialog`             | `group/dialogs/promote-admin-dialog.tsx`              | **UPDATED** — Rewired to use `adminCandidates` API                                                               |
| `TransferOwnerDialog`            | `group/dialogs/transfer-owner-dialog.tsx`             | **UPDATED** — Uses new standalone transfer ownership API                                                          |
| `MemberSelectionDialog`          | `group/dialogs/member-selection-dialog.tsx`           | **UPDATED** — Supports block candidate mode                                                                       |

### 2. System Message Rendering (6 new action handlers)

Each new `SystemActionType` has a dedicated handler:

| Action                    | Handler File                        | Key Pattern                                          | Notes                                                    |
| ------------------------- | ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `JOIN_REQUEST_CREATED`    | `join-request-created-action.ts`    | `chat.system.join_request_created`                   | Shown to Owner/Admin only (restricted via `visibleTo`)   |
| `JOIN_REQUEST_APPROVED`   | `join-request-approved-action.ts`   | `.self_approved`, `.by_you`, `.by_actor`             | Shows target avatar, similar to ADD_MEMBERS rendering    |
| `JOIN_REQUEST_REJECTED`   | `join-request-rejected-action.ts`   | `chat.system.join_request_rejected`                  | Shown to requester only                                  |
| `BLOCK_MEMBER`            | `block-member-action.ts`            | `.self_blocked`, `.by_you`, `.by_actor`              | Shows target avatar, includes "Delete" button for self   |
| `BLOCKED_FROM_JOINING`    | `blocked-from-joining-action.ts`    | `chat.system.blocked_from_joining`                   | Shown to blocked user only                                |
| `SELF_BLOCKED_FROM_JOINING`| `self-blocked-from-joining-action.ts`| `chat.system.self_blocked_from_joining`              | Shown to self only                                        |

**System message preview:** New `system-message-preview.ts` utility generates sidebar preview text for all system action types (used in conversation list `lastMessage` display).

### 3. API Hooks (8 new mutations + 5 new queries)

**New Mutations:**

| Hook                              | API                                                    | Invalidation                                                   |
| --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `useApproveJoinRequestMutation`   | `POST /conversations/{id}/join-requests/{rid}/approve` | joinRequests, conversations, group-members, groupAdmins        |
| `useRejectJoinRequestMutation`    | `POST /conversations/{id}/join-requests/{rid}/reject`  | joinRequests                                                   |
| `useCancelJoinRequestMutation`    | `DELETE /conversations/{id}/join-requests/me`          | join-preview, joinRequests, conversations                      |
| `useUpdateJoinQuestionMutation`   | `PUT /conversations/{id}/join-question`                | conversations                                                  |
| `useBlockMemberMutation`          | `POST /conversations/{id}/block/{uid}`                 | conversations, group-members, groupAdmins, blockedMembers      |
| `useUnblockMemberMutation`        | `DELETE /conversations/{id}/block/{uid}`               | blockedMembers                                                 |
| `useUpdateGroupAvatarMutation` (updated) | `PATCH /conversations/{id}/avatar`              | conversations (FormData multipart)                             |

**Updated Mutations:**

| Hook                      | Change                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `useLeaveGroupMutation`   | Added `blockReJoin` param; sends request body DTO instead of query params                |
| `useJoinByLinkMutation`   | Added `joinAnswer` param, handles `null` response (pending request case)                 |

**New Queries:**

| Hook                               | Triggered When                    | Returns                                      |
| ---------------------------------- | --------------------------------- | -------------------------------------------- |
| `useGroupAdminsInfiniteQuery`      | Admin management tab open         | Owner + Admins, paginated                    |
| `useAdminCandidatesInfiniteQuery`  | Promote dialog open               | Non-owner members for admin promotion        |
| `useJoinRequestsQuery`             | Members tab open (Owner/Admin)    | Pending join requests list                   |
| `useJoinPreviewQuery`              | Join group page loaded            | Group preview with approval/block flags      |
| `useBlockedMembersInfiniteQuery`   | Block list step open              | Blocked users, paginated                     |
| `useBlockCandidatesInfiniteQuery`  | Block candidate dialog open       | MEMBER-role users eligible for blocking      |

### 4. Schema / Type Changes

**`ConversationResponse`** — 1 new field:

| Field                      | Type             | Purpose                                                  |
| -------------------------- | ---------------- | -------------------------------------------------------- |
| `pendingJoinRequestCount`  | `number \| null` | Pending join request count (shown as badge in sidebar)   |

**`GroupSettings`** — 1 new field:

| Field          | Type             | Purpose                          |
| -------------- | ---------------- | -------------------------------- |
| `joinQuestion` | `string \| null` | Join question text (if set)      |

**`JoinGroupPreviewResponse`** — 4 new fields:

| Field                       | Type      | Purpose                                   |
| --------------------------- | --------- | ----------------------------------------- |
| `isBlockedFromGroup`        | `boolean` | Whether current user is blocked           |
| `membershipApprovalEnabled` | `boolean` | Whether approval mode is enabled          |
| `hasPendingRequest`         | `boolean` | Whether current user has pending request  |
| `joinQuestion`              | `string`  | Join question text (if configured)        |

**New types:** `JoinRequestResponse`, `AdminMemberResponse`

### 5. WebSocket Real-time Updates

| Action Type                         | Behavior                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| `JOIN_REQUEST_CREATED`              | Increment `pendingJoinRequestCount`, show notification for Owner/Admin only       |
| `JOIN_REQUEST_APPROVED`             | Move conversation to top, show system message, invalidate join requests           |
| `JOIN_REQUEST_REJECTED`             | Show rejection system message to requester only                                   |
| `BLOCK_MEMBER`                      | Do **not** move to top; update lastMessage, remove member from list               |
| `BLOCK_MEMBER` (self blocked)       | Clear messages cache, conversation disabled (similar to REMOVE self)              |
| `BLOCKED_FROM_JOINING`              | Show blocked notification to blocked user only                                    |
| `SELF_BLOCKED_FROM_JOINING`         | Show self-block confirmation to self only                                         |

### 6. Join Group Flow (JoinGroupDialog)

The join-group page (`/join/{token}`) now handles multiple states:

| State             | UI                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------- |
| Normal (no approval) | Group preview → "Join Group" button → direct join → redirect to conversation       |
| Approval enabled  | Group preview → "Request to Join" button → creates pending request → shows "Pending" state |
| With join question | Group preview → shows question → textarea for answer → "Submit & Request" button    |
| Already pending   | Group preview → "Cancel Request" button                                               |
| Blocked           | Group preview → "You are blocked from this group" message (join button disabled)      |
| Already member    | Group preview → "You are already a member" → "Go to conversation" button              |

### 7. Membership Approval & Join Question Flow

**Enable approval (Management step):**
1. Owner/Admin toggles "Membership Approval" in Management step
2. `UpdateJoinQuestionDialog` opens → set optional join question (max 250 chars)
3. Future joiners via link must submit a request (with answer if question configured)

**Review requests (Members step / Management step):**
1. Pending requests badge shown on Members tab header
2. `JoinRequestsSection` at top of members list shows pending requests
3. Click request → `JoinRequestApprovalDialog` → Approve or Reject
4. On approve → member added, system message broadcast
5. On reject → rejected system message sent to requester only

### 8. Block List Management

**Block member (Owner/Admin):**
1. Member action menu → "Block from group"
2. Confirmation dialog → member removed + blocked from rejoining
3. System message `BLOCK_MEMBER` broadcast to all
4. Blocked user sees `BLOCKED_FROM_JOINING` message

**Block list step (GroupBlockedStep):**
1. Shows list of blocked users with "Unblock" button (Owner only can unblock)
2. "Add to block list" button → `MemberSelectionDialog` in block-candidate mode
3. Search + select MEMBER-role users → block them

**Self-block on leave:**
1. `LeaveGroupDialog` → new checkbox "Don't allow re-add to this group"
2. When checked → `blockReJoin=true` sent with leave API
3. User added to `selfBlockedUserIds` → cannot be re-added by anyone

### 9. i18n Updates

Added i18n keys for all 6 new system action types in both `vi.json` and `en.json`:
- `chat.system.join_request_created.*`
- `chat.system.join_request_approved.*`
- `chat.system.join_request_rejected.*`
- `chat.system.block_member.*`
- `chat.system.blocked_from_joining.*`
- `chat.system.self_blocked_from_joining.*`

Plus sidebar preview keys, management step labels, dialog titles/descriptions, and error messages.

---

## How Has This Been Tested? (Manual)

1. Run FE Web locally (`npm run dev`).
2. Login with test accounts: Owner, Admin, Member, Non-member.
3. Verify each flow:

| Test Case                                                                   | Expected                                                                    | Checked |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------- |
| Join group via link (approval disabled)                                     | Direct join, redirect to conversation                                       | [x]     |
| Join group via link (approval enabled, no question)                         | Pending request created, "Pending" state shown                              | [x]     |
| Join group via link (approval enabled, with question)                       | Question shown, answer required, request created with answer                | [x]     |
| Join group while already pending                                            | "Cancel Request" button shown                                               | [x]     |
| Join group while blocked                                                    | "Blocked" message, join button disabled                                     | [x]     |
| Cancel pending join request                                                 | Request cancelled, preview refreshed                                        | [x]     |
| Approve join request (Owner/Admin)                                          | Member added, system message shown, request removed from list               | [x]     |
| Reject join request (Owner/Admin)                                           | Rejected message sent to requester, request removed from list               | [x]     |
| Join request approval dialog shows join answer                              | Answer displayed when question was configured                               | [x]     |
| Pending requests badge on Members tab                                       | Badge count matches pending request count                                   | [x]     |
| Block member from action menu                                               | Member removed, added to block list, system message shown                   | [x]     |
| Block list step shows blocked members                                       | Paginated list with unblock button                                          | [x]     |
| Unblock member (Owner only)                                                 | Member removed from block list                                              | [x]     |
| Add to block list via dialog                                                | Block candidates shown, selected user blocked                               | [x]     |
| Leave group with "Don't allow re-add" checked                               | Member left + self-blocked from being re-added                              | [x]     |
| Self-block system message shown                                             | `SELF_BLOCKED_FROM_JOINING` message displayed                               | [x]     |
| Transfer ownership via standalone dialog                                    | Owner changed, system message broadcast                                     | [x]     |
| Group admins step shows correct list                                        | Owner first, admins sorted by name                                          | [x]     |
| Admin candidates shows correct list                                         | Non-owner members, searchable                                               | [x]     |
| Enable membership approval toggle                                           | Join question dialog opens, setting saved                                   | [x]     |
| WebSocket: join request → pending count incremented                         | Badge updated in real-time                                                  | [x]     |
| WebSocket: block member → conversation stays in place                       | Position unchanged, lastMessage updated                                     | [x]     |
| System message preview in sidebar for all new action types                  | Correct preview text for each action type                                   | [x]     |
| Role-based: Member cannot see join requests or block list                   | Only Owner/Admin see these sections                                         | [x]     |

---

## Risk Level

- [ ] Low – UI-only or safe change
- [x] Medium – affects logic or state
- [ ] High – affects authentication or data flow

**Rationale:** Complex state management: join request lifecycle, block list queries, WebSocket cache invalidation for 6 new action types, new dialog flows with multiple states. Does not affect authentication.

---

## Checklist

- [x] PR title contains `[BH-KEY]`
- [x] Commit messages follow the convention
- [x] Jira ticket is linked
- [x] UI layout is not broken
- [x] Responsive behavior works correctly
- [x] Manual testing completed
- [x] i18n keys for all 6 new system action types (vi + en)
- [x] Role-based UI: Owner/Admin/Member see correct actions
- [x] WebSocket sync: negative actions (BLOCK_MEMBER) do not push conversation to top
- [x] Query invalidation correct for each mutation
- [x] Join group dialog handles all states (normal, approval, question, pending, blocked, already member)