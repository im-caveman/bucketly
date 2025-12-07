-- Diverse Bucket Lists Seed Script
-- Usage: This script inserts 11 new diverse bucket lists with their items.
-- User ID is pre-filled: 59b95405-1963-476d-a6b8-5041857ee24e

DO $$
DECLARE
    target_user_id uuid := '59b95405-1963-476d-a6b8-5041857ee24e';
    new_list_id uuid;
BEGIN
    -- =============================================
    -- LIST 1: Foodie's World Tour: 40 Culinary Experiences
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Foodie''s World Tour: 40 Culinary Experiences',
        'Taste the world one dish at a time',
        'cuisines',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Eat authentic pasta in Italy', 400, 'medium', false),
        (new_list_id, 'Try sushi at Tsukiji Market, Tokyo', 400, 'medium', false),
        (new_list_id, 'Sample street food in Bangkok', 300, 'medium', false),
        (new_list_id, 'Dine at a Michelin-star restaurant', 500, 'hard', false),
        (new_list_id, 'Attend a wine tasting in Napa Valley', 300, 'medium', false),
        (new_list_id, 'Try Ethiopian coffee ceremony', 200, 'medium', false),
        (new_list_id, 'Eat paella in Valencia, Spain', 400, 'medium', false),
        (new_list_id, 'Sample chocolate in Belgium', 300, 'medium', false),
        (new_list_id, 'Try authentic tacos in Mexico City', 300, 'medium', false),
        (new_list_id, 'Eat croissants in Paris', 300, 'medium', false),
        (new_list_id, 'Attend a tea ceremony in Japan', 300, 'medium', false),
        (new_list_id, 'Try haggis in Scotland', 300, 'medium', false),
        (new_list_id, 'Sample pad thai in Thailand', 300, 'medium', false),
        (new_list_id, 'Eat dim sum in Hong Kong', 400, 'medium', false),
        (new_list_id, 'Try Cuban sandwich in Havana', 400, 'medium', false),
        (new_list_id, 'Attend Oktoberfest in Munich', 500, 'hard', false),
        (new_list_id, 'Sample BBQ in Texas/Kansas City', 300, 'medium', false),
        (new_list_id, 'Try Greek food in Athens', 400, 'medium', false),
        (new_list_id, 'Eat lobster in Maine', 300, 'medium', false),
        (new_list_id, 'Sample gelato in Florence', 300, 'medium', false),
        (new_list_id, 'Try pho in Vietnam', 300, 'medium', false),
        (new_list_id, 'Attend a traditional clambake', 200, 'medium', false),
        (new_list_id, 'Try authentic curry in India', 400, 'medium', false),
        (new_list_id, 'Sample cheese in France/Switzerland', 300, 'medium', false),
        (new_list_id, 'Eat fresh oysters', 100, 'easy', false),
        (new_list_id, 'Try Korean BBQ in Seoul', 400, 'medium', false),
        (new_list_id, 'Sample tapas in Spain', 300, 'medium', false),
        (new_list_id, 'Eat beignets in New Orleans', 200, 'medium', false),
        (new_list_id, 'Try authentic ramen in Tokyo', 400, 'medium', false),
        (new_list_id, 'Attend a food festival', 100, 'easy', false),
        (new_list_id, 'Take a cooking class abroad', 300, 'medium', false),
        (new_list_id, 'Eat at a supper club', 200, 'medium', false),
        (new_list_id, 'Try molecular gastronomy', 400, 'medium', false),
        (new_list_id, 'Forage for mushrooms', 200, 'medium', false),
        (new_list_id, 'Catch and cook your own fish', 300, 'medium', false),
        (new_list_id, 'Bake bread from scratch', 100, 'easy', false),
        (new_list_id, 'Make homemade pasta', 100, 'easy', false),
        (new_list_id, 'Host a dinner party for 10+', 200, 'medium', false),
        (new_list_id, 'Eat at a Michelin 3-star', 800, 'hard', false),
        (new_list_id, 'Try every cuisine in your city', 500, 'hard', false);

    -- =============================================
    -- LIST 2: Life Milestones: 25 Things Everyone Should Do
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Life Milestones: 25 Things Everyone Should Do',
        'Major achievements and personal growth moments',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Fall in love', 1000, 'hard', false),
        (new_list_id, 'Get married', 1000, 'hard', false),
        (new_list_id, 'Have children', 1000, 'hard', false),
        (new_list_id, 'Buy a house', 1000, 'hard', false),
        (new_list_id, 'Start a business', 800, 'hard', false),
        (new_list_id, 'Publish a book/article', 500, 'hard', false),
        (new_list_id, 'Give a TED talk or public speech', 500, 'hard', false),
        (new_list_id, 'Run a marathon', 800, 'hard', false),
        (new_list_id, 'Learn a second language', 500, 'hard', false),
        (new_list_id, 'Get a tattoo', 200, 'medium', false),
        (new_list_id, 'Donate blood', 100, 'easy', false),
        (new_list_id, 'Mentor someone', 300, 'medium', false),
        (new_list_id, 'Overcome a major fear', 500, 'hard', false),
        (new_list_id, 'Achieve financial independence', 1000, 'hard', false),
        (new_list_id, 'Pay off debt', 800, 'hard', false),
        (new_list_id, 'Save $10,000/$100,000', 800, 'hard', false),
        (new_list_id, 'Invest in stocks/real estate', 500, 'hard', false),
        (new_list_id, 'Create a will', 200, 'medium', false),
        (new_list_id, 'Plant a tree', 50, 'easy', false),
        (new_list_id, 'Adopt a pet', 300, 'medium', false),
        (new_list_id, 'Make a difference in someone''s life', 500, 'hard', false),
        (new_list_id, 'Forgive someone', 300, 'medium', false),
        (new_list_id, 'Live abroad for 6+ months', 1000, 'hard', false),
        (new_list_id, 'Complete a personal transformation', 1000, 'hard', false),
        (new_list_id, 'Achieve work-life balance', 800, 'hard', false);

    -- =============================================
    -- LIST 3: Family First: 20 Memories to Make
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Family First: 20 Memories to Make',
        'Cherish moments with your loved ones',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Take parents on a dream vacation', 1000, 'hard', false),
        (new_list_id, 'Have a family reunion', 500, 'hard', false),
        (new_list_id, 'Create a family tree', 200, 'medium', false),
        (new_list_id, 'Record grandparents'' life stories', 300, 'medium', false),
        (new_list_id, 'Family photo shoot', 150, 'easy', false),
        (new_list_id, 'Multi-generational trip', 800, 'hard', false),
        (new_list_id, 'Teach your child to ride a bike', 200, 'medium', false),
        (new_list_id, 'Read bedtime stories every night for a year', 500, 'hard', false),
        (new_list_id, 'Build something with your hands together', 200, 'medium', false),
        (new_list_id, 'Attend your child''s graduation', 500, 'hard', false),
        (new_list_id, 'Walk daughter/son down the aisle', 1000, 'hard', false),
        (new_list_id, 'Become a grandparent', 1000, 'hard', false),
        (new_list_id, 'Family camping trip', 300, 'medium', false),
        (new_list_id, 'Sunday dinners for a year', 500, 'hard', false),
        (new_list_id, 'Create family traditions', 200, 'medium', false),
        (new_list_id, 'Restore old family photos', 200, 'medium', false),
        (new_list_id, 'Cook grandma''s recipes', 100, 'easy', false),
        (new_list_id, 'Family game night every week', 300, 'medium', false),
        (new_list_id, 'Volunteer as a family', 200, 'medium', false),
        (new_list_id, 'Create a family time capsule', 100, 'easy', false);

    -- =============================================
    -- LIST 4: Self-Discovery: 30 Ways to Grow
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Self-Discovery: 30 Ways to Grow',
        'Journey inward to find your true self',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Complete 30-day digital detox', 500, 'hard', false),
        (new_list_id, 'Start therapy/counseling', 300, 'medium', false),
        (new_list_id, 'Practice meditation daily for 3 months', 400, 'medium', false),
        (new_list_id, 'Keep a gratitude journal for a year', 500, 'hard', false),
        (new_list_id, 'Read 50 books in a year', 500, 'hard', false),
        (new_list_id, 'Learn to say no', 200, 'medium', false),
        (new_list_id, 'Set boundaries', 300, 'medium', false),
        (new_list_id, 'Attend a silent retreat', 400, 'medium', false),
        (new_list_id, 'Practice yoga regularly', 200, 'medium', false),
        (new_list_id, 'Complete a solo retreat', 400, 'medium', false),
        (new_list_id, 'Write morning pages for 90 days', 300, 'medium', false),
        (new_list_id, 'Overcome imposter syndrome', 500, 'hard', false),
        (new_list_id, 'Define your personal values', 200, 'medium', false),
        (new_list_id, 'Create a vision board', 100, 'easy', false),
        (new_list_id, 'Attend a personal development seminar', 300, 'medium', false),
        (new_list_id, 'Find a mentor', 300, 'medium', false),
        (new_list_id, 'Become a mentor', 300, 'medium', false),
        (new_list_id, 'Complete personality assessment (Myers-Briggs, etc.)', 50, 'easy', false),
        (new_list_id, 'Face your biggest fear', 800, 'hard', false),
        (new_list_id, 'Practice self-love daily', 300, 'medium', false),
        (new_list_id, 'Develop a morning routine', 200, 'medium', false),
        (new_list_id, 'Learn emotional intelligence', 400, 'medium', false),
        (new_list_id, 'Practice mindfulness', 200, 'medium', false),
        (new_list_id, 'Complete shadow work', 500, 'hard', false),
        (new_list_id, 'Heal from past trauma', 1000, 'hard', false),
        (new_list_id, 'Forgive yourself', 500, 'hard', false),
        (new_list_id, 'Create healthy habits', 300, 'medium', false),
        (new_list_id, 'Quit a bad habit', 500, 'hard', false),
        (new_list_id, 'Practice self-compassion', 300, 'medium', false),
        (new_list_id, 'Find your life purpose', 1000, 'hard', false);

    -- =============================================
    -- LIST 5: Renaissance Person: 40 Skills to Master
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Renaissance Person: 40 Skills to Master',
        'Become a jack of all trades',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Learn a musical instrument', 500, 'hard', false),
        (new_list_id, 'Speak conversational in 3 languages', 800, 'hard', false),
        (new_list_id, 'Learn to code (Python/JavaScript)', 500, 'hard', false),
        (new_list_id, 'Master photography', 300, 'medium', false),
        (new_list_id, 'Learn to cook 20 recipes from scratch', 200, 'medium', false),
        (new_list_id, 'Get certified in first aid/CPR', 150, 'easy', false),
        (new_list_id, 'Learn sign language', 300, 'medium', false),
        (new_list_id, 'Master public speaking', 400, 'medium', false),
        (new_list_id, 'Learn calligraphy', 100, 'easy', false),
        (new_list_id, 'Play chess competitively', 300, 'medium', false),
        (new_list_id, 'Learn to juggle', 100, 'easy', false),
        (new_list_id, 'Master a magic trick', 100, 'easy', false),
        (new_list_id, 'Learn to dance (salsa, ballroom, etc.)', 300, 'medium', false),
        (new_list_id, 'Get a professional certification', 400, 'medium', false),
        (new_list_id, 'Learn automotive repair basics', 300, 'medium', false),
        (new_list_id, 'Master home repairs', 300, 'medium', false),
        (new_list_id, 'Learn woodworking', 400, 'medium', false),
        (new_list_id, 'Get scuba certified', 400, 'medium', false),
        (new_list_id, 'Learn to sew', 200, 'medium', false),
        (new_list_id, 'Master gardening', 300, 'medium', false),
        (new_list_id, 'Learn archery', 200, 'medium', false),
        (new_list_id, 'Get pilot''s license', 1000, 'hard', false),
        (new_list_id, 'Learn mixology', 200, 'medium', false),
        (new_list_id, 'Master grilling/smoking meats', 200, 'medium', false),
        (new_list_id, 'Learn photography editing', 200, 'medium', false),
        (new_list_id, 'Master a sport', 500, 'hard', false),
        (new_list_id, 'Learn survival skills', 400, 'medium', false),
        (new_list_id, 'Get sommelier certification', 800, 'hard', false),
        (new_list_id, 'Learn graphic design', 300, 'medium', false),
        (new_list_id, 'Master speed reading', 200, 'medium', false),
        (new_list_id, 'Learn negotiation', 300, 'medium', false),
        (new_list_id, 'Master time management', 200, 'medium', false),
        (new_list_id, 'Learn about investments', 300, 'medium', false),
        (new_list_id, 'Get CPR certified', 150, 'easy', false),
        (new_list_id, 'Master productivity systems', 200, 'medium', false),
        (new_list_id, 'Learn mental math', 200, 'medium', false),
        (new_list_id, 'Master storytelling', 300, 'medium', false),
        (new_list_id, 'Learn sales skills', 300, 'medium', false),
        (new_list_id, 'Master networking', 300, 'medium', false),
        (new_list_id, 'Complete online course from top university', 300, 'medium', false);

    -- =============================================
    -- LIST 6: Fit for Life: 25 Physical Challenges
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Fit for Life: 25 Physical Challenges',
        'Push your physical limits',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Run a 5K', 200, 'medium', false),
        (new_list_id, 'Complete half marathon', 400, 'medium', false),
        (new_list_id, 'Finish a full marathon', 800, 'hard', false),
        (new_list_id, 'Do 100 pushups in a row', 300, 'medium', false),
        (new_list_id, 'Hold a 5-minute plank', 300, 'medium', false),
        (new_list_id, 'Complete a triathlon', 800, 'hard', false),
        (new_list_id, 'Climb a 14,000+ ft mountain', 600, 'hard', false),
        (new_list_id, 'Hike 100 miles in a month', 400, 'medium', false),
        (new_list_id, 'Do a pull-up (or 10)', 200, 'medium', false),
        (new_list_id, 'Master a handstand', 300, 'medium', false),
        (new_list_id, 'Complete 30-day fitness challenge', 200, 'medium', false),
        (new_list_id, 'Reach goal weight', 500, 'hard', false),
        (new_list_id, 'Build visible abs', 500, 'hard', false),
        (new_list_id, 'Deadlift your body weight', 300, 'medium', false),
        (new_list_id, 'Complete Murph workout', 500, 'hard', false),
        (new_list_id, 'Swim a mile', 300, 'medium', false),
        (new_list_id, 'Bike 100 miles in a day', 500, 'hard', false),
        (new_list_id, 'Complete obstacle course race (Spartan/Tough Mudder)', 500, 'hard', false),
        (new_list_id, 'Master yoga pose (crow, headstand)', 200, 'medium', false),
        (new_list_id, 'Walk 10,000 steps daily for a year', 500, 'hard', false),
        (new_list_id, 'Complete couch to 5K', 200, 'medium', false),
        (new_list_id, 'Try 10 different workout classes', 200, 'medium', false),
        (new_list_id, 'Hire a personal trainer', 300, 'medium', false),
        (new_list_id, 'Complete transformation challenge', 500, 'hard', false),
        (new_list_id, 'Achieve fitness goal age 50+', 500, 'hard', false);

    -- =============================================
    -- LIST 7: Wellness Warrior: 20 Self-Care Goals
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Wellness Warrior: 20 Self-Care Goals',
        'Prioritize your health and well-being',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Complete 30-day meditation streak', 300, 'medium', false),
        (new_list_id, 'Practice yoga 100 times', 400, 'medium', false),
        (new_list_id, 'Get a massage monthly for a year', 400, 'medium', false),
        (new_list_id, 'Try acupuncture', 200, 'medium', false),
        (new_list_id, 'Do a juice cleanse', 200, 'medium', false),
        (new_list_id, 'Complete sleep challenge (8 hours for 30 days)', 300, 'medium', false),
        (new_list_id, 'Try cryotherapy', 200, 'medium', false),
        (new_list_id, 'Experience float therapy', 200, 'medium', false),
        (new_list_id, 'Get regular therapy', 400, 'medium', false),
        (new_list_id, 'Practice breathwork', 150, 'easy', false),
        (new_list_id, 'Try sound healing', 150, 'easy', false),
        (new_list_id, 'Experience reiki', 150, 'easy', false),
        (new_list_id, 'Visit a wellness retreat', 500, 'hard', false),
        (new_list_id, 'Complete stress management course', 200, 'medium', false),
        (new_list_id, 'Try forest bathing', 100, 'easy', false),
        (new_list_id, 'Practice grounding daily', 100, 'easy', false),
        (new_list_id, 'Create self-care routine', 200, 'medium', false),
        (new_list_id, 'Set healthy boundaries', 300, 'medium', false),
        (new_list_id, 'Reduce caffeine/alcohol', 300, 'medium', false),
        (new_list_id, 'Prioritize sleep hygiene', 200, 'medium', false);

    -- =============================================
    -- LIST 8: Creative Soul: 30 Artistic Pursuits
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Creative Soul: 30 Artistic Pursuits',
        'Unleash your inner artist',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Write a book', 800, 'hard', false),
        (new_list_id, 'Start a blog', 200, 'medium', false),
        (new_list_id, 'Create a podcast', 300, 'medium', false),
        (new_list_id, 'Paint a canvas', 150, 'easy', false),
        (new_list_id, 'Learn pottery', 200, 'medium', false),
        (new_list_id, 'Write and perform a song', 400, 'medium', false),
        (new_list_id, 'Act in a play', 400, 'medium', false),
        (new_list_id, 'Take a photography class', 200, 'medium', false),
        (new_list_id, 'Create a photo book', 150, 'easy', false),
        (new_list_id, 'Write poetry', 150, 'easy', false),
        (new_list_id, 'Learn filmmaking', 400, 'medium', false),
        (new_list_id, 'Create YouTube channel', 300, 'medium', false),
        (new_list_id, 'Design your own clothes', 400, 'medium', false),
        (new_list_id, 'Build a website from scratch', 400, 'medium', false),
        (new_list_id, 'Create digital art', 200, 'medium', false),
        (new_list_id, 'Learn animation', 400, 'medium', false),
        (new_list_id, 'Write a screenplay', 500, 'hard', false),
        (new_list_id, 'Compose music', 300, 'medium', false),
        (new_list_id, 'Create sculpture', 300, 'medium', false),
        (new_list_id, 'Master drawing', 400, 'medium', false),
        (new_list_id, 'Design your dream home', 200, 'medium', false),
        (new_list_id, 'Create vision board', 100, 'easy', false),
        (new_list_id, 'Start a journal', 100, 'easy', false),
        (new_list_id, 'Create family cookbook', 200, 'medium', false),
        (new_list_id, 'Design a logo', 150, 'easy', false),
        (new_list_id, 'Make a short film', 400, 'medium', false),
        (new_list_id, 'Create NFT art', 200, 'medium', false),
        (new_list_id, 'Build a portfolio', 300, 'medium', false),
        (new_list_id, 'Sell your art', 400, 'medium', false),
        (new_list_id, 'Win an art competition', 500, 'hard', false);

    -- =============================================
    -- LIST 9: Career Goals: 20 Professional Milestones
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Career Goals: 20 Professional Milestones',
        'Achieve professional success and financial freedom',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Get dream job', 800, 'hard', false),
        (new_list_id, 'Earn 6-figure salary', 800, 'hard', false),
        (new_list_id, 'Start a business', 800, 'hard', false),
        (new_list_id, 'Reach $1M revenue', 1000, 'hard', false),
        (new_list_id, 'Get promoted', 400, 'medium', false),
        (new_list_id, 'Win industry award', 500, 'hard', false),
        (new_list_id, 'Speak at conference', 400, 'medium', false),
        (new_list_id, 'Get featured in media', 400, 'medium', false),
        (new_list_id, 'Build personal brand', 300, 'medium', false),
        (new_list_id, 'Negotiate 20%+ raise', 400, 'medium', false),
        (new_list_id, 'Change careers successfully', 500, 'hard', false),
        (new_list_id, 'Become a thought leader', 800, 'hard', false),
        (new_list_id, 'Get published in major outlet', 500, 'hard', false),
        (new_list_id, 'Launch a product', 500, 'hard', false),
        (new_list_id, 'Build passive income stream', 500, 'hard', false),
        (new_list_id, 'Achieve financial independence', 1000, 'hard', false),
        (new_list_id, 'Retire early', 1000, 'hard', false),
        (new_list_id, 'Create multiple income streams', 800, 'hard', false),
        (new_list_id, 'Build a team', 500, 'hard', false),
        (new_list_id, 'Exit a business successfully', 1000, 'hard', false);

    -- =============================================
    -- LIST 10: Make a Difference: 25 Ways to Give Back
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Make a Difference: 25 Ways to Give Back',
        'Leave the world better than you found it',
        'acts-of-service',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Volunteer 100 hours', 400, 'medium', false),
        (new_list_id, 'Donate to 10 different charities', 200, 'medium', false),
        (new_list_id, 'Mentor a young person', 300, 'medium', false),
        (new_list_id, 'Build a house (Habitat for Humanity)', 500, 'hard', false),
        (new_list_id, 'Donate blood 10 times', 300, 'medium', false),
        (new_list_id, 'Plant 100 trees', 400, 'medium', false),
        (new_list_id, 'Organize a charity event', 500, 'hard', false),
        (new_list_id, 'Start a nonprofit', 800, 'hard', false),
        (new_list_id, 'Sponsor a child''s education', 400, 'medium', false),
        (new_list_id, 'Volunteer abroad', 600, 'hard', false),
        (new_list_id, 'Clean up beach/park', 150, 'easy', false),
        (new_list_id, 'Donate bone marrow', 500, 'hard', false),
        (new_list_id, 'Foster an animal', 400, 'medium', false),
        (new_list_id, 'Teach a skill for free', 200, 'medium', false),
        (new_list_id, 'Fundraise $10,000 for a cause', 800, 'hard', false),
        (new_list_id, 'Become an organ donor', 100, 'easy', false),
        (new_list_id, 'Support local businesses', 100, 'easy', false),
        (new_list_id, 'Pay for stranger''s meal', 150, 'easy', false),
        (new_list_id, 'Leave generous tips', 100, 'easy', false),
        (new_list_id, 'Random acts of kindness for 30 days', 300, 'medium', false),
        (new_list_id, 'Donate hair', 200, 'medium', false),
        (new_list_id, 'Start a scholarship', 500, 'hard', false),
        (new_list_id, 'Advocate for a cause', 200, 'medium', false),
        (new_list_id, 'Participate in protest/march', 150, 'easy', false),
        (new_list_id, 'Vote in every election', 100, 'easy', false);

    -- =============================================
    -- LIST 11: Once in a Lifetime: 40 Unique Experiences
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Once in a Lifetime: 40 Unique Experiences',
        'Epic adventures and rare moments',
        'adventures',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Swim in bioluminescent water', 500, 'hard', false),
        (new_list_id, 'Float in the Dead Sea', 400, 'medium', false),
        (new_list_id, 'See solar eclipse', 300, 'medium', false),
        (new_list_id, 'Witness volcano eruption (safely)', 500, 'hard', false),
        (new_list_id, 'Sleep under the stars', 150, 'easy', false),
        (new_list_id, 'Camp in the desert', 300, 'medium', false),
        (new_list_id, 'Stay in ice hotel', 500, 'hard', false),
        (new_list_id, 'Sleep in treehouse', 200, 'medium', false),
        (new_list_id, 'Visit all 7 continents', 1000, 'hard', false),
        (new_list_id, 'Cross international date line', 300, 'medium', false),
        (new_list_id, 'Stand on equator', 300, 'medium', false),
        (new_list_id, 'Visit both poles', 1000, 'hard', false),
        (new_list_id, 'See wild animals in nature', 300, 'medium', false),
        (new_list_id, 'Attend Burning Man', 600, 'hard', false),
        (new_list_id, 'Experience Carnival in Rio', 600, 'hard', false),
        (new_list_id, 'Attend Oktoberfest', 500, 'hard', false),
        (new_list_id, 'See cherry blossoms in Japan', 400, 'medium', false),
        (new_list_id, 'Experience Holi festival in India', 400, 'medium', false),
        (new_list_id, 'Attend Tomatina in Spain', 400, 'medium', false),
        (new_list_id, 'See Day of the Dead in Mexico', 400, 'medium', false),
        (new_list_id, 'Attend Mardi Gras', 400, 'medium', false),
        (new_list_id, 'Experience white nights in Russia', 400, 'medium', false),
        (new_list_id, 'Witness migration (wildebeest, monarch butterflies)', 500, 'hard', false),
        (new_list_id, 'See wild penguins', 500, 'hard', false),
        (new_list_id, 'Swim with dolphins/whales', 400, 'medium', false),
        (new_list_id, 'Hold a koala', 300, 'medium', false),
        (new_list_id, 'Feed giraffes', 200, 'medium', false),
        (new_list_id, 'Walk with elephants (ethical sanctuary)', 400, 'medium', false),
        (new_list_id, 'Pet a wild animal (ethical)', 300, 'medium', false),
        (new_list_id, 'Discover hidden waterfall', 200, 'medium', false),
        (new_list_id, 'Find a geocache', 100, 'easy', false),
        (new_list_id, 'Message in a bottle', 100, 'easy', false),
        (new_list_id, 'Time capsule', 100, 'easy', false),
        (new_list_id, 'See your name in lights', 200, 'medium', false),
        (new_list_id, 'Ring a church bell', 100, 'easy', false),
        (new_list_id, 'Touch an iceberg', 500, 'hard', false),
        (new_list_id, 'See glacier calving', 500, 'hard', false),
        (new_list_id, 'Experience zero gravity', 800, 'hard', false),
        (new_list_id, 'Get struck by lightning (survived)', 1000, 'hard', false),
        (new_list_id, 'Meet a celebrity', 200, 'medium', false);

END $$;
