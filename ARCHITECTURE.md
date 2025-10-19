# 🎨 NoobWriter - Component Architecture

## 📁 Project Structure

```
Noobwriter/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── series/
│   │   │   └── [id]/
│   │   │       └── page.tsx          ⭐ Series Detail + Comments + Ratings
│   │   ├── read/
│   │   │   └── [seriesId]/
│   │   │       └── [chapterNumber]/
│   │   │           └── page.tsx      📖 Chapter Reader + Comments
│   │   ├── library/
│   │   │   └── page.tsx              📚 User Library
│   │   ├── write/
│   │   │   ├── page.tsx              ✍️ Writer Dashboard
│   │   │   └── analytics/
│   │   │       └── page.tsx          📊 Analytics Dashboard
│   │   ├── actions/
│   │   │   ├── reader-actions.ts     🔧 11 server actions
│   │   │   └── writer-actions.ts     🔧 5 server actions
│   │   └── layout.tsx
│   ├── components/
│   │   ├── comments/                  💬 NEW!
│   │   │   ├── CommentSection.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentItem.tsx
│   │   ├── ratings/                   ⭐ NEW!
│   │   │   ├── RatingSection.tsx
│   │   │   ├── RatingForm.tsx
│   │   │   └── RatingItem.tsx
│   │   ├── ui/                        🎨 shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   └── modals/
│   │       └── unlock-premium-modal.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   └── hooks/
│       └── use-toast.ts
├── supabase/
│   └── migrations/
│       └── 20251019_add_analytics_comments.sql  🗄️ Comments + Ratings
└── docs/
    ├── DATABASE_VERIFICATION.md
    ├── ANALYTICS_DASHBOARD.md
    ├── COMMENTS_RATINGS_SYSTEM.md
    ├── PROJECT_STATUS.md
    └── TYPESCRIPT_FIX.md
```

---

## 🔄 Data Flow Architecture

### Reader Flow (Comments & Ratings)

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📄 Series Detail Page                                        │
│  ├─ RatingSection                                            │
│  │  ├─ RatingForm ──────────────────┐                       │
│  │  │  └─ Star Selector (1-5)       │                       │
│  │  └─ RatingItem[] ─────────────┐  │                       │
│  │                                │  │                       │
│  └─ CommentSection                │  │                       │
│     ├─ CommentForm ──────────┐   │  │                       │
│     └─ CommentItem[] ────┐   │   │  │                       │
│        └─ Replies[]       │   │   │  │                       │
│                           │   │   │  │                       │
│  📖 Chapter Reader Page   │   │   │  │                       │
│  └─ CommentSection        │   │   │  │                       │
│     ├─ CommentForm ───────┼───┤   │  │                       │
│     └─ CommentItem[] ─────┤   │   │  │                       │
│                           │   │   │  │                       │
└───────────────────────────┼───┼───┼──┼───────────────────────┘
                            │   │   │  │
                            ▼   ▼   ▼  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server Actions Layer                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  reader-actions.ts                                            │
│  ├─ createComment(content, seriesId?, chapterId?, parentId?) │
│  ├─ getComments(seriesId?, chapterId?)                       │
│  ├─ likeComment(commentId, currentLikes)                     │
│  ├─ deleteComment(commentId)                                 │
│  ├─ createOrUpdateRating(seriesId, rating, review?)          │
│  ├─ getRatings(seriesId)                                     │
│  └─ deleteRating(seriesId)                                   │
│                                                               │
│  Authentication Check:                                        │
│  ┌──────────────────────────────────────────┐               │
│  │ const { data: { user } } = await         │               │
│  │   supabase.auth.getUser()                │               │
│  │                                           │               │
│  │ if (!user) {                              │               │
│  │   return {                                │               │
│  │     error: 'You must be logged in'       │               │
│  │   }                                       │               │
│  │ }                                         │               │
│  └──────────────────────────────────────────┘               │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Supabase)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 Tables                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │ comments                                          │       │
│  │ ├─ id, user_id, series_id?, chapter_id?          │       │
│  │ ├─ parent_id (for nested replies)                │       │
│  │ ├─ content, likes                                 │       │
│  │ └─ created_at, updated_at                         │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │ ratings                                           │       │
│  │ ├─ id, user_id, series_id                        │       │
│  │ ├─ rating (1-5), review                          │       │
│  │ ├─ created_at, updated_at                         │       │
│  │ └─ UNIQUE(user_id, series_id)                    │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
│  🔒 Row Level Security Policies                              │
│  ├─ SELECT: Anyone can view                                  │
│  ├─ INSERT: auth.uid() = user_id                            │
│  ├─ UPDATE: auth.uid() = user_id                            │
│  └─ DELETE: auth.uid() = user_id                            │
│                                                               │
│  ⚡ Triggers                                                  │
│  ├─ update_series_comments()                                 │
│  │  └─ Auto-update series.total_comments                     │
│  └─ update_series_rating()                                   │
│     └─ Auto-recalculate series.avg_rating                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Interaction Diagram

### Comment System Flow

```
User Clicks "Add Comment"
         │
         ▼
┌────────────────────┐
│  CommentSection    │
│  └─ showForm=true  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   CommentForm      │
│  ┌──────────────┐  │
│  │  Textarea    │  │
│  │  [Content]   │  │
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │ Post Button  │◄─┤──── User types & clicks
│  └──────────────┘  │
└────────┬───────────┘
         │
         ▼
   createComment()
   ├─ Check auth ✓
   ├─ Validate input ✓
   └─ Insert to DB ✓
         │
         ▼
   Database Trigger
   └─ Increment series.total_comments
         │
         ▼
   Success Response
         │
         ▼
┌────────────────────┐
│  CommentSection    │
│  └─ loadComments() │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   CommentItem      │
│  ┌──────────────┐  │
│  │ 👤 Avatar    │  │
│  │ User Name    │  │
│  │ "2 min ago"  │  │
│  │              │  │
│  │ Comment text │  │
│  │              │  │
│  │ ❤️  5  Reply │  │
│  └──────────────┘  │
└────────────────────┘
```

### Rating System Flow

```
User Clicks "Rate This Series"
         │
         ▼
┌────────────────────────┐
│   RatingSection        │
│   └─ showForm=true     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│    RatingForm          │
│   ⭐⭐⭐⭐⭐           │
│   │  │ │ │ │           │
│   └──┴─┴─┴─┘           │
│   Hover/Click          │
│   Selected: 4/5        │
│   ┌────────────────┐   │
│   │ Review text... │   │
│   └────────────────┘   │
│   [Submit Rating]      │
└────────┬───────────────┘
         │
         ▼
createOrUpdateRating()
├─ Check auth ✓
├─ Validate 1-5 ✓
└─ UPSERT to DB ✓
         │
         ▼
   Database Trigger
   └─ Recalculate AVG(rating)
      Update series.avg_rating
         │
         ▼
   Success Response
         │
         ▼
┌────────────────────────┐
│   RatingSection        │
│   ┌────────────────┐   │
│   │ ⭐⭐⭐⭐⭐     │   │
│   │ 4.2 / 5       │   │
│   │ (127 ratings) │   │
│   └────────────────┘   │
│                        │
│   [Your Rating: 4⭐]  │
│                        │
│   Other Reviews:       │
│   ┌────────────────┐   │
│   │ John Doe       │   │
│   │ ⭐⭐⭐⭐⭐     │   │
│   │ "Amazing!"     │   │
│   └────────────────┘   │
└────────────────────────┘
```

---

## 🔐 Authentication & Authorization

### Authentication Check Pattern

```typescript
// Used in ALL server actions
export async function createComment(data) {
  const supabase = await createClient()
  
  // 1. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { 
      comment: null, 
      error: 'You must be logged in to comment' 
    }
  }
  
  // 2. Insert with user_id
  const { data: comment } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,  // ← Ensures ownership
      content: data.content
    })
    .select()
    .single()
  
  // 3. RLS policies enforce:
  //    - User can only insert with their own user_id
  //    - User can only UPDATE/DELETE their own records
  
  return { comment, error: null }
}
```

### RLS Policy Structure

```sql
-- Anyone can view
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Only create with your own user_id
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only modify your own
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Only delete your own
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📊 Database Schema Relationships

```
┌─────────────┐
│   profiles  │
│  (users)    │
└──────┬──────┘
       │
       │ user_id
       │
       ├─────────────────────────────────┬───────────────────┐
       │                                 │                   │
       ▼                                 ▼                   ▼
┌──────────────┐               ┌──────────────┐    ┌──────────────┐
│   comments   │               │   ratings    │    │   series     │
├──────────────┤               ├──────────────┤    ├──────────────┤
│ id           │               │ id           │    │ id           │
│ user_id  ────┼──FK→profiles  │ user_id  ────┼─FK │ author_id────┼─FK
│ series_id────┼─┐             │ series_id────┼─┐  │ title        │
│ chapter_id───┼─┼─┐           │ rating (1-5) │ │  │ avg_rating   │
│ parent_id────┼─┼─│──FK→self  │ review       │ │  │ total_cmts   │
│ content      │ │ │           │ UNIQUE       │ │  └──────┬───────┘
│ likes        │ │ │           │ (user+series)│ │         │
│ created_at   │ │ │           └──────┬───────┘ │         │
└──────────────┘ │ │                  │         │         │
       │         │ │                  │         │         │
       │         │ │         ┌────────┴─────────┘         │
       │         │ │         │                            │
       │         │ │         ▼                            │
       │         │ │    Trigger:                          │
       │         │ │    update_series_rating()            │
       │         │ │    - Recalc AVG(rating)             │
       │         │ │    - Update avg_rating               │
       │         │ │                                       │
       │         │ └──────────────────────────┐           │
       │         │                            │           │
       │         ▼                            ▼           ▼
       │    ┌──────────────┐           ┌──────────────┐
       │    │   chapters   │           │   series     │
       │    ├──────────────┤           ├──────────────┤
       │    │ id           │           │ id           │
       │    │ series_id────┼───FK      │ total_cmts   │◄─┐
       │    │ chapter_num  │           └──────────────┘  │
       │    │ is_premium   │                             │
       │    │ coin_price   │                             │
       │    └──────────────┘                             │
       │                                                  │
       └──────────────────────────────────────────────────┘
                         Trigger:
                         update_series_comments()
                         - Increment/decrement
                         - Update total_comments
```

---

## 🎨 UI Component Hierarchy

```
App Layout
└─ Toaster (notifications)
   └─ Page
      │
      ├─ Series Detail Page
      │  ├─ Tabs
      │  │  ├─ Chapters Tab
      │  │  ├─ About Tab
      │  │  └─ Reviews Tab ★
      │  │     ├─ RatingSection
      │  │     │  ├─ Header (avg ⭐, count)
      │  │     │  ├─ RatingForm (when editing)
      │  │     │  │  ├─ Star Selector
      │  │     │  │  ├─ Review Textarea
      │  │     │  │  └─ Submit/Delete Buttons
      │  │     │  └─ RatingItem[] (all reviews)
      │  │     │     ├─ Avatar
      │  │     │     ├─ Star Display
      │  │     │     ├─ Review Text
      │  │     │     └─ Delete Menu
      │  │     └─ CommentSection
      │  │        ├─ Header (count, sort)
      │  │        ├─ CommentForm (when active)
      │  │        │  ├─ Textarea
      │  │        │  └─ Post/Cancel Buttons
      │  │        └─ CommentItem[]
      │  │           ├─ Avatar
      │  │           ├─ Name + Timestamp
      │  │           ├─ Content
      │  │           ├─ Actions (❤️ Like, Reply, Delete)
      │  │           ├─ CommentForm (for replies)
      │  │           └─ Replies[] (nested)
      │  │              └─ CommentItem (isReply=true)
      │
      └─ Chapter Reader Page
         ├─ Chapter Content
         ├─ Navigation (Prev/Next)
         └─ CommentSection ★
            └─ (same structure as above)
```

---

## 🚀 Features Summary

### Comments (💬)
- ✅ Create top-level comments
- ✅ Reply to comments (1 level deep)
- ✅ Like comments (visual feedback)
- ✅ Delete own comments
- ✅ Real-time like count
- ✅ User avatars
- ✅ Relative timestamps
- ✅ Auth-gated

### Ratings (⭐)
- ✅ 1-5 star selector
- ✅ Optional text review
- ✅ Update existing rating
- ✅ Delete rating
- ✅ Average calculation
- ✅ Rating count
- ✅ Display all reviews
- ✅ Auth-gated

---

**All components are production-ready and fully integrated! 🎉**
