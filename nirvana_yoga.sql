--
-- PostgreSQL database dump
--

\restrict IJY1s3fsc3PCKkTe9KK7PBTkEr2ETBFaCRdIMWkkgTtyv8m6EpaQF3KOXiHCsIq

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CollageLayout; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CollageLayout" AS ENUM (
    'MASONRY',
    'STACKED',
    'ASYMMETRICAL_GRID',
    'HERO_SUPPORTING',
    'HORIZONTAL_STRIP',
    'FEATURED_SUPPORTING'
);


ALTER TYPE public."CollageLayout" OWNER TO postgres;

--
-- Name: EventCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EventCategory" AS ENUM (
    'YOGA',
    'HEALING',
    'JUST_ART_LIFE',
    'RETREATS_AND_TOURS',
    'RETREAT',
    'WORKSHOP',
    'TEACHER_TRAINING',
    'PHILOSOPHY',
    'YOGA_NIDRA'
);


ALTER TYPE public."EventCategory" OWNER TO postgres;

--
-- Name: GalleryCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GalleryCategory" AS ENUM (
    'ART',
    'YOGA_NIDRA',
    'EVENTS',
    'RETREATS',
    'HEALING',
    'JAPAN_EVENTS'
);


ALTER TYPE public."GalleryCategory" OWNER TO postgres;

--
-- Name: HeroMediaMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HeroMediaMode" AS ENUM (
    'SINGLE',
    'ROTATING',
    'COLLAGE',
    'FEATURED_COLLECTION'
);


ALTER TYPE public."HeroMediaMode" OWNER TO postgres;

--
-- Name: PageSectionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PageSectionType" AS ENUM (
    'HERO',
    'IMAGE_TEXT',
    'GALLERY',
    'TESTIMONIALS',
    'EVENTS',
    'CONTACT',
    'CUSTOM_TEXT'
);


ALTER TYPE public."PageSectionType" OWNER TO postgres;

--
-- Name: PageType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PageType" AS ENUM (
    'YOGA',
    'HEALING',
    'JUST_ART_LIFE',
    'ABOUT'
);


ALTER TYPE public."PageType" OWNER TO postgres;

--
-- Name: PreferredContactMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PreferredContactMethod" AS ENUM (
    'WHATSAPP',
    'CALL',
    'SMS',
    'EMAIL',
    'LINE',
    'TELEGRAM',
    'OTHER'
);


ALTER TYPE public."PreferredContactMethod" OWNER TO postgres;

--
-- Name: TestimonialDisplayStyle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TestimonialDisplayStyle" AS ENUM (
    'CARD',
    'HANDWRITTEN'
);


ALTER TYPE public."TestimonialDisplayStyle" OWNER TO postgres;

--
-- Name: TestimonialSourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TestimonialSourceType" AS ENUM (
    'TEXT',
    'IMAGE',
    'OCR'
);


ALTER TYPE public."TestimonialSourceType" OWNER TO postgres;

--
-- Name: TestimonialStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TestimonialStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."TestimonialStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AboutPage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AboutPage" (
    id text NOT NULL,
    eyebrow text NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    "imageSrc" text NOT NULL,
    "imageAlt" text NOT NULL,
    paragraphs text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AboutPage" OWNER TO postgres;

--
-- Name: BlogPost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BlogPost" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    summary text NOT NULL,
    content text NOT NULL,
    "coverImageUrl" text,
    tags text[] DEFAULT ARRAY[]::text[],
    published boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text
);


ALTER TABLE public."BlogPost" OWNER TO postgres;

--
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "preferredContactMethod" public."PreferredContactMethod"
);


ALTER TABLE public."ContactMessage" OWNER TO postgres;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "endsAt" timestamp(3) without time zone,
    "imageUrl" text,
    price double precision,
    "isFeatured" boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text,
    category public."EventCategory" DEFAULT 'YOGA'::public."EventCategory" NOT NULL
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: GalleryCollage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GalleryCollage" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    layout public."CollageLayout" DEFAULT 'MASONRY'::public."CollageLayout" NOT NULL,
    category public."GalleryCategory" NOT NULL,
    "collectionId" text,
    "imageIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GalleryCollage" OWNER TO postgres;

--
-- Name: GalleryCollection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GalleryCollection" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    category public."GalleryCategory" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GalleryCollection" OWNER TO postgres;

--
-- Name: GalleryImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GalleryImage" (
    id text NOT NULL,
    title text,
    url text NOT NULL,
    "altText" text,
    description text,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category public."GalleryCategory" DEFAULT 'ART'::public."GalleryCategory" NOT NULL,
    "featuredOnHomepage" boolean DEFAULT false NOT NULL,
    "sourceKey" text,
    "collectionId" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "uploadPath" text,
    height integer,
    "mediumUrl" text,
    "thumbnailUrl" text,
    width integer
);


ALTER TABLE public."GalleryImage" OWNER TO postgres;

--
-- Name: HeroSection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HeroSection" (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    "primaryCtaLabel" text NOT NULL,
    "primaryCtaHref" text NOT NULL,
    "secondaryCtaLabel" text NOT NULL,
    "secondaryCtaHref" text NOT NULL,
    "imageSrc" text NOT NULL,
    "imageAlt" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "collageId" text,
    "featuredCollectionId" text,
    "mediaMode" public."HeroMediaMode" DEFAULT 'SINGLE'::public."HeroMediaMode" NOT NULL,
    "rotatingImages" jsonb
);


ALTER TABLE public."HeroSection" OWNER TO postgres;

--
-- Name: NewsletterSubscriber; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NewsletterSubscriber" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "subscribedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."NewsletterSubscriber" OWNER TO postgres;

--
-- Name: PageSection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageSection" (
    id text NOT NULL,
    "pageType" public."PageType" NOT NULL,
    "sectionType" public."PageSectionType" NOT NULL,
    title text,
    subtitle text,
    content text,
    "imageUrl" text,
    "imageAlt" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    payload jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    layout jsonb
);


ALTER TABLE public."PageSection" OWNER TO postgres;

--
-- Name: SiteConfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SiteConfig" (
    id text NOT NULL,
    name text NOT NULL,
    tagline text NOT NULL,
    "contactEmail" text NOT NULL,
    "contactPhone" text NOT NULL,
    "contactAddress" text NOT NULL,
    social jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "homepageLayout" jsonb,
    "homepageSections" jsonb,
    navigation jsonb,
    branding jsonb
);


ALTER TABLE public."SiteConfig" OWNER TO postgres;

--
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Testimonial" (
    id text NOT NULL,
    quote text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    role text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."TestimonialStatus" DEFAULT 'APPROVED'::public."TestimonialStatus" NOT NULL,
    "imageAlt" text,
    "imageUrl" text,
    city text,
    country text,
    "displayStyle" public."TestimonialDisplayStyle" DEFAULT 'HANDWRITTEN'::public."TestimonialDisplayStyle" NOT NULL,
    "extractedText" text,
    "ocrConfidence" double precision,
    "sourceType" public."TestimonialSourceType" DEFAULT 'TEXT'::public."TestimonialSourceType" NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Testimonial" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "avatarUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: AboutPage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AboutPage" (id, eyebrow, title, subtitle, "imageSrc", "imageAlt", paragraphs, "createdAt", "updatedAt") FROM stdin;
about	About	Shalini Gupta	Nirvana Yoga began as a small circle seeking slower rhythms: breath-led classes, honest conversation, and room for beginners and longtime practitioners alike.	/uploads/homepage/whatsapp-image-2026-05-25-at-5-54-18-pm-1779875333765-4f015402.jpg	Hands resting in meditation	{"Shalini Gupta is a yoga practitioner/teacher, meditation teacher, and wellness facilitator with over 25 years of experience in yoga, mindfulness, and inner awareness practices.","Raised in a family rooted in traditional yogic teachings in India, she studied both the academic and experiential dimensions of yoga at a renowned yoga university in India. Her path later expanded into healings, mindfulness, human psychology, and holistic well-being.","Her teaching approach integrates body, breath, awareness, and conscious living — guiding people toward balance, clarity, relaxation, and deeper connection with themselves.","Shalini has worked with students from diverse cultures and age groups around the world, supporting physical, mental, and emotional well-being through authentic traditional practices.","She received extensive training at the renowned Bihar School of Yoga, whose teachings form a strong foundation of her practice and teaching style.","Alongside yoga, Shalini also works with art and holistic healing practices as pathways for self-expression, inner awareness, and transformation.","Her approach creates spaces where creativity, mindfulness, and conscious living come together to support emotional balance, clarity, and deeper connection with the self. Her work bridges ancient wisdom with modern understanding, offering practices that are both authentic and accessible for contemporary life."}	2026-05-23 07:55:15.263	2026-06-12 07:06:34.687
\.


--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BlogPost" (id, title, slug, summary, content, "coverImageUrl", tags, published, "publishedAt", "createdAt", "updatedAt", "authorId") FROM stdin;
d21b7856-1620-455b-a31d-675c46c4f3fe	Beginner’s Guide to Conscious Breathing	beginners-guide-conscious-breathing	Learn simple breath practices to reduce stress and support focus.	Breathwork is the foundation of grounded and mindful yoga practice...	https://images.unsplash.com/photo-1517836357463-d25dfeac3438	{breath,beginner}	t	2026-05-23 07:55:15.251	2026-05-23 07:55:15.251	2026-05-23 07:55:15.251	\N
5c9b7bec-ce9d-44f5-9692-c5be562d9303	How to Choose the Right Yoga Class for You	choose-right-yoga-class	A practical guide to matching your goals with the right style and pace.	Whether you are new to yoga or returning after a break, selecting the right class matters...	https://images.unsplash.com/photo-1500530855697-b586d89ba3ee	{community,practice}	t	2026-05-23 07:55:15.251	2026-05-23 07:55:15.251	2026-05-23 07:55:15.251	\N
dd26090e-972e-416a-be05-76d19c4db2e2	evening talk with mamiji	here-are-many-variations-of-passages-of-lorem-ipsum-available-but-the-majority-have-suffered-alteration-in-some-form-by-injected-humour-or-randomised-words-which-dont-look-even-slightly-believable-if-you-are-going-to-use-a-passage-of-lorem-ipsum-you-need-to-be-sure-there-isnt-anything-embarrassing-hidden-in-the-middle-of-text-all-the-lorem-ipsum-generators-on-the-internet-tend-to-repeat-predefined-chunks-as-necessary-making-this-the-first-true-generator-on-the-internet-it-us	here are many variations of passages of Lorem 	000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Fini	https://www.anytimefitness.co.in/wp-content/uploads/2023/05/Yoga.jpg	{qdwwddw;dw;31ff;ww}	t	2026-05-23 16:22:30.593	2026-05-23 16:24:44.156	2026-05-24 12:13:11.502	\N
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContactMessage" (id, name, email, subject, message, "createdAt", "preferredContactMethod") FROM stdin;
b6e41d72-5dd8-4641-a16c-5a885d2893ed	Jamie Lee	jamie@example.com	Workshop availability	Hi team, I’d like to know when the next restorative workshop is scheduled.	2026-05-23 07:55:15.293	\N
ac37f4e2-ffff-41e6-8506-59853d4f1cfb	anikait agrawal	anikaitar@gmail.com	Healing inquiry	wwdDWFQFQF\n\nPhone: +919958736236	2026-05-26 21:31:28.593	CALL
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, title, slug, description, location, "startsAt", "endsAt", "imageUrl", price, "isFeatured", published, "createdAt", "updatedAt", "authorId", category) FROM stdin;
ecc1b8b2-f7d3-47f9-9c88-54ec40d12379	Yoga retreat 	yog	Our retreat was created with a simple yet profound intention — to introduce authentic Ayurveda in its true spirit, beyond trends and\nsurface-level wellness experiences.\nThe first retreat was conducted in South India with a beautiful group of Japanese participants who came together to slow down, heal,\nlearn, and reconnect with themselves through traditional Ayurvedic living, yoga, meditation, and cultural immersion.\nSet amidst the natural beauty and warmth of South India, this retreat became more than a wellness holiday. It became an experience of\nliving Ayurveda.	south india	2026-05-26 05:14:00	\N	/uploads/events/whatsapp-image-2026-05-25-at-5-57-38-pm-1779792645868-31e639d4.jpg	600	f	t	2026-05-26 10:51:20.664	2026-05-26 10:51:20.664	\N	YOGA
d3080fa8-7eea-4a67-8043-7a18733bf791	Yoga Session (English) — Thursday 10–11 am JST	yoga-session-thursday-10am	Weekly yoga session every Thursday, 10:00–11:00 am JST. English — available online and offline.	Online & offline	2026-06-11 01:00:00	2026-06-11 02:00:00	\N	\N	t	t	2026-06-11 08:13:14.702	2026-06-11 08:13:14.702	\N	YOGA
5dbc8330-2b8d-4aff-b1f5-3cfc332d7e55	Yoga Nidra & Ayurveda Cooking	yoga-nidra-ayurveda-cooking-hiroshima	A two-day workshop weaving Yoga Nidra with Ayurveda cooking in Hiroshima, Japan — 30 & 31 May 2026.	Hiroshima, Japan	2026-05-30 00:00:00	2026-05-31 14:00:00	\N	\N	t	t	2026-06-11 08:13:14.713	2026-06-11 08:13:14.713	\N	WORKSHOP
f8d06266-8c11-4a88-bb30-515e712b68cb	Yoga Nidra Teachers Training Course	yoga-nidra-tt-july	11-hour Yoga Nidra Teachers Training Course — available in English & Japanese. Japanese sessions on 8 & 15 July at the local studio (online and offline). For the English online course, please email us.	Local studio — online & offline	2026-07-08 01:00:00	2026-07-15 10:00:00	\N	\N	t	t	2026-06-11 08:13:14.724	2026-06-11 08:13:14.724	\N	TEACHER_TRAINING
a3b49122-2ea9-4229-8b6b-75a343c5fd8b	India Retreat	Rejuvenation, Therapy, Lifestyle	Retreat in India —Yoga, Ayurveda therapies, YogaNidra, Meditation, Cultural Immmersion	India	2026-09-28 18:30:00	2026-10-10 11:12:00	\N	\N	t	t	2026-06-11 08:13:14.717	2026-06-17 07:47:14.593	\N	RETREAT
c6750dff-ae81-4011-b80f-6212fede83c7	Yoga Sutra & Philosophy Sessions	Learn Yoga Sutra and philosophy	8-hour course in English exploring Patanjali's Yoga Sutras — sessions on 18 & 25 August.	Online	2026-08-17 19:30:00	2026-08-25 04:30:00	\N	\N	t	t	2026-06-11 08:13:14.727	2026-06-17 07:48:33.893	\N	PHILOSOPHY
2232c896-2d6b-48ee-8708-fa6a763ef3c2	Yoga Nidra (Japanese) — Weekly	Deep realxation session with Pranayama and Asana	Weekly Yoga Nidra session in Japanese. Every Wednesday, 1:30 pm and Every Friday, 7:30 pm at the local studio — deep relaxation and conscious rest.	Local studio	2026-06-24 08:00:00	2026-06-24 09:00:00	\N	\N	t	t	2026-06-11 08:13:14.681	2026-06-17 07:50:58.334	\N	YOGA_NIDRA
8e00c17c-e4e7-42a8-a469-868b86de62b2	Yoga Session (English) — Thursday 7–8 am JST	Asana ,Pranayama, Bandha, Meditation	Weekly yoga session every Thursday, 6:30am IST — available online.	Online & offline	2026-06-18 01:00:00	2026-06-18 02:00:00	\N	\N	t	t	2026-06-11 08:13:14.709	2026-06-17 07:53:24.552	\N	YOGA
b98a5a07-c530-408a-99b7-4462a87afe36	Art Summer Camp	Joy of creativity 	Set of 2 canvases done in 2 days. Acrylic on canvas. All supplies are included.	Motomachi, Yokohama 	2026-06-22 01:00:00	2026-06-24 01:00:00	/uploads/events/img-0301-1781684077408-2763691a.jpg	\N	f	t	2026-06-17 08:16:44.318	2026-06-17 08:16:44.318	\N	JUST_ART_LIFE
\.


--
-- Data for Name: GalleryCollage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GalleryCollage" (id, name, slug, layout, category, "collectionId", "imageIds", "isPublished", "createdAt", "updatedAt") FROM stdin;
8d68a3c5-e1b3-4445-a158-a8342b97bd5c	new collage 	s	MASONRY	ART	\N	["2efcebab-9655-49dd-8081-2ebe4a1f758d", "80b8bdc9-ee23-48c6-ad7f-b14b7f1f29a5", "d4bb48d0-4140-44ce-a866-10d70ba2ad41", "5bf919c8-5580-4f62-9703-5eefea04804a", "72af41df-f475-435e-bb45-6d191170b2a3", "58e6c0de-3582-4e41-858a-8d8bd233e050", "abf3cc92-c6aa-48e4-8347-2c3fa54deef9", "6c40e6da-3c5e-4186-9f86-76adbc03edc6"]	t	2026-05-27 06:49:45.669	2026-06-10 18:51:40.141
\.


--
-- Data for Name: GalleryCollection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GalleryCollection" (id, slug, title, description, category, "sortOrder", "createdAt", "updatedAt") FROM stdin;
1ca88e87-60bb-49e8-98e9-edd825aff651	art	Art & creative life	Art, colour, and mindful creativity at Nirvana Yoga.	ART	0	2026-05-26 23:14:53.689	2026-05-26 23:14:53.689
df6709e3-bee8-450e-b9f8-36f0e20c9553	yoga-nidra	Yoga Nidra	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	YOGA_NIDRA	1	2026-05-26 23:14:53.703	2026-05-26 23:14:53.703
aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	japan-events	Embassy of India in Japan	Cultural gatherings with the Embassy of India in Japan.	JAPAN_EVENTS	2	2026-05-26 23:14:53.706	2026-05-26 23:14:53.706
\.


--
-- Data for Name: GalleryImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GalleryImage" (id, title, url, "altText", description, "isPublished", "createdAt", "updatedAt", category, "featuredOnHomepage", "sourceKey", "collectionId", "sortOrder", "uploadPath", height, "mediumUrl", "thumbnailUrl", width) FROM stdin;
72af41df-f475-435e-bb45-6d191170b2a3	Art & studio moment 4	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1779835765385-d2ab79e9-full.webp	Art and creative practice — photo 4 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.394	2026-06-11 08:09:18.595	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.04 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	4	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1779835765385-d2ab79e9.jpg	1229	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1779835765385-d2ab79e9-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1779835765385-d2ab79e9-thumb.webp	2048
abf3cc92-c6aa-48e4-8347-2c3fa54deef9	Art & studio moment 6	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1-1779835765407-372f6406-full.webp	Art and creative practice — photo 6 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.416	2026-06-11 08:09:19.673	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.06 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	6	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1-1779835765407-372f6406.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1-1779835765407-372f6406-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1-1779835765407-372f6406-thumb.webp	1536
a6736392-a13e-4761-b54c-2443c8c74913	Art & studio moment 8	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-07-pm-1779835765430-870eb3b7-full.webp	Art and creative practice — photo 8 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.44	2026-06-11 08:09:20.417	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.07 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	8	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-07-pm-1779835765430-870eb3b7.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-07-pm-1779835765430-870eb3b7-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-07-pm-1779835765430-870eb3b7-thumb.webp	1536
79f2f3c6-51db-4f73-828d-24af25123390	Art & studio moment 9	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1-1779835765442-c403dd9f-full.webp	Art and creative practice — photo 9 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.451	2026-06-11 08:09:20.94	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.08 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	9	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1-1779835765442-c403dd9f.jpg	1079	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1-1779835765442-c403dd9f-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1-1779835765442-c403dd9f-thumb.webp	2048
64a4e2e0-5f99-4943-8ad1-75f29b370ab1	Art & studio moment 12	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-10-pm-1779835765475-30442838-full.webp	Art and creative practice — photo 12 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.484	2026-06-11 08:09:22.502	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.10 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	12	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-10-pm-1779835765475-30442838.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-10-pm-1779835765475-30442838-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-10-pm-1779835765475-30442838-thumb.webp	1536
dfb5134b-f477-41d6-80d4-0793a5044a1c	Art & studio moment 13	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1-1779835765485-a002533d-full.webp	Art and creative practice — photo 13 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.494	2026-06-11 08:09:23.122	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.11 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	13	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1-1779835765485-a002533d.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1-1779835765485-a002533d-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1-1779835765485-a002533d-thumb.webp	1708
3a1009b0-ba6c-4c27-a680-ee57bc5cc0c3	Art & studio moment 16	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1779835765515-8630203e-full.webp	Art and creative practice — photo 16 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.525	2026-06-11 08:09:24.445	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.12 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	16	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1779835765515-8630203e.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1779835765515-8630203e-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1779835765515-8630203e-thumb.webp	1488
91bc3623-cdd5-465a-a299-c7324929e4b9	Art & studio moment 17	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1-1779835765526-9fe80e7b-full.webp	Art and creative practice — photo 17 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.536	2026-06-11 08:09:25.171	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.13 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	17	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1-1779835765526-9fe80e7b.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1-1779835765526-9fe80e7b-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1-1779835765526-9fe80e7b-thumb.webp	1536
823ada3a-b83b-4027-a080-14feabcad24a	Art & studio moment 19	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-14-pm-1779835765549-a2d3eba6-full.webp	Art and creative practice — photo 19 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.559	2026-06-11 08:09:25.936	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.14 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	19	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-14-pm-1779835765549-a2d3eba6.jpg	1536	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-14-pm-1779835765549-a2d3eba6-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-14-pm-1779835765549-a2d3eba6-thumb.webp	2048
f05eea47-fd27-4fb3-baa2-d57e593daed6	Art & studio moment 21	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1779835765570-d9e80b64-full.webp	Art and creative practice — photo 21 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.58	2026-06-11 08:09:27.172	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.15 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	21	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1779835765570-d9e80b64.jpg	1536	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1779835765570-d9e80b64-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1779835765570-d9e80b64-thumb.webp	2048
2efcebab-9655-49dd-8081-2ebe4a1f758d	Golden Hour Practice	https://images.unsplash.com/photo-1500534314209-a25ddb2bd429	Yoga class at sunrise	A calm studio session under warm morning light.	t	2026-05-23 07:55:15.281	2026-05-26 23:14:53.721	ART	f	\N	1ca88e87-60bb-49e8-98e9-edd825aff651	0	https://images.unsplash.com/photo-1500534314209-a25ddb2bd429	\N	\N	\N	\N
955d1025-004b-45aa-93c2-624e4ba555d3	Art & studio moment 25	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1-1779835765615-c61c4bd4-full.webp	Art and creative practice — photo 25 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.624	2026-06-11 08:09:28.293	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.17 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	25	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1-1779835765615-c61c4bd4.jpg	1372	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1-1779835765615-c61c4bd4-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1-1779835765615-c61c4bd4-thumb.webp	2048
abcb4243-9a2a-4179-9e7d-023c3ea4958d	Art & studio moment 26	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-2-1779835765625-799bfb4e-full.webp	Art and creative practice — photo 26 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.634	2026-06-11 08:09:28.872	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.17 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	26	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-2-1779835765625-799bfb4e.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-2-1779835765625-799bfb4e-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-2-1779835765625-799bfb4e-thumb.webp	1536
38c4bc33-c792-409b-be9c-f5acd6c33c29	Art & studio moment 28	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1-1779835765648-aa8ce9a0-full.webp	Art and creative practice — photo 28 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.658	2026-06-11 08:09:29.464	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.18 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	28	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1-1779835765648-aa8ce9a0.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1-1779835765648-aa8ce9a0-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1-1779835765648-aa8ce9a0-thumb.webp	1536
dd3315de-1b64-4b8e-8ac0-d799392abf97	Art & studio moment 30	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-3-1779835765671-454eef8b-full.webp	Art and creative practice — photo 30 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.68	2026-06-11 08:09:30.711	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.18 PM (3).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	30	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-3-1779835765671-454eef8b.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-3-1779835765671-454eef8b-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-3-1779835765671-454eef8b-thumb.webp	1536
e645e774-739e-4c2c-bead-0a37880a9df6	Art & studio moment 32	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1-1779835765692-4a53ab9e-full.webp	Art and creative practice — photo 32 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.701	2026-06-11 08:09:31.015	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.19 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	32	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1-1779835765692-4a53ab9e.jpg	1493	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1-1779835765692-4a53ab9e-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1-1779835765692-4a53ab9e-thumb.webp	1007
8c4d57ec-ce5f-4f84-bbf3-81404a1b4afc	Art & studio moment 35	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1-1779835765726-2d4536a8-full.webp	Art and creative practice — photo 35 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.735	2026-06-11 08:09:31.723	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.20 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	35	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1-1779835765726-2d4536a8.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1-1779835765726-2d4536a8-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1-1779835765726-2d4536a8-thumb.webp	1701
e15439dc-44db-4795-9aab-9fa9415f6d6c	Art & studio moment 36	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-2-1779835765737-7554c27e-full.webp	Art and creative practice — photo 36 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.745	2026-06-11 08:09:32.043	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.20 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	36	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-2-1779835765737-7554c27e.jpg	1104	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-2-1779835765737-7554c27e-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-2-1779835765737-7554c27e-thumb.webp	2048
bc6e9461-e250-4785-8436-ddb7dcd1c888	Art & studio moment 37	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1779835765746-28c2fa63-full.webp	Art and creative practice — photo 37 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.755	2026-06-11 08:09:32.399	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.20 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	37	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1779835765746-28c2fa63.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1779835765746-28c2fa63-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1779835765746-28c2fa63-thumb.webp	1536
8654f482-1217-4e1d-aeda-5f2a85468efa	Art & studio moment 40	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1-1779835765799-e859960c-full.webp	Art and creative practice — photo 40 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.81	2026-06-11 08:09:33.629	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.22 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	40	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1-1779835765799-e859960c.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1-1779835765799-e859960c-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1-1779835765799-e859960c-thumb.webp	1481
90a8f260-b927-40b8-81de-86623672625c	Art & studio moment 41	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-2-1779835765815-e8dbfa04-full.webp	Art and creative practice — photo 41 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.826	2026-06-11 08:09:34.169	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.22 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	41	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-2-1779835765815-e8dbfa04.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-2-1779835765815-e8dbfa04-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-2-1779835765815-e8dbfa04-thumb.webp	1536
4838a4fc-5150-41b9-ac28-8a80ad0063cd	Art & studio moment 47	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1-1779835765902-1cb5d865-full.webp	Art and creative practice — photo 47 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.914	2026-06-11 08:09:35.518	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.24 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	47	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1-1779835765902-1cb5d865.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1-1779835765902-1cb5d865-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1-1779835765902-1cb5d865-thumb.webp	1536
c7a63868-666c-4131-b6ee-eea6d547c322	Art & studio moment 48	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-2-1779835765916-d8839d7c-full.webp	Art and creative practice — photo 48 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.927	2026-06-11 08:09:36.184	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.24 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	48	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-2-1779835765916-d8839d7c.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-2-1779835765916-d8839d7c-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-2-1779835765916-d8839d7c-thumb.webp	1536
ff2a6c5e-db68-4975-a458-265ef1594cde	Art & studio moment 50	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1-1779835765942-38b8edb6-full.webp	Art and creative practice — photo 50 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.95	2026-06-11 08:09:36.805	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.25 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	50	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1-1779835765942-38b8edb6.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1-1779835765942-38b8edb6-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1-1779835765942-38b8edb6-thumb.webp	1536
8345949d-217c-4a89-90ae-05f9674d5034	Art & studio moment 52	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1779835765966-204f528d-full.webp	Art and creative practice — photo 52 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.976	2026-06-11 08:09:37.841	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.25 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	52	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1779835765966-204f528d.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1779835765966-204f528d-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-1779835765966-204f528d-thumb.webp	1536
28beb300-6121-4d97-9470-114c419c5947	Art & studio moment 54	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-2-1779835765991-778fcdbe-full.webp	Art and creative practice — photo 54 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.002	2026-06-11 08:09:38.433	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.26 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	54	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-2-1779835765991-778fcdbe.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-2-1779835765991-778fcdbe-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-2-1779835765991-778fcdbe-thumb.webp	1536
baa5995c-0694-4400-b2fb-0eabfcb7acf3	Art & studio moment 57	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-2-1779835766031-f0c76b4d-full.webp	Art and creative practice — photo 57 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.04	2026-06-11 08:09:39.821	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.27 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	57	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-2-1779835766031-f0c76b4d.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-2-1779835766031-f0c76b4d-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-2-1779835766031-f0c76b4d-thumb.webp	1536
32659f71-27c7-43bf-8c4b-8b51b8784253	Art & studio moment 58	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1779835766043-a184f91b-full.webp	Art and creative practice — photo 58 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.052	2026-06-11 08:09:39.955	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.27 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	58	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1779835766043-a184f91b.jpg	550	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1779835766043-a184f91b-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1779835766043-a184f91b-thumb.webp	735
d4f8540b-a8a1-49f4-8f30-c84bcf8399fe	Art & studio moment 59	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1-1779835766055-0e71a115-full.webp	Art and creative practice — photo 59 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.066	2026-06-11 08:09:40.645	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.28 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	59	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1-1779835766055-0e71a115.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1-1779835766055-0e71a115-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1-1779835766055-0e71a115-thumb.webp	1536
41bf1801-4610-4e1a-9c05-c94055658ac5	Art & studio moment 62	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1-1779835766094-61dccca1-full.webp	Art and creative practice — photo 62 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.105	2026-06-11 08:09:41.671	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.29 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	62	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1-1779835766094-61dccca1.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1-1779835766094-61dccca1-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1-1779835766094-61dccca1-thumb.webp	1536
a0d65e9a-dff6-4bce-ac2e-3e38c3c43348	Art & studio moment 63	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1779835766107-213aa0b2-full.webp	Art and creative practice — photo 63 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.12	2026-06-11 08:09:42.194	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.29 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	63	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1779835766107-213aa0b2.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1779835766107-213aa0b2-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-29-pm-1779835766107-213aa0b2-thumb.webp	1536
d4bb48d0-4140-44ce-a866-10d70ba2ad41	Art & studio moment 2	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1779835765361-57fceed5-full.webp	Art and creative practice — photo 2 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.37	2026-06-11 08:09:18.043	ART	t	art:WhatsApp Image 2026-05-25 at 5.48.03 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	2	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1779835765361-57fceed5.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1779835765361-57fceed5-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1779835765361-57fceed5-thumb.webp	1536
b3cab7e7-3e98-4ab3-9c47-9e602ab72c6f	Yoga Nidra training 5	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1-1779835766177-a292040d-full.webp	Yoga Nidra teacher training — photo 5 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.187	2026-06-11 08:09:44.506	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.41 PM (1).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	68	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1-1779835766177-a292040d.jpg	1536	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1-1779835766177-a292040d-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1-1779835766177-a292040d-thumb.webp	2048
89470ca7-dc13-4da3-9d53-00bb55faf20e	Yoga Nidra training 6	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-2-1779835766189-f39b024e-full.webp	Yoga Nidra teacher training — photo 6 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.199	2026-06-11 08:09:45.113	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.41 PM (2).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	69	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-2-1779835766189-f39b024e.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-2-1779835766189-f39b024e-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-2-1779835766189-f39b024e-thumb.webp	1536
96f382ad-d0cc-42dc-9885-a9113aab659a	Yoga Nidra training 9	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1779835766239-9bc9bec4-full.webp	Yoga Nidra teacher training — photo 9 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.252	2026-06-11 08:09:46.248	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.42 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	72	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1779835766239-9bc9bec4.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1779835766239-9bc9bec4-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1779835766239-9bc9bec4-thumb.webp	1536
edba32bb-2beb-4ca3-bd71-266d12363a30	Yoga Nidra training 10	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1-1779835766256-7ce8eb9b-full.webp	Yoga Nidra teacher training — photo 10 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.266	2026-06-11 08:09:46.834	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.43 PM (1).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	73	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1-1779835766256-7ce8eb9b.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1-1779835766256-7ce8eb9b-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1-1779835766256-7ce8eb9b-thumb.webp	1536
f5c37b9c-44ff-428e-ab51-6dc7e03d0a03	Yoga Nidra training 11	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-2-1779835766269-a861f381-full.webp	Yoga Nidra teacher training — photo 11 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.279	2026-06-11 08:09:47.222	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.43 PM (2).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	74	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-2-1779835766269-a861f381.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-2-1779835766269-a861f381-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-2-1779835766269-a861f381-thumb.webp	1152
c7b1b3c1-93a8-432b-a60b-5d4c0a588701	Yoga Nidra training 14	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1779835766306-dad14aa4-full.webp	Yoga Nidra teacher training — photo 14 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.318	2026-06-11 08:09:48.245	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.44 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	77	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1779835766306-dad14aa4.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1779835766306-dad14aa4-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1779835766306-dad14aa4-thumb.webp	1536
80d7ec32-93bf-4b21-9333-13a3b5e3dff2	Embassy of India in Japan 2	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1-1779835766334-253ce6ef-full.webp	Cultural event at the Embassy of India in Japan — photo 2 of 6	Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.	t	2026-05-26 22:49:26.342	2026-06-11 08:09:48.397	JAPAN_EVENTS	f	indian-embassy-japan:WhatsApp Image 2026-05-25 at 5.54.18 PM (1).jpeg	aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	79	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1-1779835766334-253ce6ef.jpg	732	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1-1779835766334-253ce6ef-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1-1779835766334-253ce6ef-thumb.webp	1284
8956c6ac-8586-408e-bf8e-d5db08161cea	Embassy of India in Japan 4	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-3-1779835766353-add84360-full.webp	Cultural event at the Embassy of India in Japan — photo 4 of 6	Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.	t	2026-05-26 22:49:26.362	2026-06-11 08:09:49.161	JAPAN_EVENTS	f	indian-embassy-japan:WhatsApp Image 2026-05-25 at 5.54.18 PM (3).jpeg	aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	81	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-3-1779835766353-add84360.jpg	1152	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-3-1779835766353-add84360-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-3-1779835766353-add84360-thumb.webp	2048
b1b781f7-ca7c-4199-8846-66369674912d	Embassy of India in Japan 6	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-19-pm-1779835766374-891810a3-full.webp	Cultural event at the Embassy of India in Japan — photo 6 of 6	Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.	t	2026-05-26 22:49:26.385	2026-06-11 08:09:49.504	JAPAN_EVENTS	f	indian-embassy-japan:WhatsApp Image 2026-05-25 at 5.54.19 PM.jpeg	aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	83	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-19-pm-1779835766374-891810a3.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-19-pm-1779835766374-891810a3-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-19-pm-1779835766374-891810a3-thumb.webp	1153
009cb306-9789-49dc-86cb-3861c33864c0	Art & studio moment 11	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-09-pm-1779835765463-685e25f9-full.webp	Art and creative practice — photo 11 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.473	2026-06-11 08:09:50.812	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.09 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	11	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-09-pm-1779835765463-685e25f9.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-09-pm-1779835765463-685e25f9-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-09-pm-1779835765463-685e25f9-thumb.webp	1536
458ce1be-676d-4629-a15a-3c9709e03e06	Art & studio moment 18	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1779835765537-0f98b655-full.webp	Art and creative practice — photo 18 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.548	2026-06-11 08:09:52.117	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.13 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	18	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1779835765537-0f98b655.jpg	1680	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1779835765537-0f98b655-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-13-pm-1779835765537-0f98b655-thumb.webp	2048
d37cb27c-68d1-43e5-a3f8-141269d5444b	Art & studio moment 22	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1-1779835765581-c1eb2d4e-full.webp	Art and creative practice — photo 22 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.59	2026-06-11 08:09:52.702	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.16 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	22	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1-1779835765581-c1eb2d4e.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1-1779835765581-c1eb2d4e-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1-1779835765581-c1eb2d4e-thumb.webp	1506
bbf118e2-7b80-46dc-9d62-2104e19b39cd	Art & studio moment 27	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1779835765636-933b5c38-full.webp	Art and creative practice — photo 27 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.646	2026-06-11 08:09:53.926	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.17 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	27	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1779835765636-933b5c38.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1779835765636-933b5c38-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-17-pm-1779835765636-933b5c38-thumb.webp	1536
92667be4-9837-4c80-a34d-6ae2fe2f4cee	Art & studio moment 31	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1779835765681-5e15e324-full.webp	Art and creative practice — photo 31 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.691	2026-06-11 08:09:54.572	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.18 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	31	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1779835765681-5e15e324.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1779835765681-5e15e324-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-1779835765681-5e15e324-thumb.webp	1517
2c57d49b-a320-4284-a0c4-b70b5c86733f	Art & studio moment 34	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1779835765714-2a12e192-full.webp	Art and creative practice — photo 34 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.725	2026-06-11 08:09:55.22	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.19 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	34	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1779835765714-2a12e192.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1779835765714-2a12e192-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-1779835765714-2a12e192-thumb.webp	1512
ee178eaa-7834-4212-a18e-043ee24857d4	Art & studio moment 42	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-3-1779835765831-e6ed101c-full.webp	Art and creative practice — photo 42 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.841	2026-06-11 08:09:56.293	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.22 PM (3).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	42	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-3-1779835765831-e6ed101c.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-3-1779835765831-e6ed101c-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-3-1779835765831-e6ed101c-thumb.webp	1624
26d50252-2ae3-433b-8f0c-9f482a368eb5	Art & studio moment 44	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1-1779835765863-8be51ff4-full.webp	Art and creative practice — photo 44 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.875	2026-06-11 08:09:57.032	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.23 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	44	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1-1779835765863-8be51ff4.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1-1779835765863-8be51ff4-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1-1779835765863-8be51ff4-thumb.webp	1873
0396beba-7297-4f96-864c-b80bea3bfe03	Art & studio moment 49	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1779835765929-7043378f-full.webp	Art and creative practice — photo 49 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.939	2026-06-11 08:09:57.385	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.24 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	49	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1779835765929-7043378f.jpg	788	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1779835765929-7043378f-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-24-pm-1779835765929-7043378f-thumb.webp	940
2011a182-034c-4b30-833e-07351e5e80a8	Art & studio moment 53	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1-1779835765978-87d8589a-full.webp	Art and creative practice — photo 53 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.989	2026-06-11 08:09:57.978	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.26 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	53	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1-1779835765978-87d8589a.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1-1779835765978-87d8589a-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1-1779835765978-87d8589a-thumb.webp	1536
0bac0f5f-dcaa-461a-a715-8010090e5761	Art & studio moment 56	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1-1779835766018-fc81b581-full.webp	Art and creative practice — photo 56 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.029	2026-06-11 08:09:58.525	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.27 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	56	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1-1779835766018-fc81b581.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1-1779835766018-fc81b581-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1-1779835766018-fc81b581-thumb.webp	1536
58e6c0de-3582-4e41-858a-8d8bd233e050	Art & studio moment 5	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-05-pm-1779835765397-8be8c0a8-full.webp	Art and creative practice — photo 5 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.405	2026-06-11 08:09:19.061	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.05 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	5	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-05-pm-1779835765397-8be8c0a8.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-05-pm-1779835765397-8be8c0a8-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-05-pm-1779835765397-8be8c0a8-thumb.webp	1229
c042b0f5-586d-4864-a71d-a22f86db513c	Art & studio moment 10	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1779835765453-0ae99cb6-full.webp	Art and creative practice — photo 10 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.462	2026-06-11 08:09:21.778	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.08 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	10	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1779835765453-0ae99cb6.jpg	1878	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1779835765453-0ae99cb6-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-08-pm-1779835765453-0ae99cb6-thumb.webp	2048
44a68c69-1eaa-4658-b37c-af8241599fe0	Art & studio moment 15	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1-1779835765506-1b260559-full.webp	Art and creative practice — photo 15 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.514	2026-06-11 08:09:23.808	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.12 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	15	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1-1779835765506-1b260559.jpg	1536	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1-1779835765506-1b260559-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-12-pm-1-1779835765506-1b260559-thumb.webp	2048
1b093619-c174-4d0c-89d1-0c74084e7594	Art & studio moment 20	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1-1779835765560-fb6abecd-full.webp	Art and creative practice — photo 20 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.569	2026-06-11 08:09:26.544	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.15 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	20	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1-1779835765560-fb6abecd.jpg	1523	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1-1779835765560-fb6abecd-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-15-pm-1-1779835765560-fb6abecd-thumb.webp	2048
e3012272-bf13-477e-9b1c-50c5d753e6e4	Art & studio moment 24	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1779835765605-e7b8fec7-full.webp	Art and creative practice — photo 24 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.614	2026-06-11 08:09:27.737	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.16 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	24	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1779835765605-e7b8fec7.jpg	1527	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1779835765605-e7b8fec7-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-1779835765605-e7b8fec7-thumb.webp	2048
48f72762-9aa5-4403-adac-7f92d192c5b7	Yoga Nidra training 1	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-38-pm-1779835766123-12b6a4e1-full.webp	Yoga Nidra teacher training — photo 1 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.133	2026-06-11 08:09:59.587	YOGA_NIDRA	t	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.38 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	64	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-38-pm-1779835766123-12b6a4e1.jpg	1152	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-38-pm-1779835766123-12b6a4e1-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-38-pm-1779835766123-12b6a4e1-thumb.webp	2048
e57be8fe-3e9d-4a5d-a224-0357f690678e	Yoga Nidra training 3	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1779835766146-fd2cb5d7-full.webp	Yoga Nidra teacher training — photo 3 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.158	2026-06-11 08:09:59.949	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.39 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	66	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1779835766146-fd2cb5d7.jpg	1152	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1779835766146-fd2cb5d7-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1779835766146-fd2cb5d7-thumb.webp	2048
67fe18fc-49e4-48f7-afe5-29e3dd98d696	Yoga Nidra training 8	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1-1779835766216-ef64e850-full.webp	Yoga Nidra teacher training — photo 8 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.234	2026-06-11 08:10:00.961	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.42 PM (1).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	71	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1-1779835766216-ef64e850.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1-1779835766216-ef64e850-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1-1779835766216-ef64e850-thumb.webp	1152
1a509cc7-18c8-4a98-bf4f-27a5c54bb30d	Yoga Nidra training 12	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1779835766281-2a17ef29-full.webp	Yoga Nidra teacher training — photo 12 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.292	2026-06-11 08:10:01.555	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.43 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	75	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1779835766281-2a17ef29.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1779835766281-2a17ef29-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-43-pm-1779835766281-2a17ef29-thumb.webp	1536
01af2c23-3186-4aee-af5b-c09cc3aff84e	Embassy of India in Japan 1	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-17-pm-1779835766323-bcfc666c-full.webp	Cultural event at the Embassy of India in Japan — photo 1 of 6	Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.	t	2026-05-26 22:49:26.332	2026-06-11 08:10:02.173	JAPAN_EVENTS	t	indian-embassy-japan:WhatsApp Image 2026-05-25 at 5.54.17 PM.jpeg	aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	78	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-17-pm-1779835766323-bcfc666c.jpg	1536	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-17-pm-1779835766323-bcfc666c-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-17-pm-1779835766323-bcfc666c-thumb.webp	2048
8fa14551-98af-498a-a692-14a0e3ace0f2	Art & studio moment 29	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-2-1779835765659-eb38e4af-full.webp	Art and creative practice — photo 29 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.669	2026-06-11 08:09:30.073	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.18 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	29	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-2-1779835765659-eb38e4af.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-2-1779835765659-eb38e4af-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-18-pm-2-1779835765659-eb38e4af-thumb.webp	1536
24ccc49b-d351-43f7-abb5-403d0c42d729	Art & studio moment 33	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-2-1779835765703-84def62f-full.webp	Art and creative practice — photo 33 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.712	2026-06-11 08:09:31.213	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.19 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	33	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-2-1779835765703-84def62f.jpg	1600	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-2-1779835765703-84def62f-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-19-pm-2-1779835765703-84def62f-thumb.webp	740
49697647-936c-41cf-8c13-03092c2688fd	Art & studio moment 39	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1779835765781-64e27a18-full.webp	Art and creative practice — photo 39 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.795	2026-06-11 08:09:33.152	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.21 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	39	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1779835765781-64e27a18.jpg	2046	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1779835765781-64e27a18-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1779835765781-64e27a18-thumb.webp	2048
cc762534-5640-4941-b507-231408c97974	Art & studio moment 43	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1779835765844-2409ec76-full.webp	Art and creative practice — photo 43 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.861	2026-06-11 08:09:34.715	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.22 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	43	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1779835765844-2409ec76.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1779835765844-2409ec76-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-1779835765844-2409ec76-thumb.webp	1624
1b9ab088-d4d3-4799-854e-571af7ec0afa	Art & studio moment 46	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1779835765889-269fddc7-full.webp	Art and creative practice — photo 46 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.9	2026-06-11 08:09:34.976	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.23 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	46	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1779835765889-269fddc7.jpg	1080	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1779835765889-269fddc7-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-1779835765889-269fddc7-thumb.webp	1080
7071fc4d-5b5a-40e3-abff-5c8b749cf21a	Art & studio moment 51	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-2-1779835765953-24cc9a8a-full.webp	Art and creative practice — photo 51 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.964	2026-06-11 08:09:37.244	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.25 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	51	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-2-1779835765953-24cc9a8a.jpg	1092	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-2-1779835765953-24cc9a8a-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-25-pm-2-1779835765953-24cc9a8a-thumb.webp	2048
1a05835d-45cb-497c-a6f6-f96d85a0c785	Art & studio moment 55	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1779835766004-cc787db7-full.webp	Art and creative practice — photo 55 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.015	2026-06-11 08:09:39.141	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.26 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	55	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1779835766004-cc787db7.jpg	1776	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1779835766004-cc787db7-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-26-pm-1779835766004-cc787db7-thumb.webp	2048
ad5e1c11-42f9-4c46-aecf-bcf72e686c53	Art & studio moment 61	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1779835766081-10aa1000-full.webp	Art and creative practice — photo 61 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.091	2026-06-11 08:09:41.08	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.28 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	61	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1779835766081-10aa1000.jpg	1152	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1779835766081-10aa1000-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1779835766081-10aa1000-thumb.webp	2048
efdd9751-eb4d-4a31-bdcc-b0b7d83e95ba	Yoga Nidra training 2	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1-1779835766135-a3024d9d-full.webp	Yoga Nidra teacher training — photo 2 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.144	2026-06-11 08:09:42.584	YOGA_NIDRA	t	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.39 PM (1).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	65	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1-1779835766135-a3024d9d.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1-1779835766135-a3024d9d-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1-1779835766135-a3024d9d-thumb.webp	1152
80b8bdc9-ee23-48c6-ad7f-b14b7f1f29a5	Art & studio moment 1	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1-1779835765344-686ef63f-full.webp	Art and creative practice — photo 1 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.355	2026-06-11 08:09:43.215	ART	t	art:WhatsApp Image 2026-05-25 at 5.48.03 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	1	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1-1779835765344-686ef63f.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1-1779835765344-686ef63f-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-03-pm-1-1779835765344-686ef63f-thumb.webp	1536
5bf919c8-5580-4f62-9703-5eefea04804a	Art & studio moment 3	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1-1779835765373-b4742f2f-full.webp	Art and creative practice — photo 3 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.382	2026-06-11 08:09:43.818	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.04 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	3	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1-1779835765373-b4742f2f.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1-1779835765373-b4742f2f-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1-1779835765373-b4742f2f-thumb.webp	1602
82f5833c-696b-4e8f-8b39-ecea9ba91036	Yoga Nidra training 7	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1779835766201-2d354fd7-full.webp	Yoga Nidra teacher training — photo 7 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.212	2026-06-11 08:09:45.728	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.41 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	70	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1779835766201-2d354fd7.jpg	1536	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1779835766201-2d354fd7-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1779835766201-2d354fd7-thumb.webp	2048
827282f2-cf95-4c89-a933-98e92db370cd	Yoga Nidra training 13	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1-1779835766294-b9291b17-full.webp	Yoga Nidra teacher training — photo 13 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.304	2026-06-11 08:09:47.597	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.44 PM (1).jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	76	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1-1779835766294-b9291b17.jpg	1477	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1-1779835766294-b9291b17-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-44-pm-1-1779835766294-b9291b17-thumb.webp	1108
ca57d8ba-399b-4bca-ac82-52f65bbe59d6	Embassy of India in Japan 3	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-2-1779835766343-0d2f3cf6-full.webp	Cultural event at the Embassy of India in Japan — photo 3 of 6	Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.	t	2026-05-26 22:49:26.352	2026-06-11 08:09:48.782	JAPAN_EVENTS	f	indian-embassy-japan:WhatsApp Image 2026-05-25 at 5.54.18 PM (2).jpeg	aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	80	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-2-1779835766343-0d2f3cf6.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-2-1779835766343-0d2f3cf6-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-2-1779835766343-0d2f3cf6-thumb.webp	1152
6c40e6da-3c5e-4186-9f86-76adbc03edc6	Art & studio moment 7	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1779835765418-0184e6e3-full.webp	Art and creative practice — photo 7 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.428	2026-06-11 08:09:50.156	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.06 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	7	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1779835765418-0184e6e3.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1779835765418-0184e6e3-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-06-pm-1779835765418-0184e6e3-thumb.webp	1536
ae8fd436-9701-431d-b2fd-bd4416ec0079	Art & studio moment 14	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1779835765495-d5459d88-full.webp	Art and creative practice — photo 14 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.504	2026-06-11 08:09:51.345	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.11 PM.jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	14	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1779835765495-d5459d88.jpg	1246	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1779835765495-d5459d88-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1779835765495-d5459d88-thumb.webp	2048
fdcc58a0-758a-4f24-a8df-8e99fef1e1a2	Art & studio moment 23	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-2-1779835765594-3eb98df5-full.webp	Art and creative practice — photo 23 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.603	2026-06-11 08:09:53.348	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.16 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	23	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-2-1779835765594-3eb98df5.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-2-1779835765594-3eb98df5-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-16-pm-2-1779835765594-3eb98df5-thumb.webp	1496
000e2ff8-fd0e-4006-b6ef-399cf64a38ac	Art & studio moment 38	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1-1779835765756-759832b8-full.webp	Art and creative practice — photo 38 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.766	2026-06-11 08:09:55.742	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.21 PM (1).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	38	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1-1779835765756-759832b8.jpg	1771	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1-1779835765756-759832b8-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-21-pm-1-1779835765756-759832b8-thumb.webp	2048
a66e2585-2799-4ae0-ad4e-6a809548c96b	Art & studio moment 45	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-2-1779835765877-5a3d45bb-full.webp	Art and creative practice — photo 45 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:25.887	2026-06-11 08:09:57.21	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.23 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	45	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-2-1779835765877-5a3d45bb.jpg	788	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-2-1779835765877-5a3d45bb-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-23-pm-2-1779835765877-5a3d45bb-thumb.webp	940
7b0eec7a-19d2-4e9a-9dd1-374df5ace218	Art & studio moment 60	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-2-1779835766068-c657c127-full.webp	Art and creative practice — photo 60 of 63	A glimpse of art, colour, and mindful creativity at Nirvana Yoga.	t	2026-05-26 22:49:26.079	2026-06-11 08:09:59.126	ART	f	art:WhatsApp Image 2026-05-25 at 5.48.28 PM (2).jpeg	1ca88e87-60bb-49e8-98e9-edd825aff651	60	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-2-1779835766068-c657c127.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-2-1779835766068-c657c127-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-2-1779835766068-c657c127-thumb.webp	1536
76e8cd6b-77fc-400f-95c8-ce16063fe874	Yoga Nidra training 4	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-40-pm-1779835766165-8d72dec3-full.webp	Yoga Nidra teacher training — photo 4 of 14	Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.	t	2026-05-26 22:49:26.175	2026-06-11 08:10:00.544	YOGA_NIDRA	f	yoga-nidra:WhatsApp Image 2026-05-25 at 5.57.40 PM.jpeg	df6709e3-bee8-450e-b9f8-36f0e20c9553	67	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-40-pm-1779835766165-8d72dec3.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-40-pm-1779835766165-8d72dec3-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-40-pm-1779835766165-8d72dec3-thumb.webp	1536
8a96ab42-41ba-456e-9521-35867d555154	Embassy of India in Japan 5	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1779835766364-fc5eac2c-full.webp	Cultural event at the Embassy of India in Japan — photo 5 of 6	Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.	t	2026-05-26 22:49:26.373	2026-06-11 08:10:02.829	JAPAN_EVENTS	f	indian-embassy-japan:WhatsApp Image 2026-05-25 at 5.54.18 PM.jpeg	aa0a5275-b48a-4cc4-9bf7-06f2c74c671a	82	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1779835766364-fc5eac2c.jpg	2048	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1779835766364-fc5eac2c-medium.webp	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-18-pm-1779835766364-fc5eac2c-thumb.webp	1536
\.


--
-- Data for Name: HeroSection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HeroSection" (id, title, subtitle, "primaryCtaLabel", "primaryCtaHref", "secondaryCtaLabel", "secondaryCtaHref", "imageSrc", "imageAlt", "createdAt", "updatedAt", "collageId", "featuredCollectionId", "mediaMode", "rotatingImages") FROM stdin;
hero	Stillness is a practice.	Yoga, art, and everyday rituals-held with warmth and clarity	View classes	/yoga	Upcoming events	/events	/uploads/homepage/hero-1779792497013-2a986ae9.webp	Serene studio interior with natural textures	2026-05-23 07:55:15.257	2026-06-13 11:34:30.263	\N	\N	SINGLE	[]
\.


--
-- Data for Name: NewsletterSubscriber; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NewsletterSubscriber" (id, email, name, "subscribedAt") FROM stdin;
1e61e423-62fc-4e96-819c-fff1d12f2cf9	studio@nirvana-yoga.example	Nirvana Studio	2026-05-23 07:55:15.286
4134b58f-1bfa-403e-89f1-79fe9220d895	anikaitar@gmail.com	anikait agrawal	2026-05-26 21:31:28.638
\.


--
-- Data for Name: PageSection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PageSection" (id, "pageType", "sectionType", title, subtitle, content, "imageUrl", "imageAlt", "sortOrder", "isPublished", payload, "createdAt", "updatedAt", layout) FROM stdin;
e979822a-4896-4772-b453-45be33bd2691	YOGA	HERO	My Journey of Yoga	Inner practice	At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection.	/uploads/homepage/whatsapp-image-2026-05-25-at-5-54-18-pm-1779875333765-4f015402.jpg	Nurturing Body, Mind and Spirit	0	t	{"tagline": "Awareness · Balance · Connection", "primaryCta": {"href": "/contact", "label": "Enquire"}, "secondaryCta": {"href": "/events", "label": "View sessions"}, "showSecondaryCta": true}	2026-06-10 18:58:22.978	2026-06-17 12:26:58.567	{"sectionStyle": "warm", "animationPreset": "rise"}
74f5e297-b7c4-4e9b-bb41-2dc36f44e3d5	YOGA	CUSTOM_TEXT	Yoga Nidra Teachers Training 	Deepen your teaching	A Yoga Nidra Teachers Training Basic and Advance Course(11 hr. each) available in English and Japanese.\n\nBasic (Japanese) course: 8th and 15th July at the local studio — online and offline both available.\n\nFor the English online/offline course, please enquire by email.\n\nYoga Sutra & philosophy sessions: 8-hour course in English — 18th & 25th August.	\N		5	t	{"paragraphs": ["A Yoga Nidra Teachers Training Basic and Advance Course(11 hr. each) available in English and Japanese.", "Basic (Japanese) course: 8th and 15th July at the local studio — online and offline both available.", "For the English online/offline course, please enquire by email.", "Yoga Sutra & philosophy sessions: 8-hour course in English — 18th & 25th August."]}	2026-06-10 18:58:23.012	2026-06-17 12:29:01.495	{"sectionStyle": "muted"}
28cd9928-64f8-45b4-b3c5-cdca78a1a02c	JUST_ART_LIFE	CONTACT	Join the next gathering	Art summer camp 		\N		10	t	{"showForm": true, "formSubject": "Just Art Affair inquiry"}	2026-06-10 19:38:00.057	2026-06-17 12:29:39.415	{"spacing": "normal", "paddingTop": 0, "contentWidth": "normal", "paddingBottom": 0, "textAlignment": "left", "contentWidthPx": 960, "textMaxWidthPx": 640}
1d9bc0b3-9f1e-464b-a89c-5b8933117eb8	HEALING	CUSTOM_TEXT	How I hold space	Our approach	\N	\N	\N	6	t	{"paragraphs": ["Awareness & inner balance — integrating body, breath, and consciousness to support clarity and emotional balance.", "Holistic healing pathways — drawing on decades of study in mindfulness, psychology, Reiki, and energetic healing.", "Healing as inward practice — guiding you to reconnect with your own inner balance, awareness, and strength."]}	2026-06-10 19:35:43.394	2026-06-11 13:50:49.345	\N
9af10eb9-de0e-4511-80be-c4fd8b0c5d34	HEALING	IMAGE_TEXT	15+ years of service	Professional healing	What began with a friend’s request grew into a calling. Over the last 15+ years, I have had the privilege of supporting people through physical health issues, emotional struggles, relationship difficulties, financial blocks, stress, and personal transformation.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-19-pm-1779835766374-891810a3.jpg	Community gathering — healing and connection	5	t	\N	2026-06-10 19:35:43.391	2026-06-10 19:35:43.391	{"imageSide": "right"}
26227a32-aa5c-4093-9e15-79d86aa0e6d6	HEALING	TESTIMONIALS	Stories from our community	\N	\N	\N	\N	8	t	{"items": []}	2026-06-10 19:35:43.401	2026-06-10 19:35:43.401	\N
853fe097-90c8-4dc6-9436-8a6c898680fa	HEALING	EVENTS	Healing gatherings	\N	\N	\N	\N	9	t	{"limit": 6, "eventKind": "sessions", "categories": ["HEALING"]}	2026-06-10 19:35:43.404	2026-06-10 19:35:43.404	\N
6d60ea99-fccb-48b0-8f96-f4d87c0b73c7	HEALING	CONTACT	Book a conversation	\N	\N	\N	\N	10	t	{"showForm": true, "formSubject": "Healing inquiry"}	2026-06-10 19:35:43.406	2026-06-10 19:35:43.406	\N
1e00e662-123f-4d67-b960-9306fb0c744c	JUST_ART_LIFE	TESTIMONIALS	From our community	\N	\N	\N	\N	9	t	{"items": []}	2026-06-10 19:38:00.054	2026-06-10 19:38:00.054	\N
af57d4de-5526-426a-a7c4-cdb9fdd061c3	YOGA	IMAGE_TEXT	Traditional roots, modern life	Practice	Through asana, pranayama, meditation, and Yoga Nidra, we weave practices that support the body, calm the mind, and deepen inner awareness — honoring the Bihar School tradition while meeting the rhythms of everyday life.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1-1779835766135-a3024d9d.jpg	Yoga Nidra teacher training — rest and presence	2	t	\N	2026-06-10 18:58:23.005	2026-06-17 12:26:58.567	{"imageSide": "left", "sectionStyle": "default", "animationPreset": "rise"}
c66059c1-1a22-4b07-bc92-54d5c7c3f4c4	YOGA	CUSTOM_TEXT	Pathways of practice	What we offer	\N	\N	\N	3	t	{"paragraphs": ["Yoga Asana — mindful movement that honors the body, not performance.", "Pranayama (Breathwork) — conscious breath to calm the nervous system and deepen awareness.", "Meditation — practices of presence, observation, and self-discovery.", "Yoga Nidra — deep relaxation and conscious rest for healing and clarity."]}	2026-06-10 18:58:23.007	2026-06-17 12:26:58.567	\N
99ecc2b1-800e-4e8e-a848-082ab5c47300	YOGA	IMAGE_TEXT	Stillness & transformation	Each session	Every gathering is thoughtfully designed to cultivate harmony between body, breath, mind, and consciousness — allowing space for stillness, healing, clarity, and transformation.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1-1779835766177-a292040d.jpg	Yoga practice — calm and grounded presence	4	t	\N	2026-06-10 18:58:23.01	2026-06-17 12:26:58.567	{"imageSide": "right", "sectionStyle": "warm", "animationPreset": "rise"}
cc85adae-c1d0-491c-a625-55588d533a81	YOGA	GALLERY	Moments from practice	Yoga Nidra & training	\N	\N	\N	7	t	{"images": [], "carousel": true}	2026-06-10 18:58:23.018	2026-06-17 12:26:58.567	{"galleryStyle": "immersive"}
cbffc0d3-3973-4bfc-bfe6-2555c050aafc	HEALING	IMAGE_TEXT	An inner calling	Learning & growth	That reopened door led me to study past life healing and many other modalities — exploring karma, the subconscious mind, emotional patterns, and the deep connection between mind, body, and spirit.	/uploads/pages/bpjw6563-1781699096052-53fda8f9.jpg	Healing practice — presence and inner awareness	3	t	null	2026-06-10 19:35:43.386	2026-06-17 12:25:17.409	{"imageSide": "right", "animationPreset": "rise"}
b172845d-d38a-474f-b964-188c3da9a7d8	HEALING	IMAGE_TEXT	Life brought me back	2011	When my son was diagnosed with an autoimmune disorder, I explored every path that could support his return to health — medical care alongside alternative therapies and holistic approaches. In that difficult season, the memory of Reiki returned.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-05-pm-1779835765397-8be8c0a8.jpg	Quiet moment of reflection and care	2	t	\N	2026-06-10 19:35:43.384	2026-06-10 19:35:43.384	{"imageSide": "left", "sectionStyle": "warm", "animationPreset": "rise"}
77bcf534-6b25-424b-8c46-dbfd5de43ba7	HEALING	IMAGE_TEXT	Centered & aware	Personal transformation	I became far more centered, aware, and connected to myself. My intuition sharpened. My understanding of life deepened. Healing became not just a practice, but an inner journey of growth, clarity, surrender, and transformation.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1779835766239-9bc9bec4.jpg	Calm restorative practice	4	t	\N	2026-06-10 19:35:43.389	2026-06-10 19:35:43.389	{"imageSide": "left", "sectionStyle": "warm"}
b9a3427e-e338-4853-a3eb-e46c0e9ab9d9	JUST_ART_LIFE	IMAGE_TEXT	A hobby that grew	2011	What began as personal exploration soon became something shared. Teaching a few friends was never about expertise — it was a way to keep learning, stay curious, and grow alongside others.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-04-pm-1779835765385-d2ab79e9.jpg	Early art exploration and creative practice	2	t	\N	2026-06-10 19:38:00.026	2026-06-10 19:38:00.026	{"imageSide": "right", "sectionStyle": "warm", "animationPreset": "rise"}
d373dd48-16a6-472e-954a-023ef2023b90	JUST_ART_LIFE	IMAGE_TEXT	Learning through teaching	The studio	More women joined, and the studio became a space of discovery, healing, expression, and connection — where childhood dreams were revisited and new confidence was found.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-20-pm-1-1779835765726-2d4536a8.jpg	Art class and studio teaching	3	t	\N	2026-06-10 19:38:00.029	2026-06-10 19:38:00.029	{"imageSide": "left"}
f99bdf10-82ab-41e5-935a-e7a66967d2ca	JUST_ART_LIFE	IMAGE_TEXT	Helping others find their path	Community	Some fulfilled dreams they had left behind years ago. Others found purpose, creativity, and joy. Everyone carries a creative side — sometimes they only need the right environment to express it.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-22-pm-3-1779835765831-e6ed101c.jpg	Students creating art in the studio	4	t	\N	2026-06-10 19:38:00.034	2026-06-10 19:38:00.034	{"imageSide": "right"}
54be804e-5cdb-42db-bed8-ddd155695471	JUST_ART_LIFE	IMAGE_TEXT	Art in Japan	A new community	In Japan, a vibrant international community welcomed art once again. Over the years I became a well-established teacher, guiding students through oil painting, watercolor, acrylics, and mixed media.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-28-pm-1779835766081-10aa1000.jpg	Art community gathering in Japan	5	t	\N	2026-06-10 19:38:00.038	2026-06-10 19:38:00.038	{"imageSide": "left", "sectionStyle": "warm"}
7a46eb48-a9e8-44a7-9bcd-8f9f8f27a137	JUST_ART_LIFE	IMAGE_TEXT	Just Art Affair	Founded 2020	Being self-taught kept me humble — my mistakes became my greatest teachers. Just Art Affair was built to make art accessible, meaningful, and joyful for everyone willing to explore it.	/uploads/pages/whatsapp-image-2026-05-25-at-5-48-04-pm-1779864050926-a7b45861.jpg	Just Art Affair creative space	6	t	\N	2026-06-10 19:38:00.041	2026-06-10 19:38:00.041	{"imageSide": "right"}
a0f35ffa-84f8-43ba-8d34-3941b26c1030	JUST_ART_LIFE	GALLERY	Art & creative life	From the studio	\N	\N	\N	7	t	{"images": [], "carousel": false}	2026-06-10 19:38:00.045	2026-06-10 19:38:00.045	{"galleryStyle": "masonry", "sectionStyle": "muted"}
7589f4a2-7106-455a-b891-586c9e35f939	JUST_ART_LIFE	EVENTS	Creative gatherings	\N	\N	\N	\N	8	t	{"limit": 6, "eventKind": "all", "categories": ["JUST_ART_LIFE", "YOGA"]}	2026-06-10 19:38:00.051	2026-06-10 19:38:00.051	\N
04dd66fd-ede0-46e6-a01e-0914e5ad0ff8	JUST_ART_LIFE	HERO	My Journey with Art	Creative life	Art came into my life in 2011, not as a planned profession, but simply as a hobby — a path that would grow into teaching, community, and the founding of Just Art Affair.	/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-11-pm-1-1779835765485-a002533d.jpg	Art and creative expression at Just Art Affair	0	t	{"tagline": "Creativity · Expression · Exploration", "primaryCta": {"href": "/contact", "label": "Enquire"}, "secondaryCta": {"href": "/events", "label": "View sessions"}, "showSecondaryCta": true}	2026-06-10 19:37:59.994	2026-06-12 17:09:55.961	{"sectionStyle": "warm", "animationPreset": "rise"}
9793d026-268e-4fac-8c03-e2a1b66eb455	HEALING	HERO	My Journey into Healing	Karmic connections	I was first introduced to the word healing when I was just 15 years old, through learning Reiki healing — a path that would return to me years later in the most unexpected and transformative way.	/uploads/pages/images-1781165715293-67c646dd.jpg	Calm healing and mindful presence at Nirvana Yoga	0	t	{"tagline": "Restoration · Trust · Transformation", "primaryCta": {"href": "/contact", "label": "Enquire"}, "secondaryCta": {"href": "/events", "label": "View sessions"}, "showSecondaryCta": true}	2026-06-10 19:35:43.362	2026-06-17 08:08:07.506	{"imageAspect": "square", "sectionStyle": "warm", "animationPreset": "rise"}
ed7f0ba7-fcb0-4242-9fbb-27011985912f	HEALING	CUSTOM_TEXT	Where it began	A path reopened		\N		1	t	{"variant": "healing-journey", "highlights": [{"text": "Looking back now, I can say that was the turning point of my life.", "label": "The turning point", "enabled": true, "afterIndex": 7}, {"text": "Within a year, my son recovered. But alongside his healing, something within me had also transformed.", "label": "Recovery & transformation", "enabled": true, "afterIndex": 10}], "paragraphs": ["I was first introduced to the word healing when I was just 15 years old, through learning Reiki healing.", "At that age, I was too young to truly understand its depth, and over time I drifted away from the practice.", "Years later, in 2011, life brought me back to it in the most unexpected and transformative way.", "My son was diagnosed with an autoimmune disorder, and like any mother, I was devastated. I did everything possible to help him return to normal health.", "While consulting doctors and specialists, I also began exploring alternative therapies and holistic approaches that could support his healing journey.", "Somewhere during that difficult period, I remembered Reiki.", "That memory reopened a door within me. I began searching for professional healers, but at the same time, I felt a deep inner calling to learn and do something myself.", "I went on to study past life healing and continued learning many healing modalities over the years.", "Through this journey, I explored deeper dimensions of human existence — karma, the subconscious mind, emotional patterns, energetic blocks, remedies, awareness, and the connection between mind, body, and spirit.", "Within a year, my son recovered.", "But alongside his healing, something within me had also transformed.", "I did not suddenly feel like I had a magic wand in my hand, but I became far more centered, aware, and connected to myself. My intuition sharpened. My understanding of life deepened. Healing became not just a practice, but an inner journey of growth, clarity, surrender, and transformation.", "Once again, as destiny seemed to unfold naturally, I never intended to become a professional healer. But a friend who was struggling with serious health issues requested a healing session from me.", "Shortly afterward, she experienced remarkable improvement, and that became the beginning of my professional healing journey.", "Word slowly spread, and more people began coming for sessions.", "Over the last 15+ years as a professional healer, I have had the privilege of helping many people through different challenges in life — physical health issues, emotional struggles, relationship difficulties, financial blocks, stress, inner confusion, and personal transformation.", "Every individual carries their own story, pain, and potential for healing.\\nMy role has never been to “fix” people, but to guide, support, and help them reconnect with their own inner balance, awareness, and strength.", "Healing, to me, is not just about removing problems. It is about creating harmony within ourselves so we can live with greater clarity, peace, resilience, and purpose."], "highlightsEnabled": true, "introParagraphCount": 2, "closingParagraphCount": 2}	2026-06-10 19:35:43.377	2026-06-11 13:50:49.375	{"sectionStyle": "muted", "textAlignment": "center"}
cad8742c-e1e7-453e-89d2-b8407854979d	YOGA	IMAGE_TEXT	Teacher training in practice	\N	Yoga Nidra training invites rest, presence, and the art of guiding others into conscious relaxation — a profound practice for healing, clarity, and nervous system restoration.	/uploads/pages/whatsapp-image-2026-05-25-at-5-57-38-pm-1779799410893-26d78e7e.jpg	Yoga Nidra teachers training session	6	t	\N	2026-06-10 18:58:23.014	2026-06-17 12:26:58.567	{"imageSide": "left"}
747a840a-d8ce-4373-859f-3d6628c29a77	ABOUT	CUSTOM_TEXT	Teaching philosophy	\N	\N	\N	\N	3	t	{"sutras": [{"source": "Patanjali Yoga Sutra 1.2", "sanskrit": "योगश्चित्तवृत्तिनिरोधः", "translation": "Yoga is the stilling of the fluctuations of the mind.", "interpretation": "At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection. Our teachings are rooted in traditional yogic wisdom while remaining accessible for modern life.", "transliteration": "Yogaś citta-vṛtti-nirodhaḥ"}, {"source": "Patanjali Yoga Sutra 1.12", "sanskrit": "अभ्यासवैराग्याभ्यां तन्निरोधः", "translation": "The mind is steadied through consistent practice and non-attachment.", "interpretation": "We believe yoga is not about performance or perfection. It is a mindful practice of presence, observation, and self-discovery. Each session cultivates harmony between body, breath, mind, and consciousness.", "transliteration": "Abhyāsa-vairāgyābhyāṁ tan-nirodhaḥ"}], "variant": "philosophy", "paragraphs": []}	2026-06-12 19:36:04.011	2026-06-12 19:36:04.011	null
42d549dd-05ee-409b-8cc1-fb4359644ea4	ABOUT	CUSTOM_TEXT	Journey & experience			\N		1	t	{"variant": "experience-timeline", "timeline": {"mode": "manual", "items": [{"text": "Raised in a family rooted in traditional yogic teachings, with formal study at a renowned yoga university in India.", "title": "Traditional roots in India", "number": "Foundations"}, {"text": "Received extensive training at the renowned Bihar School of Yoga — a cornerstone of her practice and teaching style.", "title": "Bihar School of Yoga", "number": "Deepening"}, {"text": "Guided students from diverse cultures worldwide through yoga, mindfulness, psychology, and holistic well-being.", "title": "Global teaching & healing", "number": "25+ years"}, {"text": "Integrates asana, pranayama, meditation, Yoga Nidra, art, and healing — creating spaces for awareness and transformation.", "title": "Yoga, art & conscious living", "number": "Today"}], "enabled": true}, "paragraphs": []}	2026-06-12 19:36:04	2026-06-12 19:51:56.788	{"spacing": "normal", "paddingTop": 0, "contentWidth": "normal", "paddingBottom": 0, "textAlignment": "left", "contentWidthPx": 960, "textMaxWidthPx": 640}
a7d356c4-3820-4152-b050-b9bb2901e502	YOGA	EVENTS	Weekly sessions & workshops	\N	\N	\N	\N	8	t	{"limit": 6, "eventKind": "sessions", "categories": ["YOGA"]}	2026-06-10 18:58:23.022	2026-06-17 12:26:58.567	\N
3ac5e6d2-bf27-4a4b-927b-50a25dd42684	YOGA	EVENTS	Retreats & immersions	India and beyond	\N	\N	\N	9	t	{"limit": 4, "eventKind": "retreats"}	2026-06-10 18:58:23.025	2026-06-17 12:26:58.567	\N
8fb1212a-8a65-4f48-a47e-c95c04d01ecf	YOGA	CONTACT	Questions about classes or teacher training?	\N	\N	\N	\N	10	t	{"showForm": true, "formSubject": "Yoga inquiry"}	2026-06-10 18:58:23.03	2026-06-17 12:26:58.567	\N
088aa7ad-7805-4254-b215-9fd913cba5a2	YOGA	CUSTOM_TEXT	A path of awareness	Philosophy & presence	\N	\N	\N	1	t	{"sutra": {"source": "Patanjali Yoga Sutra 1.12", "enabled": true, "sanskrit": "अभ्यासवैराग्याभ्यां तन्निरोधः", "translation": "The mind is steadied through consistent practice and non-attachment.", "transliteration": "Abhyāsa-vairāgyābhyāṁ tan-nirodhaḥ"}, "variant": "yoga-journey", "paragraphs": ["At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection.", "Our teachings are rooted in traditional yogic wisdom while remaining accessible for modern life. Through asana, pranayama, meditation, and Yoga Nidra, we create practices that support the body, calm the mind, and deepen inner awareness.", "We believe yoga is not about performance or perfection.", "It is a mindful practice of presence, observation, and self-discovery.", "Each session is thoughtfully designed to cultivate harmony between body, breath, mind, and consciousness — allowing space for stillness, healing, clarity, and transformation.", "Alongside yoga, art becomes a meditative and creative expression of the inner self — helping expand awareness, intuition, and authentic flow."], "sutraEnabled": true, "introParagraphCount": 2}	2026-06-10 18:58:23.001	2026-06-17 12:26:58.567	{"sectionStyle": "muted", "textAlignment": "center"}
0e73c52a-182a-427b-b61c-7ba16642e094	JUST_ART_LIFE	CUSTOM_TEXT	How it began	Discovery & teaching	Art came into my life in 2011, not as a planned profession, but simply as a hobby.\n\nBefore that, I had only a brief exposure to fine arts, but nothing truly connected with me at the time.\n\nAs I began exploring myself through this newly discovered passion, something unexpected happened — as destiny would have it, I was asked to teach a few friends.\n\nAt that point, I had no formal training in art and very little technical knowledge.\n\nTeaching was simply a way to deepen my own hobby and continue learning through the process.\n\nSlowly, word spread, and more women began joining my classes.\n\nI was never afraid to try something new and always felt confident enough to guide others through whatever I had learned myself.\n\nOver time, art became more than painting on a canvas — it became a space of discovery, healing, expression, and connection.\n\nThrough this journey, I not only discovered my own path, but also had the privilege of helping many others discover theirs.\n\nSome fulfilled childhood dreams they had left behind years ago. Others found purpose, confidence, creativity, and joy through what they explored in the studio.\n\nI realized that art has its own language — a language beyond rules, age, culture, or perfection.\n\nI truly believe everyone has a creative side, and sometimes all they need is the right environment and encouragement to express it.\n\nWhen I moved to Japan, I found myself surrounded by a vibrant international community where many women and children showed deep interest in art.\n\nOnce again, I found my art-loving community, and over the years I became a well-established art teacher, guiding students through oil painting, watercolor, acrylics, and mixed media work.\n\nWatching my students grow — becoming more expressive, confident, and skilled with every piece they create — continues to be one of the most rewarding parts of my work.\n\nBeing self-taught and learning through experience has kept me humble. My mistakes became my greatest teachers.\n\nThey helped me understand both the limitations and the endless expansiveness of art.\n\nIn 2020, I founded Just Art Affair — a creative space built with the intention of making art accessible, meaningful, and joyful for everyone willing to explore it.	\N		1	t	{"variant": "art-journey", "timeline": {"mode": "manual", "items": [{"text": "As I began exploring myself through this newly discovered passion, something unexpected happened — as destiny would have it, I was asked to teach a few friends.", "number": "03"}, {"text": "At that point, I had no formal training in art and very little technical knowledge.", "number": "04"}, {"text": "Teaching was simply a way to deepen my own hobby and continue learning through the process.", "number": "05"}, {"text": "Slowly, word spread, and more women began joining my classes.", "number": "06"}, {"text": "I was never afraid to try something new and always felt confident enough to guide others through whatever I had learned myself.", "number": "07"}, {"text": "Over time, art became more than painting on a canvas — it became a space of discovery, healing, expression, and connection.", "number": "08"}, {"text": "Through this journey, I not only discovered my own path, but also had the privilege of helping many others discover theirs.", "number": "09"}, {"text": "Some fulfilled childhood dreams they had left behind years ago. Others found purpose, confidence, creativity, and joy through what they explored in the studio.", "number": "10"}, {"text": "I realized that art has its own language — a language beyond rules, age, culture, or perfection.", "number": "11"}, {"text": "I truly believe everyone has a creative side, and sometimes all they need is the right environment and encouragement to express it.", "number": "12"}, {"text": "When I moved to Japan, I found myself surrounded by a vibrant international community where many women and children showed deep interest in art.", "number": "13"}, {"text": "Once again, I found my art-loving community, and over the years I became a well-established art teacher, guiding students through oil painting, watercolor, acrylics, and mixed media work.", "number": "14"}, {"text": "Watching my students grow — becoming more expressive, confident, and skilled with every piece they create — continues to be one of the most rewarding parts of my work.", "number": "15"}, {"text": "Being self-taught and learning through experience has kept me humble. My mistakes became my greatest teachers.", "number": "16"}, {"text": "They helped me understand both the limitations and the endless expansiveness of art.", "number": "17"}, {"text": "In 2020, I founded Just Art Affair — a creative space built with the intention of making art accessible, meaningful, and joyful for everyone willing to explore it.", "number": "18"}], "enabled": true}, "highlights": [{"text": "I had no idea then that art would soon become a profession and an important part of my life.", "label": "An unexpected path", "enabled": true, "afterIndex": 5}, {"text": "A language beyond rules, age, culture, or perfection — waiting for the right environment and encouragement to be expressed.", "label": "Art’s own language", "enabled": true, "afterIndex": 11}], "paragraphs": ["Art came into my life in 2011, not as a planned profession, but simply as a hobby.", "Before that, I had only a brief exposure to fine arts, but nothing truly connected with me at the time.", "As I began exploring myself through this newly discovered passion, something unexpected happened — as destiny would have it, I was asked to teach a few friends.", "At that point, I had no formal training in art and very little technical knowledge.", "Teaching was simply a way to deepen my own hobby and continue learning through the process.", "Slowly, word spread, and more women began joining my classes.", "I was never afraid to try something new and always felt confident enough to guide others through whatever I had learned myself.", "Over time, art became more than painting on a canvas — it became a space of discovery, healing, expression, and connection.", "Through this journey, I not only discovered my own path, but also had the privilege of helping many others discover theirs.", "Some fulfilled childhood dreams they had left behind years ago. Others found purpose, confidence, creativity, and joy through what they explored in the studio.", "I realized that art has its own language — a language beyond rules, age, culture, or perfection.", "I truly believe everyone has a creative side, and sometimes all they need is the right environment and encouragement to express it.", "When I moved to Japan, I found myself surrounded by a vibrant international community where many women and children showed deep interest in art.", "Once again, I found my art-loving community, and over the years I became a well-established art teacher, guiding students through oil painting, watercolor, acrylics, and mixed media work.", "Watching my students grow — becoming more expressive, confident, and skilled with every piece they create — continues to be one of the most rewarding parts of my work.", "Being self-taught and learning through experience has kept me humble. My mistakes became my greatest teachers.", "They helped me understand both the limitations and the endless expansiveness of art.", "In 2020, I founded Just Art Affair — a creative space built with the intention of making art accessible, meaningful, and joyful for everyone willing to explore it."], "highlightsEnabled": true, "introParagraphCount": 0, "closingParagraphCount": 0}	2026-06-10 19:38:00.019	2026-06-12 17:09:55.965	{"sectionStyle": "muted", "textAlignment": "center"}
111f63fb-588b-4863-8c18-c204c86b071a	ABOUT	IMAGE_TEXT			Shalini Gupta is a yoga teacher, meditation guide, and wellness facilitator with over 25 years of experience in yoga, mindfulness, and holistic well-being. Raised in a family deeply rooted in traditional yogic teachings, she studied both the theoretical and practical aspects of yoga at a renowned yoga university in India and received extensive training at the renowned Bihar School of Yoga.\n\nHer work integrates yoga, breath awareness, mindfulness, healing practices, and insights from human psychology to support physical, mental, and emotional well-being. She has guided students of diverse ages and backgrounds across the world, helping them cultivate balance, clarity, relaxation, and deeper self-awareness.\n\nAlongside yoga, Shalini incorporates art and holistic healing as tools for self-expression and personal transformation. Her approach creates nurturing spaces where mindfulness, creativity, and conscious living come together, bridging ancient wisdom with modern understanding and offering authentic, accessible practices for contemporary life.	/uploads/homepage/whatsapp-image-2026-05-25-at-5-54-18-pm-1779875333765-4f015402.jpg	Hands resting in meditation	0	t	null	2026-06-12 19:36:03.946	2026-06-12 19:55:51.448	{"spacing": "tight", "imageSide": "left", "imageAspect": "compact", "contentWidth": "narrow"}
\.


--
-- Data for Name: SiteConfig; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SiteConfig" (id, name, tagline, "contactEmail", "contactPhone", "contactAddress", social, "createdAt", "updatedAt", "homepageLayout", "homepageSections", navigation, branding) FROM stdin;
main	Nirvana Yoga	Movement, stillness, and creative living.	nirvanayogaorg@gmail.com		Yokohama, Japan	[{"href": "https://www.instagram.com/nirvanyog1/", "label": "Instagram"}, {"href": "https://youtube.com", "label": "YouTube"}, {"href": "https://pinterest.com", "label": "Pinterest"}]	2026-05-23 07:55:15.269	2026-06-17 05:57:58.996	\N	{"gallery": {"title": "Moments from the studio", "eyebrow": "Gallery", "subtitle": "Art, practice, retreats, and the quiet beauty in between.", "primaryCta": {"href": "/gallery", "label": "View full gallery →"}, "emptyMessage": "No featured images yet. Mark images as \\"featured on homepage\\" in Gallery Manager."}, "pathways": [{"href": "/yoga", "title": "Yoga", "eyebrow": "Practice", "variant": "default", "ctaLabel": "Explore yoga offerings", "imageAlt": "Yoga practice — asana and mindful movement", "imageSrc": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80", "subtitle": "Asana, pranayama, meditation & Yoga Nidra.", "imageSide": "left", "highlights": ["Yoga asana & mindful movement", "Pranayama (breathwork)", "Meditation & inner awareness", "Yoga Nidra — deep relaxation", "Yoga Nidra Teacher Training (English & Japanese)", "Yoga Sutra & philosophy courses"], "description": "Through asana, pranayama, meditation, and Yoga Nidra, we create practices that support the body, calm the mind, and deepen inner awareness — rooted in tradition, accessible for modern life."}, {"href": "/healing", "title": "Healing", "eyebrow": "Care", "variant": "warm", "ctaLabel": "Discover healing pathways", "imageAlt": "Healing and holistic well-being", "imageSrc": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80", "subtitle": "Awareness, balance & holistic well-being.", "imageSide": "right", "highlights": ["Mindfulness & nervous system care", "Holistic healing pathways", "Emotional balance & inner awareness", "Personal, trust-centered approach", "Complementary to wider care teams"], "description": "Shalini's path expanded into healing, mindfulness, and human psychology — offering supportive practices that nurture emotional balance, clarity, and deeper connection with the self."}, {"href": "/just-art-life", "title": "Just Art Affaire", "eyebrow": "Creative life", "variant": "muted", "ctaLabel": "Enter the creative studio", "imageAlt": "Art and creative expression", "imageSrc": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80", "subtitle": "Art as self-expression & inner exploration.", "imageSide": "left", "highlights": ["Art as meditative expression", "Creativity & awareness together", "Gallery-driven storytelling", "Workshops & creative gatherings"], "description": "Alongside yoga, art becomes a pathway for self-expression and inner exploration — helping you deepen your soul's connection and allow creativity to flow naturally."}], "retreats": {"title": "Retreats & tours", "eyebrow": "Journeys", "subtitle": "Aspirational immersions—Japan, nature, and the art of slowing down.", "primaryCta": {"href": "/events", "label": "View all retreats"}}, "schedule": {"title": "Sessions & workshops", "eyebrow": "Gatherings", "subtitle": "Weekly classes, teacher training, philosophy courses, and upcoming immersions.", "primaryCta": {"href": "/contact", "label": "Enquire about sessions"}, "weeklyListTitle": "Weekly sessions", "programLinkLabel": "Learn more →"}, "newsletter": {"title": "Notes from the studio", "subtitle": "Monthly letters—classes, workshops, and quiet invitations."}, "philosophy": {"sutras": [{"source": "Patanjali Yoga Sutra 1.2", "sanskrit": "योगश्चित्तवृत्तिनिरोधः", "translation": "Yoga is the stilling of the fluctuations of the mind.", "interpretation": "At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection. Our teachings are rooted in traditional yogic wisdom while remaining accessible for modern life.", "transliteration": "Yogaś citta-vṛtti-nirodhaḥ"}, {"source": "Patanjali Yoga Sutra 1.12", "sanskrit": "अभ्यासवैराग्याभ्यां तन्निरोधः", "translation": "The mind is steadied through consistent practice and non-attachment.", "interpretation": "We believe yoga is not about performance or perfection. It is a mindful practice of presence, observation, and self-discovery. Each session cultivates harmony between body, breath, mind, and consciousness.", "transliteration": "Abhyāsa-vairāgyābhyāṁ tan-nirodhaḥ"}], "closing": "Alongside yoga, art becomes a meditative and creative expression of the inner self — helping expand awareness, intuition, and authentic flow.", "eyebrow": "Yogic wisdom", "heading": "Philosophy", "paragraphs": ["At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection. Our teachings are rooted in traditional yogic wisdom while remaining accessible for modern life.", "We believe yoga is not about performance or perfection. It is a mindful practice of presence, observation, and self-discovery. Each session cultivates harmony between body, breath, mind, and consciousness."]}, "aboutPreview": {"body": "Shalini Gupta is a yoga practitioner, meditation teacher, and wellness facilitator with over 25 years of experience. Raised in a family rooted in traditional yogic teachings in India, her path expanded into healing, mindfulness, and holistic well-being — guiding people toward balance, clarity, and deeper connection with themselves.", "eyebrow": "About Shalini", "heading": "About Shalini", "imageAlt": "Shalini Gupta — yoga teacher and wellness facilitator", "imageSrc": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80", "linkHref": "/about", "imageSide": "left", "linkLabel": "Read Shalini's full story", "highlights": ["25+ years in yoga, mindfulness & inner awareness", "Extensive training at the Bihar School of Yoga", "Students across cultures and age groups worldwide", "Art & holistic healing as pathways for transformation"]}, "testimonials": {"title": "Words from the studio", "eyebrow": "Community", "subtitle": "Honest reflections—shared with permission."}, "contactPreview": {"title": "Begin your journey", "eyebrow": "Connect", "subtitle": "Questions about weekly sessions, Yoga Nidra teacher training, workshops in Japan, or the India retreat — we welcome your message.", "primaryCta": {"href": "/contact", "label": "Send a message"}, "secondaryCta": {"href": "/events", "label": "View sessions & workshops"}}, "featuredEvents": {"ctaHref": "/events", "eyebrow": "Gatherings", "ctaLabel": "View all events →", "subtitle": "Workshops, teacher training, philosophy courses, and studio immersions — curated from our calendar.", "titleFeatured": "Featured events", "titleUpcoming": "Upcoming events", "ctaLabelMobile": "View all events"}, "weeklySessions": [{"day": "Wednesday", "time": "1:30 PM", "title": "Yoga Nidra (Japanese)", "language": "Japanese", "location": "Local studio"}, {"day": "Thursday", "time": "10:00 – 11:00 AM JST", "title": "Yoga session", "language": "English", "location": "Online & offline"}, {"day": "Thursday", "time": "7:00 – 8:00 AM JST", "title": "Yoga session", "language": "English", "location": "Online & offline"}], "upcomingPrograms": [{"href": "/events", "type": "Workshop", "dates": "30–31 May 2026", "title": "Yoga Nidra & Ayurveda Cooking", "location": "Hiroshima, Japan"}, {"href": "/yoga", "type": "Teacher training", "dates": "11-hour course · English & Japanese", "title": "Yoga Nidra Teachers Training Course", "detail": "Japanese course: 8 & 15 July. English online course — enquire by email.", "location": "Local studio — online & offline"}, {"href": "/yoga", "type": "Philosophy", "dates": "8-hour course · 18 & 25 August", "title": "Yoga Sutra & Philosophy Sessions", "detail": "English language sessions.", "location": "Online"}, {"href": "/events/retreats-and-tours", "type": "Retreat", "dates": "Dates TBD", "title": "India Retreat", "detail": "Yoga, pranayama, meditation, Yoga Nidra & Ayurveda therapies.", "location": "India"}]}	[{"href": "/", "label": "Home"}, {"href": "/about", "label": "About"}, {"href": "/yoga", "label": "Yoga"}, {"href": "/just-art-life", "label": "Just Art Affaire"}, {"href": "/healing", "label": "Healing"}, {"href": "/events", "label": "Events"}, {"href": "/gallery", "label": "Gallery"}, {"href": "/blog", "label": "Blog"}, {"href": "/contact", "label": "Contact"}]	{"nirvanaYoga": {"logoSrc": "/brand/nirvana-yoga-logo.png", "logoScale": 1.75}, "justArtAffaire": {"logoSrc": "/brand/just-art-affaire-logo.svg", "logoScale": 1}}
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Testimonial" (id, quote, name, role, "createdAt", "updatedAt", status, "imageAlt", "imageUrl", city, country, "displayStyle", "extractedText", "ocrConfidence", "sourceType", featured, "sortOrder") FROM stdin;
37d33742-dbfa-417e-838a-d6d6b10b89f2	5H Shalini's sessions are a very deep and unique experience. Rather than just physical yoga, she gently guides you through breath and awareness into a calm and inward state. | felt a profound sense of relaxation, where both my mind and body became very still and at ease. You can really sense her depth of knowledge and authenticity, especially knowing she has studied Her sessions naturally integrate awareness, creating an experience that goes far beyond a typical yoga class. | would highly recommend her to anyone looking for a deeper, more meditative practice. 0d sl FE,	Yumiko Mezaki	yoga, breathwork, and chakra	2026-05-26 19:10:05.322	2026-06-17 10:01:15.535	APPROVED	Yumiko Mezaki — Japan testimonial	/uploads/testimonials/yumiko-mezaki.jpeg	\N	\N	HANDWRITTEN	5H Shalini's sessions are a very deep\nand unique experience.\nRather than just physical yoga, she\ngently guides you through breath\nand awareness into a calm and\ninward state.\n| felt a profound sense of\nrelaxation, where both my mind\nand body became very still and at\nease.\nYou can really sense her depth of\nknowledge and authenticity,\nespecially knowing she has studied\nyoga at a professional level.\nHer sessions naturally integrate\nyoga, breathwork, and chakra\nawareness, creating an experience\nthat goes far beyond a typical yoga\nclass.\n| would highly recommend her to\nanyone looking for a deeper, more\nmeditative practice. 0d sl\n\nFE,	92	OCR	f	16
2754975a-e2a9-47e1-99e2-0b7f6d687f7c	Shalini introduce me to the meditation. | had a wonderful year of practice with her. Her meditations are very nicely guided. Every meditation is different. Since | left Japan it was hard to find someone to replace her. 	Louise Berlenghi 	Professional 	2026-05-26 19:10:05.322	2026-06-17 12:11:25.117	APPROVED	Louise — France testimonial	/uploads/testimonials/louise.jpeg	\N	France 	HANDWRITTEN	Shalini introduce me to the meditation. I\nhad a wonderful year of practice with\nher. Her meditations are very nicely\nguided. Every meditation is different.\nSince | left Japan it was hard to find\nsomeone to replace her.	92	OCR	f	2
ce3ff411-b0b7-499b-bdde-d8d577d686a4	Hi! Shalini, It was my pleasure to meet such a talented person. You are not only artist but also mind & face reader and not to forget a healer too. Would love to learn more from you in Art class. I'm totally fine if you share from the class. Good Day @ 11:46	Community member		2026-05-26 19:10:05.322	2026-06-17 10:01:15.573	APPROVED	Community testimonial	/uploads/testimonials/whatsapp-2026051833820.jpeg	\N	\N	HANDWRITTEN	Hi! Shalini, It was my pleasure to meet\nsuch a talented person. You are not\nonly artist but also mind & face reader\nand not to forget a healer too. Would\nlove to learn more from you in Art class.\nI'm totally fine if you share from the\nclass.\n\nGood Day @ 11:46	94	OCR	f	11
3033536f-aa44-4e94-96e4-e294e5a2fea8	| have a attended Shalini's art classes several times and they have always been very enjoyable and inspiring! She gives clear and helpful guidance without being restrictive and helps you explore and develop your own creativity. I'm genuinely happy with the pieces | created and enjoy looking at them every day. | highly recommend Shalini's art classes to anyone, whether beginner or experienced. 11:13 Thank you so much 44.45 »	Sabrina	Law Professional/Passionate Artist 	2026-05-26 19:10:05.322	2026-06-17 12:34:12.88	APPROVED	Sabrina — Germany testimonial	/uploads/testimonials/sabrina.jpeg	\N	Germany	HANDWRITTEN	| have a attended Shalini's art classes\nseveral times and they have always\nbeen very enjoyable and inspiring! She\ngives clear and helpful guidance\nwithout being restrictive and helps you\nexplore and develop your own creativity.\nI'm genuinely happy with the pieces |\ncreated and enjoy looking at them every\nday. | highly recommend Shalini's art\nclasses to anyone, whether beginner or\nexperienced.	93	OCR	f	9
e73be9de-b50e-428e-bc4c-59d6b35fa316	16:38 all = @ <8 QinQin Q & B = {4 Having lived in Japan for many years, it's been difficult to find a meditation teacher. Because my child and Shalini's child attend the same school, | had the opportunity to learn meditation from her. In the past few years, | initially practiced at her home, where Shalini would prepare authentic Masala tea for us after each class. Later, the school provided a space, so we moved to the school. After class, we would gather for coffee and chat, sometimes about our children's studies, sometimes weaving in the wisdom of meditation into our casual conversations—it's a truly wonderful memory. Meditation is one of my long-held interests. Although | sometimes don't fully understand due to the language barrier, | still persist in attending Shalini's classes. | remember once she organized a meditation session in a park. The cherry blossom trees were in full bloom. We sat under the trees, with a road behind us. While meditating, we could hear pedestrians and trucks passing by. Through her teaching, we focused NN} on our breathing, listened to the + © & © 9 Suggest reply Find topic Read the mood ©	Community member		2026-05-26 19:10:05.322	2026-06-17 10:01:15.579	APPROVED	Community testimonial	/uploads/testimonials/whatsapp-2026051833833.jpeg	\N	\N	HANDWRITTEN	16:38 all = @\n<8 QinQin Q & B =\n{4 Having lived in Japan for many\nyears, it's been difficult to find a\nmeditation teacher. Because my\nchild and Shalini's child attend the\nsame school, | had the opportunity\nto learn meditation from her. In the\npast few years, | initially practiced\nat her home, where Shalini would\nprepare authentic Masala tea for us\nafter each class.\nLater, the school provided a space,\nso we moved to the school. After\nclass, we would gather for coffee\nand chat, sometimes about our\nchildren's studies, sometimes\nweaving in the wisdom of\nmeditation into our casual\nconversations—it's a truly\nwonderful memory.\nMeditation is one of my long-held\ninterests. Although | sometimes\ndon't fully understand due to the\nlanguage barrier, | still persist in\nattending Shalini's classes.\n| remember once she organized a\nmeditation session in a park. The\ncherry blossom trees were in full\nbloom. We sat under the trees,\nwith a road behind us. While\nmeditating, we could hear\npedestrians and trucks passing by.\nThrough her teaching, we focused NN}\non our breathing, listened to the\n+ © & © 9\nSuggest reply Find topic Read the mood ©	90	OCR	f	14
0e730a0d-6664-4f59-aa23-f6bf0cda2320	| took healing sessions mainly to improve my health, especially my vertigo. Shalini helped me with that and much more. She guided me to the root of my health and personal challenges. Through these sessions, | rebuilt my confidence, understood the core causes of my issues, and started planning a more positive future. With her support, | am now able to recognize my problems and handle them better, leading a healthier and more positive life. 20:34 Thank you Neha . | hope this honest feedback touches many lives and help them too A v 20:42 W/	Neha	Japan	2026-05-26 19:10:05.322	2026-06-17 10:01:15.335	APPROVED	Neha — Japan testimonial	/uploads/testimonials/neha.jpeg	\N	\N	HANDWRITTEN	| took healing sessions mainly to\nimprove my health, especially my\nvertigo. Shalini helped me with that and\nmuch more. She guided me to the root\nof my health and personal challenges.\nThrough these sessions, | rebuilt my\nconfidence, understood the core\ncauses of my issues, and started\nplanning a more positive future. With\nher support, | am now able to recognize\nmy problems and handle them better,\nleading a healthier and more positive\nlife. 20:34\nThank you Neha .\n| hope this honest feedback touches\nmany lives and help them too\nA v 20:42 W/\nA	94	OCR	f	7
1e166aae-bc05-473f-a90e-fc201752ca9a	- Art class "My kids had a good experience in the class. Shalini was very dedicated and guided them closely, which helped them create beautiful pieces of art.” - Yoga Nidra "Yoga Nidra was a deeply interesting experience. While my body rested, my mind drifted between dreaming and wakefulness. It felt like a precious and meaningful pause in our fast- paced lives. “ Wo	Community member		2026-05-26 19:10:05.322	2026-06-17 10:01:15.539	APPROVED	Community testimonial	/uploads/testimonials/whatsapp-4.jpeg	\N	\N	HANDWRITTEN	- Art class\n\n"My kids had a good experience in\nthe class. Shalini was very\ndedicated and guided them\nclosely, which helped them create\nbeautiful pieces of art.”\n\n- Yoga Nidra\n\n"Yoga Nidra was a deeply\ninteresting experience. While my\nbody rested, my mind drifted\nbetween dreaming and\nwakefulness. It felt like a precious\nand meaningful pause in our fast-\npaced lives. “ Wo	91	OCR	f	13
a3574b2e-48b7-4010-aca7-05a6484223d5	1. As yoga nidra teacher | have learned so much from Shalini-sensei, as she explains the philosophy of yoga so thoughtfully. She pays close attention to every smallest changes in us. Whenever | feel a bit tense, she gently reminds me to 'take a deep breath,’ making me feel completely safe and supported. | feel | can truly surrender and trust her guidance. FURS LINEZ:E&:R	Ne ERAS	student and notices even the	2026-05-26 19:10:05.322	2026-06-17 10:01:15.333	APPROVED	Tomoa — Japan testimonial	/uploads/testimonials/tomoa.jpeg	\N	\N	HANDWRITTEN	Ne ERAS\n1. As yoga nidra teacher\n| have learned so much from\nShalini-sensei, as she explains the\nphilosophy of yoga so thoughtfully.\nShe pays close attention to every\nstudent and notices even the\nsmallest changes in us.\nWhenever | feel a bit tense, she\ngently reminds me to 'take a deep\nbreath,’ making me feel completely\nsafe and supported.\n| feel | can truly surrender and trust\nher guidance.\nFURS LINEZ:E&:R	90	OCR	f	10
0f5fe7b3-b925-4c2a-b0dd-7a80048e3c8a	| attended Shalini's meditation course, it was a truly meaningful experience. The sessions felt deeply engaging—not just mentally, but as a practice that connects both mind and body. | found it especially powerful in helping me become more aware of my physical sensations and inner feelings. After each class, | usually leave feeling calm, grounded, and deeply relaxed. It's been a refreshing and valuable experience overall.	June 	China	2026-05-26 19:10:05.322	2026-06-17 12:23:27.735	APPROVED	june — China testimonial	/uploads/testimonials/june.jpeg	\N	China	HANDWRITTEN	I attended Shalini's meditation course, it\nwas a truly meaningful experience. The\nsessions felt deeply engaging—not just\nmentally, but as a practice that\nconnects both mind and body. | found it\nespecially powerful in helping me\nbecome more aware of my physical\nsensations and inner feelings. After\neach class, | usually leave feeling calm,\ngrounded, and deeply relaxed. It's been\na refreshing and valuable experience\noverall.	93	OCR	f	0
31e77f89-1458-4784-997e-f4715ed21997	Shalini was the very first person | ever went to for a healing session, and | still hold so much gratitude for that experience. She created a space where | felt deeply safe, seen, and held; a space where | could truly pour my heart out without fear or judgment. What started as a healing session became so much more. She later became my teacher when | attended my first healing workshop, gently introducing me to this path and holding my hand as | slowly began paving my own way forward. Her energy carries this beautiful balance of warmth, wisdom, and lightness; like a loving teacher who makes you feel safe while also making the journey feel joyful and human. Some people leave a lasting imprint on your journey, and Shalini is definitely one of those souls for me.	Isha Joshi	Healer 	2026-05-26 19:10:05.322	2026-06-17 12:09:40.525	APPROVED	Isha Joshi — Dubai testimonial	/uploads/testimonials/isha-joshi.jpeg	\N	Dubai	HANDWRITTEN	Shalini was the very first person | ever\nwent to for a healing session, and | still\nhold so much gratitude for that\nexperience. She created a space where\n| felt deeply safe, seen, and held; a\nspace where | could truly pour my heart\nout without fear or judgment.\n\nWhat started as a healing session\nbecame so much more. She later\nbecame my teacher when | attended\nmy first healing workshop, gently\nintroducing me to this path and holding\nmy hand as | slowly began paving my\nown way forward.\n\nHer energy carries this beautiful\nbalance of warmth, wisdom, and\nlightness; like a loving teacher who\nmakes you feel safe while also making\nthe journey feel joyful and human.\nSome people leave a lasting imprint on\nyour journey, and Shalini is definitely\none of those souls for me.	95	OCR	f	1
d6209bdd-b373-4acc-9d60-8444c97c45c0	| took healing sessions from Shalini when | was a college student and was extremely lost and undecided about my future with extreme self-doubts and uncertainty about my own confidence. Taking these healing sessions helped rebuilt my own assertions as well as helped clear some doubts that | had about my future, as if a fog had been lifted off. This unique experience does not provide you with direct answers to your problems but rather helped me rebuilt my confidence and helped me in finding myself. 	M C	Jeweler 	2026-05-26 19:10:05.322	2026-06-17 12:12:51.829	APPROVED	M C — Japan testimonial	/uploads/testimonials/m-c.jpeg	\N	Japan 	HANDWRITTEN	| took healing sessions from Shalini\nwhen | was a college student and was\nextremely lost and undecided about my\nfuture with extreme self doubts and\nuncertainty about my own confidence.\nTaking these healing sessions helped\nrebuilt my own assertions as well as\nhelped clear some doubts that | had\nabout my future, as if a fog had been\nlifted off. This unique experience does\nnot provide you with direct answers to\nyour problems but rather helped me\nrebuilt my confidence and helped me in\nfinding myself.	94	OCR	f	3
58877748-384b-48b4-99f6-35892cbd96d7	As yoga nidra teacher | have learned so much from Shalini-sensei, as she explains the philosophy of yoga so thoughtfully. She pays close attention to every smallest change in us. Whenever | feel a bit tense, she gently reminds me to 'take a deep breath,’ making me feel completely safe and supported. | feel | can truly surrender and trust her guidance.\n\nAs a Retreat Organizer- Shalini Sensei i such a warm and sincere host. Every day, she would check in with us to make sure we are doing well, and i could really feel her genuine heart in wanting to understand each of our needs.	Tomoe 	Office Worker	2026-05-26 19:10:05.322	2026-06-17 12:23:05.783	APPROVED	Community testimonial	/uploads/testimonials/whatsapp-2.jpeg	Yokohama	Japan	HANDWRITTEN	\n1. As yoga nidra teacher\n| have learned so much from\nShalini-sensei, as she explains the\nphilosophy of yoga so thoughtfully.\nShe pays close attention to every\nstudent and notices even the\nsmallest changes in us.\nWhenever | feel a bit tense, she\ngently reminds me to 'take a deep\nbreath,’ making me feel completely\nsafe and supported.\n| feel | can truly surrender and trust\nher guidance. \n	89	OCR	f	5
026ee757-caba-4f93-9f4d-c44cbcba6195	16:38 all = @ <8 QinQin Q & B = {4S Having lived in Japan for many years, it's been difficult to find a meditation teacher. Because my child and Shalini's child attend the same school, | had the opportunity to learn meditation from her. In the past few years, | initially practiced at her home, where Shalini would prepare authentic Masala tea for us after each class. Later, the school provided a space, so we moved to the school. After class, we would gather for coffee and chat, sometimes about our children's studies, sometimes weaving in the wisdom of meditation into our casual conversations—it's a truly wonderful memory. Meditation is one of my long-held interests. Although | sometimes don't fully understand due to the language barrier, | still persist in attending Shalini's classes. | remember once she organized a meditation session in a park. The cherry blossom trees were in full bloom. We sat under the trees, with a road behind us. While meditating, we could hear pedestrians and trucks passing by. Through her teaching, we focused J on our breathing, listened to the + © © 9 Suggest reply Find topic Read the mood €	Qinqin	China And Japan	2026-05-26 19:10:05.322	2026-06-17 10:01:15.342	APPROVED	Qinqin — China And Japan testimonial	/uploads/testimonials/qinqin.jpeg	\N	\N	HANDWRITTEN	16:38 all = @\n<8 QinQin Q & B =\n{4S Having lived in Japan for many\nyears, it's been difficult to find a\nmeditation teacher. Because my\nchild and Shalini's child attend the\nsame school, | had the opportunity\nto learn meditation from her. In the\npast few years, | initially practiced\nat her home, where Shalini would\nprepare authentic Masala tea for us\nafter each class.\nLater, the school provided a space,\nso we moved to the school. After\nclass, we would gather for coffee\nand chat, sometimes about our\nchildren's studies, sometimes\nweaving in the wisdom of\nmeditation into our casual\nconversations—it's a truly\nwonderful memory.\nMeditation is one of my long-held\ninterests. Although | sometimes\ndon't fully understand due to the\nlanguage barrier, | still persist in\nattending Shalini's classes.\n| remember once she organized a\nmeditation session in a park. The\ncherry blossom trees were in full\nbloom. We sat under the trees,\nwith a road behind us. While\nmeditating, we could hear\npedestrians and trucks passing by.\nThrough her teaching, we focused J\non our breathing, listened to the\n+ © © 9\nSuggest reply Find topic Read the mood €	91	OCR	f	8
825e8dce-caf5-4df2-b624-89777dedeb34	I am truly grateful to have met you, Shalini sensei. When | first experienced yoganidra, | was deeply moved. In that moment, | felt, * This is it!" and realized that it is something truly needed in today's world. You have not only taught me the deeper meaning of yoga, which has greatly expanded my perspective and curiously. Your yoganidra class, | experience a deep sense of relaxation and calm. It helps me connect with myself on a deeper level. During the Ayurveda retreat, as it was my first trip to India. | felt a little anxious at first, but those feelings quickly melt away, your support and thoughtful coordination made it a truly special and unforgettable experience. This journey inspired me to me to continue learning, including Ayurveda, yoga philosophy and also made me realize the importance of English more than ever. Thank you so much for your kindness, your support and your beautiful guidance.	Rika 	Yoga (RYT200hr) certified practioner	2026-05-26 19:10:05.322	2026-06-17 12:15:53.663	APPROVED	Rika — Japan testimonial	/uploads/testimonials/rika.jpeg	Yokohama	Japan	HANDWRITTEN	I am truly grateful to have met you,\nShalini sensei.\nWhen | first experienced yoganidra,\n| was deeply moved. In that\nmoment, | felt, * This is it!" and\nrealized that it is something truly\nneeded in today's world.\nYou have not only taught me\nyoganidra, but also Ayurveda and\nthe deeper meaning of yoga, which\nhas greatly expanded my\nperspective and curiously.\nYour yoganidra class, | experience\na deep sense of relaxation and\ncalm. It helps me connect with\nmyself on a deeper level.\nDuring the Ayurveda retreat, as it\nwas my first trip to India. | felt a\nlittle anxious at first, but those\nfeelings quickly melt away, your\nsupport and thoughtful\ncoordination made it a truly special\nand unforgettable experience.\nThis journey inspired me to me to\ncontinue learning, including\nAyurveda, yoga philosophy and\nalso made me realize the\nimportance of English more than\never.\nThank you so much for your\nkindness, your support and your\nbeautiful guidance.	91	OCR	f	4
f5b91506-e544-46f3-950a-7f750071d2d5	Here is my honest review: I've been attending Shalini's meditation classes for many years, and it's genuinely one of the best commitments I've made for my mental and emotional wellbeing. Having tried meditating with many different teachers in various settings, what sets Shalini apart is how relatable and intuitive she is. Her guidance always feels personal and grounded. She has a remarkable ability to sense what each session needs and adjusts her techniques accordingly — it's consistently spot-on. Over the years, I've watched her help many fellow moms, including myself, work through stress and build mindfulness habits. Her warmth and patience create a space that feels safe and welcoming every single time. | couldn't recommend a better mentor to learn from and meditate with!	Miyuki Sam	Mother/Language translator	2026-05-26 19:10:05.322	2026-06-17 12:33:19.011	APPROVED	Miyuki Sam — Japan And Malaysia testimonial	/uploads/testimonials/miyuki-sam.jpeg	\N	Japan, Malaysia	HANDWRITTEN	I've been attending Shalini's meditation\nclasses for many years, and it's\ngenuinely one of the best commitments\nI've made for my mental and emotional\nwellbeing.\nHaving tried meditating with many\ndifferent teachers in various settings,\nwhat sets Shalini apart is how relatable\nand intuitive she is. Her guidance\nalways feels personal and grounded.\nShe has a remarkable ability to sense\nwhat each session needs and adjusts\nher techniques accordingly — it's\nconsistently spot-on.\nOver the years, I've watched her help\nmany fellow moms, including myself,\nwork through stress and build\nmindfulness habits. Her warmth and\npatience create a space that feels safe\nand welcoming every single time.\n| couldn't recommend a better mentor\nto learn from and meditate with!	93	OCR	f	6
1cbd9961-5872-4ab3-97b7-e3eba3416eac	\\¢& Iam truly grateful to have met you, Shalini sensei. When | first experienced yoganidra, | was deeply moved. In that moment, | felt, * This is it!" and realized that it is something truly needed in today’s world. You have not only taught me the deeper meaning of yoga, which has greatly expanded my perspective and curiously. Your yoganidra class, | experience a deep sense of relaxation and calm. It helps me connect with myself on a deeper level. During the Ayurveda retreat, as it was my first trip to India. | felt a little anxious at first, but those feelings quickly melt away, your support and thoughtful coordination made it a truly special and unforgettable experience. This journey inspired me to me to continue learning, including Ayurveda, yoga philosophy and also made me realize the importance of English more than ever. Thank you so much for your kindness, your support and your beautiful guidance J, 10:56 Vv	Community member	yoganidra, but also Ayurveda and	2026-05-26 19:10:05.322	2026-06-17 10:01:15.34	APPROVED	Community testimonial	/uploads/testimonials/whatsapp-2026051833842.jpeg	\N	\N	HANDWRITTEN	a\n\n\\¢& Iam truly grateful to have met you,\nShalini sensei.\nWhen | first experienced yoganidra,\n| was deeply moved. In that\nmoment, | felt, * This is it!" and\nrealized that it is something truly\nneeded in today’s world.\nYou have not only taught me\nyoganidra, but also Ayurveda and\nthe deeper meaning of yoga, which\nhas greatly expanded my\nperspective and curiously.\nYour yoganidra class, | experience\na deep sense of relaxation and\ncalm. It helps me connect with\nmyself on a deeper level.\nDuring the Ayurveda retreat, as it\nwas my first trip to India. | felt a\nlittle anxious at first, but those\nfeelings quickly melt away, your\nsupport and thoughtful\ncoordination made it a truly special\nand unforgettable experience.\nThis journey inspired me to me to\ncontinue learning, including\nAyurveda, yoga philosophy and\nalso made me realize the\nimportance of English more than\never.\nThank you so much for your\nkindness, your support and your\nbeautiful guidance J,\n\n10:56 Vv	92	OCR	f	15
008bcc63-285c-4cda-b877-ca1317870a13	6 [Ck 9 2. As your india ayurveda retreat organiser and guide Shalini-sensei is such a warm and sincere host. Every day, she would check in with us to make sure we were doing well, and | could really feel her genuine heart in wanting to understand each of our needs. It was so easy to trust her because she truly cares about everyone. Her explanations of Ayurveda were so interesting that they made me want to dive even deeper into it! Also, having her by my side during our local outings made me feel so safe and relaxed—I| knew that with her, everything would be okay. She even took the time to listen to all our wishes for sightseeing, making every moment of the trip so much fun. I'm so grateful for her kindness! I	Community member		2026-05-26 19:10:05.322	2026-06-17 10:01:15.577	APPROVED	Community testimonial	/uploads/testimonials/whatsapp-3.jpeg	\N	\N	HANDWRITTEN	6 [Ck\n\n9 2. As your india ayurveda retreat\norganiser and guide\nShalini-sensei is such a warm and\nsincere host.\nEvery day, she would check in with\nus to make sure we were doing\nwell, and | could really feel her\ngenuine heart in wanting to\nunderstand each of our needs.\nIt was so easy to trust her because\nshe truly cares about everyone.\nHer explanations of Ayurveda were\nso interesting that they made me\nwant to dive even deeper into it!\nAlso, having her by my side during\nour local outings made me feel so\nsafe and relaxed—I| knew that with\nher, everything would be okay.\nShe even took the time to listen to\nall our wishes for sightseeing,\nmaking every moment of the trip so\nmuch fun. I'm so grateful for her\nkindness! I	93	OCR	f	12
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, "avatarUrl", "createdAt", "updatedAt") FROM stdin;
a51440b2-fa25-4598-a74c-d07b23a55c47	admin@nirvana-yoga.example	Nirvana Admin	\N	2026-05-23 07:55:15.226	2026-05-23 07:55:15.226
\.


--
-- Name: AboutPage AboutPage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AboutPage"
    ADD CONSTRAINT "AboutPage_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: GalleryCollage GalleryCollage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GalleryCollage"
    ADD CONSTRAINT "GalleryCollage_pkey" PRIMARY KEY (id);


--
-- Name: GalleryCollection GalleryCollection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GalleryCollection"
    ADD CONSTRAINT "GalleryCollection_pkey" PRIMARY KEY (id);


--
-- Name: GalleryImage GalleryImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GalleryImage"
    ADD CONSTRAINT "GalleryImage_pkey" PRIMARY KEY (id);


--
-- Name: HeroSection HeroSection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HeroSection"
    ADD CONSTRAINT "HeroSection_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscriber NewsletterSubscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NewsletterSubscriber"
    ADD CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY (id);


--
-- Name: PageSection PageSection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PageSection"
    ADD CONSTRAINT "PageSection_pkey" PRIMARY KEY (id);


--
-- Name: SiteConfig SiteConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SiteConfig"
    ADD CONSTRAINT "SiteConfig_pkey" PRIMARY KEY (id);


--
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BlogPost_slug_key" ON public."BlogPost" USING btree (slug);


--
-- Name: Event_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Event_slug_key" ON public."Event" USING btree (slug);


--
-- Name: GalleryCollage_category_isPublished_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GalleryCollage_category_isPublished_idx" ON public."GalleryCollage" USING btree (category, "isPublished");


--
-- Name: GalleryCollage_collectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GalleryCollage_collectionId_idx" ON public."GalleryCollage" USING btree ("collectionId");


--
-- Name: GalleryCollage_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "GalleryCollage_slug_key" ON public."GalleryCollage" USING btree (slug);


--
-- Name: GalleryCollection_category_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GalleryCollection_category_sortOrder_idx" ON public."GalleryCollection" USING btree (category, "sortOrder");


--
-- Name: GalleryCollection_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "GalleryCollection_slug_key" ON public."GalleryCollection" USING btree (slug);


--
-- Name: GalleryImage_category_isPublished_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GalleryImage_category_isPublished_idx" ON public."GalleryImage" USING btree (category, "isPublished");


--
-- Name: GalleryImage_collectionId_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GalleryImage_collectionId_sortOrder_idx" ON public."GalleryImage" USING btree ("collectionId", "sortOrder");


--
-- Name: GalleryImage_sourceKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "GalleryImage_sourceKey_key" ON public."GalleryImage" USING btree ("sourceKey");


--
-- Name: NewsletterSubscriber_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON public."NewsletterSubscriber" USING btree (email);


--
-- Name: PageSection_pageType_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PageSection_pageType_sortOrder_idx" ON public."PageSection" USING btree ("pageType", "sortOrder");


--
-- Name: Testimonial_status_featured_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Testimonial_status_featured_sortOrder_idx" ON public."Testimonial" USING btree (status, featured, "sortOrder");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: BlogPost BlogPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Event Event_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GalleryCollage GalleryCollage_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GalleryCollage"
    ADD CONSTRAINT "GalleryCollage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public."GalleryCollection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GalleryImage GalleryImage_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GalleryImage"
    ADD CONSTRAINT "GalleryImage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public."GalleryCollection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HeroSection HeroSection_collageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HeroSection"
    ADD CONSTRAINT "HeroSection_collageId_fkey" FOREIGN KEY ("collageId") REFERENCES public."GalleryCollage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict IJY1s3fsc3PCKkTe9KK7PBTkEr2ETBFaCRdIMWkkgTtyv8m6EpaQF3KOXiHCsIq

