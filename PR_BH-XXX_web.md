# Pull Request

## Jira Ticket

- [BH-XXX](https://tranngochuyen.atlassian.net/browse/BH-XXX)

---

## Description

This PR implements the post feature flow across feed, post detail, and profile pages with explicit route-driven state, query orchestration, and backend DTO mapping.

Technical scope:

- Feed route parses search params tab and postId in social-feed-page, and keeps modal open state synchronized with URL.
- Feed and profile post lists use react-query infinite queries with page size 20 and intersection observer pagination trigger rootMargin 400px.
- Post creation uploads media first through file API, then submits normalized post payload to post API with FEED postType and selected visibility.
- Post and comment interactions (create, update, delete, react, unreact) are wired through mutation hooks with targeted query invalidation.
- Backend post payload is mapped into UI model with normalization for postType, visibility, shared post preview, top reactions, and content composition.

---

## Type of change

Please select the appropriate option:

- [ ] Bug fix
- [x] New feature
- [x] UI / UX update
- [ ] Refactor
- [ ] Other (please describe)

---

## What was changed?

- Route and page state:
- Social feed page reads tab and postId from URLSearchParams.
- tab=reels toggles full Reels page rendering; otherwise feed layout is rendered.
- postId triggers single-post query usePostById and opens PostMediaModal when data is resolved.
- Closing detail modal removes postId from URL via navigate(pathname, { replace: true }) to avoid full route remount.

- Feed data loading and pagination:
- Feed uses useInfiniteSocialFeedPosts(20) backed by recommendations endpoint /recommendations/feed.
- Next page is fetched when sentinel enters viewport using useInView with rootMargin 400px.
- Query filter is client-side on flattened pages (authorName contains query OR content contains query).
- Error branch includes explicit refetch action; loading branch uses skeleton placeholders.

- My profile post page:
- Route /profile renders my-profile-page with useInfiniteMyPosts(20).
- Data source is /posts/me endpoint, mapped through same SocialPost mapper used by feed.
- Page includes profile cover/avatar section, inline post composer launcher, retry handling, empty state, and scroll-to-top control.

- Post composer pipeline:
- Launcher opens full-screen dialog and mounts PostComposer with inModal mode.
- Media handling validates MIME prefix by channel IMAGE or VIDEO before queueing selected files.
- Submit flow:
  1.  Upload each file through fileApi.upload.
  2.  Map upload result key to post media url.
  3.  Call createPost with payload { postType: FEED, visibility, caption, media }.
  4.  Invalidate socialFeedKeys.all on success to refresh visible lists.

- Post card behavior:
- Local reaction state selectedReaction is initialized from currentUserReaction and computes display count delta against backend baseline.
- Reaction action toggles between commentApi.toggleReaction targetType POST and commentApi.deleteReaction.
- Supports not interested action via interactionApi.dislikePost with hide-on-click UI fallback and rollback on API error.
- Supports share modal, comments modal, reaction people modal, media modal, and report dialog for targetType POST.

- Post media detail modal:
- Modal receives post and optional mediaOverride, then sorts media to place VIDEO before IMAGE in carousel.
- Header and stats reuse the same normalized post fields for consistency with post card.
- Comments section uses useSocialFeedComments(postId, page 0, size 20) and mutation hooks for create/update/delete/reaction.
- Comment input supports reply target state and resets reply context after successful submit.

- Query and mapping layer:
- options mapper normalizes backend values:
  - postType string to FEED/STORY/REEL/SHARE enum used by UI.
  - visibility ALL/PUBLIC/FRIENDS/PRIVATE to Public/Friends/Private label keys.
  - content aggregation from title/caption/description plus normalized hashtags.
- SHARE post resolution prioritizes embedded sharedPostPreview and falls back to sharedPostId unavailable placeholder when preview is missing.
- Added single post query key singlePostKeys.byId and query option getPostByIdQueryOptions for deep-link detail fetch.

---

## Screenshots / Video

> Required if there are UI changes

---

## How Has This Been Tested? (Manual)

1. Run FE Web locally
2. Login with a normal user account
3. Verify:
   - [ ] Case 1: Open /social-feed?tab=feed and confirm useInfiniteSocialFeedPosts returns initial page, then scroll to trigger next page load from intersection sentinel.
   - [ ] Case 2: Enter search text and verify filtered list condition is authorName contains query OR content contains query.
   - [ ] Case 3: Open /social-feed?postId=<valid_post_id> and verify getPostById query resolves and PostMediaModal opens; close modal and verify URL no longer has postId.
   - [ ] Case 4: Create a post with both text and media, verify upload requests happen first, then createPost request payload includes postType FEED and selected visibility.
   - [ ] Case 5: React then unreact on a post and verify displayed reaction count and icon state transition matches mutation result.
   - [ ] Case 6: Add, edit, and delete comment in PostMediaModal and verify comments query is invalidated and refetched for that post key.
   - [ ] Case 7: Open /profile and verify my posts are loaded from /posts/me with infinite pagination and retry behavior on simulated failure.

---

## Risk Level

- [ ] Low – UI-only or safe change
- [x] Medium – affects logic or state
- [ ] High – affects authentication or data flow

---

## Checklist

- [ ] PR title contains `[BH-KEY]`
- [ ] Commit messages follow the convention
- [ ] Jira ticket is linked
- [ ] UI layout is not broken
- [ ] Responsive behavior works correctly
- [ ] Manual testing completed
