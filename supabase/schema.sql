-- Supabase SQL Editor에 복사하여 붙여넣기 한 후 RUN 버튼을 눌러주세요.

CREATE TABLE public.card_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension JSONB NOT NULL,
    background_url TEXT,
    text_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) 설정: 프론트엔드 삽입/조회가 가능해야 합니다.
-- V1에서는 단순 공개 접근으로 설정합니다.
ALTER TABLE public.card_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON public.card_designs
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access"
ON public.card_designs
FOR INSERT
TO anon
WITH CHECK (true);
