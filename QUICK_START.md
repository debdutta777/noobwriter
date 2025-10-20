# 🚀 QUICK START GUIDE

## Development

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

## Build & Deploy

```bash
# Production build
npm run build

# Start production
npm start
```

## SQL Setup (Optional but Recommended)

1. Go to Supabase SQL Editor:
   https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql

2. Run this SQL:

```sql
-- Function to increment chapter views
CREATE OR REPLACE FUNCTION increment_chapter_views(p_chapter_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE chapters SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_chapter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment series views  
CREATE OR REPLACE FUNCTION increment_series_views(p_series_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE series SET total_views = COALESCE(total_views, 0) + 1 WHERE id = p_series_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_chapter_views(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_series_views(UUID) TO authenticated, anon;
```

3. Done! ✅

## Testing Checklist

- [ ] Homepage loads
- [ ] Can create account
- [ ] Can create series
- [ ] Can add chapters
- [ ] Can publish chapters
- [ ] Can read chapters
- [ ] Views increment
- [ ] Likes work
- [ ] Stats show correctly

## Common URLs

```
Homepage:          http://localhost:3000/
Writer Dashboard:  http://localhost:3000/write/dashboard
Browse:            http://localhost:3000/browse
Novels:            http://localhost:3000/novels
Manga:             http://localhost:3000/manga
Settings:          http://localhost:3000/settings
```

## Troubleshooting

**Q: TypeScript errors in VS Code?**
A: Close and reopen VS Code. They're cache issues.

**Q: Build fails?**
A: Run `npm run build` - If it succeeds, it's just VS Code cache.

**Q: Views not incrementing?**
A: Run the SQL functions above. There's a fallback but SQL is faster.

**Q: 404 errors?**
A: Restart dev server: `Ctrl+C` then `npm run dev`

## File Structure

```
src/
├── app/
│   ├── actions/        # Server actions
│   ├── browse/         # Browse page
│   ├── novels/         # Novels page
│   ├── manga/          # Manga page  
│   ├── read/           # Reader
│   ├── write/          # Writer dashboard
│   └── ...
├── components/
│   ├── ui/             # UI components
│   └── ...
└── lib/
    └── supabase/       # Supabase client
```

## Environment Variables

Create `.env` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## That's It!

Everything else is automatic. Happy coding! 🎉
