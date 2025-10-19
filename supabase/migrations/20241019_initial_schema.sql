-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'admin')),
    kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Series table
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('novel', 'manga')),
    status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
    genres TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en',
    age_rating TEXT DEFAULT 'PG',
    total_chapters INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_favorites INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    word_count INTEGER,
    page_count INTEGER,
    is_premium BOOLEAN DEFAULT false,
    coin_price INTEGER,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(series_id, chapter_number),
    UNIQUE(series_id, slug)
);

-- Manga pages table
CREATE TABLE manga_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chapter_id, page_number)
);

-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    coin_balance INTEGER DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'unlock', 'tip', 'earning', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    coin_amount INTEGER,
    description TEXT NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapter unlocks table
CREATE TABLE chapter_unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, series_id)
);

-- Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, series_id)
);

-- Reading progress table
CREATE TABLE reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    razorpay_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_series_author ON series(author_id);
CREATE INDEX idx_series_status ON series(status);
CREATE INDEX idx_series_content_type ON series(content_type);
CREATE INDEX idx_chapters_series ON chapters(series_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_comments_chapter ON comments(chapter_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);

-- Function to add coins to wallet
CREATE OR REPLACE FUNCTION add_coins_to_wallet(p_user_id UUID, p_coins INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO wallets (user_id, coin_balance)
    VALUES (p_user_id, p_coins)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        coin_balance = wallets.coin_balance + p_coins,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to deduct coins from wallet
CREATE OR REPLACE FUNCTION deduct_coins_from_wallet(p_user_id UUID, p_coins INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    SELECT coin_balance INTO current_balance FROM wallets WHERE user_id = p_user_id;
    
    IF current_balance >= p_coins THEN
        UPDATE wallets 
        SET coin_balance = coin_balance - p_coins,
            total_spent = total_spent + p_coins,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update series stats
CREATE OR REPLACE FUNCTION update_series_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE series
    SET total_chapters = (
        SELECT COUNT(*) FROM chapters 
        WHERE series_id = NEW.series_id AND is_published = true
    ),
    updated_at = NOW()
    WHERE id = NEW.series_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_series_stats
AFTER INSERT OR UPDATE ON chapters
FOR EACH ROW
EXECUTE FUNCTION update_series_stats();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Series policies
CREATE POLICY "Published series are viewable by everyone"
    ON series FOR SELECT
    USING (published_at IS NOT NULL OR auth.uid() = author_id);

CREATE POLICY "Authors can create series"
    ON series FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own series"
    ON series FOR UPDATE
    USING (auth.uid() = author_id);

-- Wallet policies
CREATE POLICY "Users can view own wallet"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

-- Transaction policies
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);
