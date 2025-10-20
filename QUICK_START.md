# Quick Start Guide# 🚀 Quick Start Guide - Comments & Ratings



## 🎉 All Features Implemented!## For Developers



### What's New### Adding Comments to a Page



1. **Cover Image Upload System** ✅```tsx

   - Upload portrait cover images when creating storiesimport CommentSection from '@/components/comments/CommentSection'

   - Stored in Supabase Storage

   - Aspect ratio and size validation// For series comments

   - Real-time preview<CommentSection seriesId={seriesId} />



2. **Homepage Redesign** ✅// For chapter comments  

   - Recommended for You section<CommentSection chapterId={chapterId} />

   - Recently Updated section```

   - Top by Category rankings

   - No dummy data - all real from database### Adding Ratings to a Page



3. **Library Page Testing** ✅```tsx

   - Comprehensive testing guide createdimport RatingSection from '@/components/ratings/RatingSection'

   - Manual verification steps included

   - Supabase query examples provided<RatingSection

  seriesId={seriesId}

---  averageRating={series.avg_rating}

  totalRatings={series.total_ratings}

## 🚀 Quick Setup (3 Steps)/>

```

### Step 1: Run Storage Migration

---

**Option A: Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard## For Users

2. Select your project

3. Click "SQL Editor" in sidebar### How to Comment

4. Copy contents from `RUN_THIS_STORAGE_MIGRATION.sql`

5. Click "Run"1. **Navigate** to any series detail page or chapter

6. Verify: Go to Storage → Should see "covers" bucket2. **Scroll** to the comments section

3. **Click** "Add Comment" button

**Option B: Using setup script**4. **Type** your comment

```bash5. **Click** "Post Comment"

# Just type check and build (no migration)

setup-features.bat**Requirements**: Must be logged in

```

### How to Reply

### Step 2: Test Locally

1. **Find** a comment you want to reply to

```bash2. **Click** the "Reply" button

npm run dev3. **Type** your reply

```4. **Click** "Post Comment"



Then test:### How to Like a Comment

- **Cover Upload**: http://localhost:3000/write/story/new

- **Homepage**: http://localhost:3000/1. **Click** the heart icon (❤️) on any comment

- **Library**: http://localhost:3000/library2. Heart fills red and count increases

3. Can only like once per comment

### Step 3: Deploy

### How to Delete Your Comment

```bash

git add .1. **Click** the three dots (⋮) on YOUR comment

git commit -m "Add cover upload, homepage redesign, and library testing"2. **Select** "Delete"

git push origin main3. **Confirm** the deletion

```

---

Vercel will auto-deploy!

### How to Rate a Series

---

1. **Navigate** to series detail page

## 📁 New Files2. **Click** "Reviews" tab

3. **Click** "Rate This Series"

```4. **Select** 1-5 stars (click the stars)

✨ NEW FILES:5. **Optionally** write a review

- src/components/upload/CoverUpload.tsx6. **Click** "Submit Rating"

- src/components/series/SeriesCard.tsx

- src/app/actions/homepage-actions.ts**Requirements**: Must be logged in

- RUN_THIS_STORAGE_MIGRATION.sql

- LIBRARY_TESTING_GUIDE.md### How to Update Your Rating

- IMPLEMENTATION_GUIDE.md

- setup-features.bat1. **Navigate** to series detail page

- QUICK_START.md (this file)2. **Click** "Reviews" tab

3. **Click** "Update Rating"

📝 MODIFIED FILES:4. **Change** stars or review text

- src/app/page.tsx (homepage redesign)5. **Click** "Update Rating"

- src/app/write/story/new/page.tsx (cover upload added)

```### How to Delete Your Rating



---1. **Navigate** to series detail page

2. **Click** "Reviews" tab

## ✅ Testing Checklist3. **Click** "Update Rating"

4. **Click** "Delete Rating"

### Cover Upload5. **Confirm** deletion

- [ ] Go to /write/story/new

- [ ] Upload a portrait image---

- [ ] See preview appear

- [ ] Complete story creation## Server Actions Reference

- [ ] Verify cover shows on series page

### Comments

### Homepage

- [ ] Go to homepage (/)```typescript

- [ ] See "Recommended for You" section// Get comments with nested replies

- [ ] See "Recently Updated" sectionconst { comments } = await getComments(seriesId, chapterId)

- [ ] See "Top by Category" section

- [ ] Click on series cards - should navigate correctly// Create a comment

const { comment, error } = await createComment({

### Library  content: "Great chapter!",

- [ ] Go to /library  seriesId: "uuid",

- [ ] See 4 stats cards with numbers  chapterId: "uuid",  // optional

- [ ] Test "Continue Reading" tab  parentId: "uuid"     // optional, for replies

- [ ] Test "Favorites" tab})

- [ ] Test "History" tab

- [ ] Click quick action buttons// Like a comment

const { success } = await likeComment(commentId, currentLikes)

---

// Delete a comment

## 🐛 Troubleshootingconst { success } = await deleteComment(commentId)

```

### Storage bucket not found

→ Run `RUN_THIS_STORAGE_MIGRATION.sql` in Supabase Dashboard### Ratings



### Homepage sections empty```typescript

→ Need at least 1 published series: `UPDATE series SET status = 'published' WHERE id = '[any-id]'`// Get all ratings for a series

const { ratings, userRating } = await getRatings(seriesId)

### Upload fails

→ Check Supabase Storage bucket exists and RLS policies are set// Create or update a rating

const { rating, error } = await createOrUpdateRating({

### Library shows errors  seriesId: "uuid",

→ Follow `LIBRARY_TESTING_GUIDE.md` for detailed steps  rating: 5,           // 1-5 stars

  review: "Amazing!"   // optional

---})



## 📚 Documentation// Delete your rating

const { success } = await deleteRating(seriesId)

- **IMPLEMENTATION_GUIDE.md** - Full implementation details, API reference, troubleshooting```

- **LIBRARY_TESTING_GUIDE.md** - 10 test cases, Supabase queries, RLS verification

- **RUN_THIS_STORAGE_MIGRATION.sql** - Storage bucket setup SQL---



---## Database Queries



## 🎯 What Works Now### Get Comments for a Series



### Before```sql

- ❌ No cover upload in story creationSELECT 

- ❌ Static homepage with 3 cards  c.*,

- ❌ No testing documentation for library  p.display_name,

  p.avatar_url

### AfterFROM comments c

- ✅ Full cover upload system with validationJOIN profiles p ON c.user_id = p.id

- ✅ Dynamic homepage with 3 new sectionsWHERE c.series_id = 'uuid'

- ✅ Comprehensive library testing guide  AND c.parent_id IS NULL

- ✅ All data from real database (no dummy data)ORDER BY c.created_at DESC;

```

---

### Get Average Rating

## 🚀 Ready to Go!

```sql

All code is written and ready to use. Just:SELECT 

1. Run the storage migration  AVG(rating) as avg_rating,

2. Test locally  COUNT(*) as total_ratings

3. Deploy to VercelFROM ratings

WHERE series_id = 'uuid';

Need help? Check IMPLEMENTATION_GUIDE.md for detailed instructions!```


### Get User's Rating for a Series

```sql
SELECT *
FROM ratings
WHERE series_id = 'uuid'
  AND user_id = 'uuid'
LIMIT 1;
```

---

## Common Issues & Solutions

### "You must be logged in" Error

**Cause**: Trying to comment/rate without authentication

**Solution**: 
1. Navigate to `/login`
2. Sign in with email/password
3. Return to page and try again

### Comments Not Showing

**Cause**: Page hasn't refreshed after posting

**Solution**:
- Component auto-refreshes after posting
- If not, manually refresh page (F5)

### Can't Delete Someone Else's Comment

**Cause**: RLS policies prevent modifying others' content

**Solution**: This is by design - you can only delete YOUR comments

### Rating Not Updating

**Cause**: Database trigger hasn't run yet

**Solution**: 
- Refresh page to see updated average
- Series avg_rating recalculates automatically

### TypeScript Import Errors

**Cause**: TS server cache issue

**Solution**: See `TYPESCRIPT_FIX.md` for detailed steps

---

## Testing Checklist

### Comments
- [ ] Create series comment
- [ ] Create chapter comment
- [ ] Reply to a comment
- [ ] Like a comment
- [ ] Delete own comment
- [ ] View nested replies
- [ ] See user avatars
- [ ] Check timestamps

### Ratings
- [ ] Rate a series (1-5 stars)
- [ ] Add review text
- [ ] Update existing rating
- [ ] Delete rating
- [ ] View average rating
- [ ] See all user reviews
- [ ] Check rating count updates

### Authentication
- [ ] Logged out: See "must login" messages
- [ ] Logged in: Full functionality works
- [ ] Can't delete others' content
- [ ] RLS enforces ownership

---

## File Locations

### Components
```
src/components/
├── comments/
│   ├── CommentSection.tsx    (main container)
│   ├── CommentForm.tsx        (input form)
│   └── CommentItem.tsx        (single comment)
└── ratings/
    ├── RatingSection.tsx      (main container)
    ├── RatingForm.tsx         (star selector + review)
    └── RatingItem.tsx         (single rating)
```

### Server Actions
```
src/app/actions/
└── reader-actions.ts
    ├── getComments()
    ├── createComment()
    ├── likeComment()
    ├── deleteComment()
    ├── getRatings()
    ├── createOrUpdateRating()
    └── deleteRating()
```

### Database
```
supabase/migrations/
└── 20251019_add_analytics_comments.sql
    ├── CREATE TABLE comments
    ├── CREATE TABLE ratings
    ├── CREATE TRIGGER update_series_comments
    ├── CREATE TRIGGER update_series_rating
    └── RLS policies
```

---

## Need Help?

📚 **Documentation**:
- `COMMENTS_RATINGS_SYSTEM.md` - Full feature guide
- `ARCHITECTURE.md` - System diagrams
- `PROJECT_STATUS.md` - Overall status
- `TYPESCRIPT_FIX.md` - TS issues

🐛 **Common Errors**:
1. Import errors → Reload VS Code window
2. Auth errors → Check if logged in
3. Database errors → Verify migration ran

🎯 **Next Steps**:
- Test all features
- Add real user data
- Deploy to production

---

**Everything is ready to go! 🎉**
