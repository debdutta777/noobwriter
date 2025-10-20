-- Create atomic increment functions for views and stats

-- Function to increment chapter views atomically
CREATE OR REPLACE FUNCTION increment_chapter_views(p_chapter_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE chapters
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_chapter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment series views atomically
CREATE OR REPLACE FUNCTION increment_series_views(p_series_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE series
  SET total_views = COALESCE(total_views, 0) + 1,
      updated_at = NOW()
  WHERE id = p_series_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update series total chapters count
CREATE OR REPLACE FUNCTION update_series_chapter_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE series
    SET total_chapters = (
      SELECT COUNT(*) FROM chapters WHERE series_id = NEW.series_id
    )
    WHERE id = NEW.series_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE series
    SET total_chapters = (
      SELECT COUNT(*) FROM chapters WHERE series_id = OLD.series_id
    )
    WHERE id = OLD.series_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for chapter count updates
DROP TRIGGER IF EXISTS update_series_chapter_count_trigger ON chapters;
CREATE TRIGGER update_series_chapter_count_trigger
AFTER INSERT OR DELETE ON chapters
FOR EACH ROW
EXECUTE FUNCTION update_series_chapter_count();

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_chapter_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_series_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_chapter_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_series_views(UUID) TO anon;
