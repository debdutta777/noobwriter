# 🚀 Quick Start Guide - Comments & Ratings

## For Developers

### Adding Comments to a Page

```tsx
import CommentSection from '@/components/comments/CommentSection'

// For series comments
<CommentSection seriesId={seriesId} />

// For chapter comments  
<CommentSection chapterId={chapterId} />
```

### Adding Ratings to a Page

```tsx
import RatingSection from '@/components/ratings/RatingSection'

<RatingSection
  seriesId={seriesId}
  averageRating={series.avg_rating}
  totalRatings={series.total_ratings}
/>
```

---

## For Users

### How to Comment

1. **Navigate** to any series detail page or chapter
2. **Scroll** to the comments section
3. **Click** "Add Comment" button
4. **Type** your comment
5. **Click** "Post Comment"

**Requirements**: Must be logged in

### How to Reply

1. **Find** a comment you want to reply to
2. **Click** the "Reply" button
3. **Type** your reply
4. **Click** "Post Comment"

### How to Like a Comment

1. **Click** the heart icon (❤️) on any comment
2. Heart fills red and count increases
3. Can only like once per comment

### How to Delete Your Comment

1. **Click** the three dots (⋮) on YOUR comment
2. **Select** "Delete"
3. **Confirm** the deletion

---

### How to Rate a Series

1. **Navigate** to series detail page
2. **Click** "Reviews" tab
3. **Click** "Rate This Series"
4. **Select** 1-5 stars (click the stars)
5. **Optionally** write a review
6. **Click** "Submit Rating"

**Requirements**: Must be logged in

### How to Update Your Rating

1. **Navigate** to series detail page
2. **Click** "Reviews" tab
3. **Click** "Update Rating"
4. **Change** stars or review text
5. **Click** "Update Rating"

### How to Delete Your Rating

1. **Navigate** to series detail page
2. **Click** "Reviews" tab
3. **Click** "Update Rating"
4. **Click** "Delete Rating"
5. **Confirm** deletion

---

## Server Actions Reference

### Comments

```typescript
// Get comments with nested replies
const { comments } = await getComments(seriesId, chapterId)

// Create a comment
const { comment, error } = await createComment({
  content: "Great chapter!",
  seriesId: "uuid",
  chapterId: "uuid",  // optional
  parentId: "uuid"     // optional, for replies
})

// Like a comment
const { success } = await likeComment(commentId, currentLikes)

// Delete a comment
const { success } = await deleteComment(commentId)
```

### Ratings

```typescript
// Get all ratings for a series
const { ratings, userRating } = await getRatings(seriesId)

// Create or update a rating
const { rating, error } = await createOrUpdateRating({
  seriesId: "uuid",
  rating: 5,           // 1-5 stars
  review: "Amazing!"   // optional
})

// Delete your rating
const { success } = await deleteRating(seriesId)
```

---

## Database Queries

### Get Comments for a Series

```sql
SELECT 
  c.*,
  p.display_name,
  p.avatar_url
FROM comments c
JOIN profiles p ON c.user_id = p.id
WHERE c.series_id = 'uuid'
  AND c.parent_id IS NULL
ORDER BY c.created_at DESC;
```

### Get Average Rating

```sql
SELECT 
  AVG(rating) as avg_rating,
  COUNT(*) as total_ratings
FROM ratings
WHERE series_id = 'uuid';
```

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
