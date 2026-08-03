-- 1) Shareable draft preview tokens ------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_preview_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  label text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  revoked boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_preview_tokens TO authenticated;
GRANT ALL ON public.cms_preview_tokens TO service_role;

ALTER TABLE public.cms_preview_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage preview tokens" ON public.cms_preview_tokens;
CREATE POLICY "Admins manage preview tokens"
  ON public.cms_preview_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_cms_preview_tokens_updated_at ON public.cms_preview_tokens;
CREATE TRIGGER update_cms_preview_tokens_updated_at
  BEFORE UPDATE ON public.cms_preview_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Secure resolver: returns draft settings + unpublished content ONLY for a valid token
CREATE OR REPLACE FUNCTION public.resolve_cms_preview(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.cms_preview_tokens;
  v_result jsonb;
BEGIN
  SELECT * INTO v_row FROM public.cms_preview_tokens
   WHERE token = _token AND revoked = false AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  UPDATE public.cms_preview_tokens
     SET view_count = view_count + 1, last_viewed_at = now()
   WHERE id = v_row.id;

  SELECT jsonb_build_object(
    'valid', true,
    'label', v_row.label,
    'expires_at', v_row.expires_at,
    'settings', (SELECT draft FROM public.site_settings LIMIT 1),
    'blogs', COALESCE((SELECT jsonb_agg(to_jsonb(b) ORDER BY b.sort_order) FROM public.cms_blogs b), '[]'::jsonb),
    'stories', COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order) FROM public.cms_stories s), '[]'::jsonb),
    'tips', COALESCE((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.sort_order) FROM public.cms_tips t), '[]'::jsonb),
    'channels', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.sort_order) FROM public.cms_channels c), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_cms_preview(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_cms_preview(uuid) TO anon, authenticated, service_role;

-- 2) Seed curated content into the CMS tables ---------------------------------
INSERT INTO public.cms_blogs (slug, title, excerpt, body, author, category, tags, read_time, image_url, is_featured, is_published, sort_order)
VALUES
 ('ultimate-first-timers-guide-to-india','The Ultimate First-Timer''s Guide to India','Everything you need to know before your first trip to the subcontinent — from visas to vibes.','India isn''t a destination — it''s a transformation. This guide covers visa processes, health precautions, cultural norms, packing essentials, and the mindset shift needed to truly embrace the chaos and beauty of India.

Start with the Golden Triangle (Delhi-Agra-Jaipur) for history, head south to Kerala for serenity, or go northeast for untouched landscapes.

Pro tips: Get a local SIM at the airport, download offline maps, carry a scarf for temple visits, and always say yes to chai from strangers.','Travelista Editorial','Travel Guide',ARRAY['Beginner','Planning','India 101'],'12 min','/placeholder.svg',true,true,1),
 ('why-homestays-are-the-future','Why Homestays Are the Future of Travel in India','Forget cookie-cutter hotels. Here''s why staying with an Indian family will change how you travel forever.','The global travel industry is shifting from transactional to transformational. Indian homestays offer a seat at the family dinner table, a grandmother who teaches you to cook, and a window into daily life no guidebook captures.

Homestays also support local economies directly. Homestay bookings in India grew 340% in the last 3 years, and travelers who choose homestays rate their trips 47% higher on satisfaction.','Deepak S.','Industry Insights',ARRAY['Homestays','Sustainable Travel','Economy'],'8 min','/placeholder.svg',false,true,2),
 ('10-adventure-sports-in-india','10 Adventure Sports in India That Will Test Your Limits','From skydiving over Goa to rafting the Ganges — India''s adventure scene is world-class and wildly affordable.','India is quietly becoming one of the world''s top adventure sport destinations.

1. Paragliding at Bir Billing
2. White water rafting in Rishikesh
3. Skydiving in Goa
4. Bungee jumping at Rishikesh
5. Scuba diving at Grande Island, Goa
6. Desert dune bashing in Jaisalmer
7. Surfing at Mulki, Karnataka
8. Canyoning in Meghalaya
9. Mountain biking in Spiti Valley
10. Zip-lining at Neemrana Fort

Prices are 60-80% cheaper than equivalent experiences in Europe or North America.','Kiran M.','Adventure',ARRAY['Adventure Sports','Skydiving','Rafting','Paragliding'],'10 min','/placeholder.svg',true,true,3),
 ('food-lovers-roadmap-north-india','A Food Lover''s Roadmap Through North India','From Delhi''s kebab lanes to Jaipur''s sweet shops — a definitive guide to eating your way across the north.','North India is a food civilization. This guide takes you through the essential food experiences across Delhi, Jaipur, Varanasi, Amritsar, and Lucknow.

Start in Old Delhi''s Chandni Chowk. Move to Jaipur for pyaaz kachori and dal baati churma. In Varanasi, street chai and kachori at sunrise are spiritual experiences. Amritsar''s langar serves 100,000 free meals daily. Lucknow''s Tunday Kebabi has been making tender kebabs for 120 years.','Deepak S.','Food & Culture',ARRAY['Food','Street Food','North India','Guide'],'9 min','/placeholder.svg',false,true,4),
 ('wellness-tourism-in-india','Wellness Tourism in India: Ancient Healing for Modern Minds','From Ayurvedic retreats in Kerala to yoga therapy in Rishikesh — India''s wellness heritage is 5,000 years deep.','India is the birthplace of yoga, Ayurveda, and meditation.

Kerala''s Panchakarma retreats offer complete mind-body resets. Rishikesh''s ashrams provide the original yoga experience. Varanasi''s spiritual energy creates a natural environment for deep meditation.

Medical tourism is also booming: dental work, Ayurvedic treatments, and yoga therapy cost a fraction of Western prices.','Priya K.','Wellness',ARRAY['Ayurveda','Yoga','Wellness','Medical Tourism'],'7 min','/placeholder.svg',false,true,5),
 ('indian-wedding-as-a-foreign-guest','How to Attend an Indian Wedding as a Foreign Guest','The ultimate guide to experiencing the world''s most extravagant celebrations — colors, chaos, and infinite food.','Indian weddings are multi-day spectacles of color, music, food, and joy.

What to wear: bright colors (never white). A saree or salwar kameez, or a kurta pajama for men.

What to expect: multiple ceremonies over 2-5 days, more food than you can imagine, dancing until your feet hurt, and being treated like family by complete strangers.','Ravi S.','Culture',ARRAY['Wedding','Culture','Etiquette','Festival'],'11 min','/placeholder.svg',false,true,6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_stories (slug, title, author, location, excerpt, body, image_url, tags, is_published, sort_order)
VALUES
 ('how-ravi-changed-my-perspective','How Ravi Changed My Perspective on Travel','Emily R.','Jaipur, Rajasthan','I came to India as a tourist and left as a friend.','When I first arrived in Jaipur, I was overwhelmed by the noise, the crowds, the heat. But Ravi met me with a warm smile and a cup of chai. Over the next four days he took me to his mother''s kitchen where she taught me to make dal baati churma, to a block-printing workshop in a narrow lane, and to a rooftop at sunset watching kites fill the sky.','/placeholder.svg',ARRAY['Rajasthan','Homestay','Food'],true,1),
 ('finding-peace-on-the-ganges','Finding Peace on the Ganges','Hans K.','Varanasi, Uttar Pradesh','The sunrise meditation was the most profound experience of my life.','I''m an engineer from Munich. I don''t meditate. But something about Varanasi pulled me in. Arjun woke me at 4:30 AM for the sunrise boat ride. As we floated down the Ganges he explained the philosophy of life and death. Then we meditated on the ghats as the sun rose, and for the first time my mind was completely quiet.','/placeholder.svg',ARRAY['Spiritual','Varanasi'],true,2),
 ('cooking-with-grandmother','Cooking with Grandmother — A Love Story','Akiko T.','Alleppey, Kerala','Learning Kerala fish curry with Priya''s grandmother is a memory I''ll treasure forever.','In Japan I run a small restaurant. I came to Kerala to learn about spices. Priya''s grandmother showed me how to grind coconut, roast spices and make the perfect fish curry. We didn''t share a language, but cooking is its own language.','/placeholder.svg',ARRAY['Kerala','Food','Culture'],true,3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_tips (slug, title, category, body, icon, is_published, sort_order)
VALUES
 ('best-time-to-visit-india','Best Time to Visit India','culture','October to March offers the most comfortable weather across most of India. Monsoon season (July-Sept) is magical in Kerala and Goa. Avoid the extreme heat of April-June unless you''re heading to the Himalayas.','🌤️',true,1),
 ('respecting-local-customs','Respecting Local Customs','culture','Remove shoes before entering homes and temples. Dress modestly at religious sites. Always ask before photographing people. Use your right hand for greetings and eating.','🙏',true,2),
 ('staying-safe','Staying Safe','safety','Book through Travelista for verified hosts. Share your itinerary with family. Keep digital copies of all documents. Stay hydrated. Use reputable transport. Trust your instincts.','🛡️',true,3),
 ('food-and-water-safety','Food & Water Safety','food','Drink only bottled or filtered water. Street food from busy stalls is generally safe — look for high turnover. Start mild and build up spice tolerance. Carry antacids and ORS packets.','🍽️',true,4),
 ('getting-around-india','Getting Around India','transport','Trains are the backbone — book sleeper class for an authentic experience. Domestic flights connect major cities cheaply. Negotiate auto-rickshaw fares before starting. Uber/Ola work in cities.','🚂',true,5),
 ('packing-essentials','Packing Essentials','packing','Light, breathable cotton clothes. Comfortable walking shoes. Sunscreen and insect repellent. A scarf/shawl (multipurpose). Power adapter (Type C/D).','🎒',true,6),
 ('money-tips','Money Tips','money','UPI payments are ubiquitous — set up Google Pay or PhonePe. ATMs are everywhere but carry cash for rural areas. Haggling is expected in markets. Tip 10% at restaurants.','💰',true,7),
 ('health-precautions','Health Precautions','health','Consult a travel doctor 6 weeks before departure. Carry a basic first-aid kit. Sunstroke is real — wear a hat and drink 3+ litres daily. Altitude sickness is possible above 3000m.','🏥',true,8),
 ('photography-etiquette','Photography Etiquette','culture','Many temples prohibit photography inside. Always ask permission before photographing people. Sunrise and sunset offer magical light. Drones require government permits.','📸',true,9),
 ('learning-basic-hindi','Learning Basic Hindi','culture','A few words go a long way: namaste (hello), dhanyavaad (thank you), kitna (how much), paani (water), theek hai (okay). Hosts love it when travelers try.','🗣️',true,10)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_channels (slug, name, description, icon, color, member_count, is_published, sort_order)
VALUES
 ('solo-travelers','Solo Travelers India','Tips, meetups and safety advice for travelling India alone.','Compass','text-primary',4820,true,1),
 ('food-explorers','Food Explorers','Street food trails, home kitchens and regional thali hunts.','Utensils','text-accent',6310,true,2),
 ('himalayan-treks','Himalayan Treks','Route beta, permits and gear talk for the mountains.','Mountain','text-primary',3150,true,3),
 ('women-who-wander','Women Who Wander','A safe space for women travellers exploring India.','Heart','text-destructive',5240,true,4),
 ('digital-nomads','Digital Nomads India','Cafés, coworking, SIMs and long-stay hacks.','Laptop','text-accent',2760,true,5),
 ('festivals-and-culture','Festivals & Culture','Holi, Diwali, Pushkar Mela — plan around India''s calendar.','Sparkles','text-primary',3990,true,6)
ON CONFLICT (slug) DO NOTHING;