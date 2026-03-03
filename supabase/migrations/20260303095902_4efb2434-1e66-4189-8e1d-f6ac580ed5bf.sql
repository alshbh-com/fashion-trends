
-- Analytics events table for tracking visitor actions
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'page_visit', 'add_to_cart', 'checkout_start', 'order_incomplete'
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  session_id text, -- anonymous session identifier
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public insert (anonymous users track events)
CREATE POLICY "Allow public insert analytics_events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Allow public read (admin reads stats)
CREATE POLICY "Allow public read analytics_events"
ON public.analytics_events
FOR SELECT
USING (true);

-- Index for fast querying by date and type
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events (event_type, created_at DESC);
