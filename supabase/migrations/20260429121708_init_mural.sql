-- Create the mural_artes table
CREATE TABLE public.mural_artes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT,
    autor TEXT NOT NULL,
    url_imagem TEXT NOT NULL,
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    largura INT DEFAULT 1280,
    altura INT DEFAULT 720,
    reacoes JSONB DEFAULT '{}'::jsonb,
    regiao TEXT,
    aprovado BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mural_artes ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to read approved artwork
CREATE POLICY "Anyone can read approved artwork"
ON public.mural_artes
FOR SELECT
USING (aprovado = TRUE);

-- Create policy for anyone to insert artwork
CREATE POLICY "Anyone can insert artwork"
ON public.mural_artes
FOR INSERT
WITH CHECK (true);

-- Create policy for anyone to update reactions
CREATE POLICY "Anyone can update reactions"
ON public.mural_artes
FOR UPDATE
USING (true);

-- ==========================================
-- STORAGE POLICIES (for bucket 'artworks')
-- ==========================================

-- Allow public access to read files
CREATE POLICY "Allow public access to read artworks"
ON storage.objects FOR SELECT
USING ( bucket_id = 'artworks' );

-- Allow public access to upload files (via anon key)
CREATE POLICY "Allow public access to upload artworks"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'artworks' );

-- Create the increment_reaction function
CREATE OR REPLACE FUNCTION increment_reaction(p_arte_id UUID, p_emoji TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.mural_artes
  SET reacoes = jsonb_set(
      COALESCE(reacoes, '{}'::jsonb),
      array[p_emoji],
      (COALESCE((reacoes->>p_emoji)::int, 0) + 1)::text::jsonb,
      true
  )
  WHERE id = p_arte_id;
END;
$$ LANGUAGE plpgsql;
