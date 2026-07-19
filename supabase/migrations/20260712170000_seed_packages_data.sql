-- Seed packages data into site_sections table
INSERT INTO public.site_sections (section, sort_order, data, is_published, created_at, updated_at) VALUES
(
  'packages',
  1,
  jsonb_build_object(
    'name', 'Starter',
    'tier', 'home',
    'price', 45000,
    'install', 50000,
    'down', 30,
    'up', 15,
    'features', jsonb_build_array(
      'Unlimited data',
      'Fair usage 500 GB',
      'Free Wi-Fi router',
      '24/7 support'
    ),
    'recommended', false,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
),
(
  'packages',
  2,
  jsonb_build_object(
    'name', 'Family',
    'tier', 'family',
    'price', 65000,
    'install', 50000,
    'down', 50,
    'up', 25,
    'features', jsonb_build_array(
      'Unlimited data',
      'Fair usage 1 TB',
      'Free Wi-Fi router',
      '2 bonus lines',
      '24/7 support'
    ),
    'recommended', false,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
),
(
  'packages',
  3,
  jsonb_build_object(
    'name', 'Pro Gamer',
    'tier', 'pro_gamer',
    'price', 85000,
    'install', 50000,
    'down', 100,
    'up', 50,
    'features', jsonb_build_array(
      'Unlimited data',
      'Fair usage 2 TB',
      'Free Wi-Fi router',
      'Gaming priority',
      'Low latency optimization',
      '24/7 priority support'
    ),
    'recommended', true,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
),
(
  'packages',
  4,
  jsonb_build_object(
    'name', 'Business 200',
    'tier', 'business',
    'price', 195000,
    'install', 100000,
    'down', 200,
    'up', 100,
    'features', jsonb_build_array(
      'Unlimited data',
      'Fair usage 5 TB',
      'Free business Wi-Fi router',
      'Business VPN',
      'Dedicated support line',
      'SLA guarantee'
    ),
    'recommended', false,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
),
(
  'packages',
  5,
  jsonb_build_object(
    'name', 'Business 500',
    'tier', 'business_enterprise',
    'price', 450000,
    'install', 200000,
    'down', 500,
    'up', 250,
    'features', jsonb_build_array(
      'Unlimited data',
      'Fair usage 10 TB',
      'Free enterprise Wi-Fi setup',
      'Business VPN',
      'Dedicated account manager',
      '24/7 SLA guarantee',
      'Custom monitoring'
    ),
    'recommended', false,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
),
(
  'packages',
  6,
  jsonb_build_object(
    'name', 'Unlimited fiber for your household',
    'tier', 'unlimited_fiber',
    'price', 0,
    'install', 0,
    'down', 0,
    'up', 0,
    'features', jsonb_build_array(),
    'recommended', false,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
),
(
  'packages',
  7,
  jsonb_build_object(
    'name', 'Symmetrical fiber with SLA',
    'tier', 'fiber_sla',
    'price', 0,
    'install', 0,
    'down', 0,
    'up', 0,
    'features', jsonb_build_array(),
    'recommended', false,
    'duration', 'monthly'
  ),
  true,
  now(),
  now()
);
