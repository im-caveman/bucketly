-- Hobby Lists Seed Script
-- Usage: This script inserts 6 new bucket lists with their items.
-- User ID is pre-filled: 59b95405-1963-476d-a6b8-5041857ee24e

DO $$
DECLARE
    target_user_id uuid := '59b95405-1963-476d-a6b8-5041857ee24e';
    new_list_id uuid;
BEGIN
    -- =============================================
    -- LIST 1: Maker's List: 30 Crafts to Master
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Maker''s List: 30 Crafts to Master',
        'Master the art of making with your hands',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, description, points, difficulty, completed)
    VALUES
        (new_list_id, 'Origami', 'Master the ancient Japanese art of paper folding, from simple cranes to complex dragons', 30, 'medium', false),
        (new_list_id, 'Scrapbooking', 'Preserve memories in beautifully designed albums with photos, stickers, and journaling', 10, 'easy', false),
        (new_list_id, 'Bookbinding', 'Craft handmade journals, notebooks, and books from scratch', 50, 'hard', false),
        (new_list_id, 'Tie-Dye', 'Create psychedelic patterns on clothing using vibrant dye techniques', 10, 'easy', false),
        (new_list_id, 'Knitting', 'Transform yarn into cozy scarves, sweaters, and blankets with rhythmic needlework', 30, 'medium', false),
        (new_list_id, 'Weaving', 'Use a loom to create intricate textiles, tapestries, and fabric art', 50, 'hard', false),
        (new_list_id, 'Embroidery', 'Add decorative stitching to fabric, creating intricate designs and patterns', 30, 'medium', false),
        (new_list_id, 'Painting', 'Express yourself with watercolors, acrylics, or oils on canvas', 30, 'medium', false),
        (new_list_id, 'Sketching & Drawing', 'Capture the world around you with pencil, charcoal, or ink', 30, 'medium', false),
        (new_list_id, 'Digital Art', 'Create stunning artwork using tablets and software like Procreate or Adobe', 30, 'medium', false),
        (new_list_id, 'Calligraphy', 'Master the art of beautiful handwriting and lettering', 30, 'medium', false),
        (new_list_id, 'Clip Art & Illustration', 'Design graphics, icons, and illustrations for digital or print', 30, 'medium', false),
        (new_list_id, 'Pottery & Ceramics', 'Shape clay into functional bowls, mugs, and decorative pieces', 50, 'hard', false),
        (new_list_id, 'Sculpting', 'Mold clay, stone, or metal into three-dimensional art pieces', 50, 'hard', false),
        (new_list_id, 'Cosplay', 'Design and build elaborate costumes of your favorite characters', 50, 'hard', false),
        (new_list_id, 'Cake Decorating', 'Transform ordinary cakes into edible masterpieces with fondant and frosting', 30, 'medium', false),
        (new_list_id, 'Charcuterie Board Design', 'Arrange meats, cheeses, and accompaniments into Instagram-worthy spreads', 10, 'easy', false),
        (new_list_id, 'Flower Arranging (Ikebana)', 'Create stunning floral displays and bouquets', 30, 'medium', false),
        (new_list_id, 'Candle Making', 'Pour, scent, and design custom candles for your space', 10, 'easy', false),
        (new_list_id, 'Soap Making', 'Craft handmade soaps with natural ingredients and custom scents', 30, 'medium', false),
        (new_list_id, 'Nail Art', 'Design intricate manicures with polish, gems, and creative techniques', 30, 'medium', false),
        (new_list_id, 'Jewelry Making', 'Create custom necklaces, bracelets, and earrings from beads and metals', 30, 'medium', false),
        (new_list_id, 'Woodworking', 'Build furniture, cutting boards, and wooden crafts from raw lumber', 50, 'hard', false),
        (new_list_id, 'Leather Crafting', 'Design and stitch wallets, belts, and bags from genuine leather', 50, 'hard', false),
        (new_list_id, 'PC Building', 'Assemble custom gaming or workstation computers from components', 30, 'medium', false),
        (new_list_id, 'Mechanical Keyboard Building', 'Design, solder, and customize your perfect typing experience', 30, 'medium', false),
        (new_list_id, 'Skateboard Crafting', 'Build and customize skateboards from deck to wheels', 30, 'medium', false),
        (new_list_id, 'Model Building', 'Construct detailed scale models of cars, planes, ships, or buildings', 30, 'medium', false),
        (new_list_id, 'Terrarium Design', 'Create miniature ecosystems in glass containers with plants and décor', 10, 'easy', false),
        (new_list_id, 'Interior Decorating', 'Transform living spaces with color, furniture, and design principles', 30, 'medium', false);

    -- =============================================
    -- LIST 2: Zen Zone: 20 Hobbies for Inner Peace
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Zen Zone: 20 Hobbies for Inner Peace',
        'Find your calm and recharge your soul through mindful pursuits',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, description, points, difficulty, completed)
    VALUES
        (new_list_id, 'Bird Watching', 'Identify and observe wild birds in their natural habitats', 10, 'easy', false),
        (new_list_id, 'Star Gazing (Astronomy)', 'Study constellations, planets, and deep-sky objects with telescopes', 10, 'easy', false),
        (new_list_id, 'Cloud Watching', 'Identify cloud formations and enjoy the ever-changing sky', 10, 'easy', false),
        (new_list_id, 'Nature Walks', 'Explore local trails and parks, connecting with the outdoors', 10, 'easy', false),
        (new_list_id, 'Foraging', 'Learn to identify and harvest edible wild plants, mushrooms, and herbs', 30, 'medium', false),
        (new_list_id, 'Aquascaping', 'Design and maintain beautiful underwater landscapes in aquariums', 50, 'hard', false),
        (new_list_id, 'Watercolor Painting', 'Create soft, flowing artwork with this peaceful painting medium', 30, 'medium', false),
        (new_list_id, 'Adult Coloring Books', 'Relax with intricate mandala and pattern coloring pages', 10, 'easy', false),
        (new_list_id, 'Poetry Writing', 'Express emotions and observations through verse and rhythm', 30, 'medium', false),
        (new_list_id, 'Journaling', 'Document thoughts, gratitude, and daily reflections in writing', 10, 'easy', false),
        (new_list_id, 'Blogging', 'Share your thoughts, experiences, and expertise with an online audience', 30, 'medium', false),
        (new_list_id, 'Photography', 'Capture moments and beauty through the lens of a camera', 30, 'medium', false),
        (new_list_id, 'Meditation', 'Practice mindfulness and mental clarity through guided or silent meditation', 30, 'medium', false),
        (new_list_id, 'Yoga', 'Improve flexibility, strength, and inner peace through ancient poses and breathing', 30, 'medium', false),
        (new_list_id, 'Tai Chi', 'Practice slow, flowing martial arts movements for balance and tranquility', 30, 'medium', false),
        (new_list_id, 'Reading', 'Escape into novels, learn from non-fiction, or explore poetry collections', 10, 'easy', false),
        (new_list_id, 'Tea Ceremony', 'Master the Japanese art of preparing and serving matcha tea mindfully', 50, 'hard', false),
        (new_list_id, 'Sound Bath Therapy', 'Experience healing vibrations from singing bowls and gongs', 10, 'easy', false),
        (new_list_id, 'Puzzle Solving', 'Assemble jigsaw puzzles, Sudoku, crosswords, or logic puzzles', 10, 'easy', false),
        (new_list_id, 'Listening to Music', 'Explore genres, create playlists, and truly listen to albums front-to-back', 10, 'easy', false),
        (new_list_id, 'Bonsai Cultivation', 'Grow and shape miniature trees in the Japanese tradition', 50, 'hard', false),
        (new_list_id, 'Pressed Flower Art', 'Preserve flowers and create botanical artwork', 10, 'easy', false);

    -- =============================================
    -- LIST 3: Squad Goals: Group Hobbies Bucket List
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Squad Goals: Group Hobbies Bucket List',
        'Activities best enjoyed with others',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, description, points, difficulty, completed)
    VALUES
        (new_list_id, 'Team Sports', 'Join recreational leagues for soccer, basketball, volleyball, or softball', 30, 'medium', false),
        (new_list_id, 'Book Clubs', 'Read and discuss literature with fellow book lovers monthly', 10, 'easy', false),
        (new_list_id, 'Cooking Classes', 'Learn new cuisines and techniques while meeting food enthusiasts', 30, 'medium', false),
        (new_list_id, 'Dance Classes', 'Master salsa, swing, hip-hop, or ballroom dancing with partners', 30, 'medium', false),
        (new_list_id, 'Fitness Classes', 'Join group workouts like spin, CrossFit, Zumba, or bootcamp', 30, 'medium', false),
        (new_list_id, 'Trivia Nights', 'Test your knowledge at local pubs with teams of friends', 10, 'easy', false),
        (new_list_id, 'Board Game Nights', 'Host or join regular meetups for strategy and party games', 10, 'easy', false),
        (new_list_id, 'Karaoke', 'Sing your heart out at bars or private rooms with friends', 10, 'easy', false),
        (new_list_id, 'Community Theater', 'Act, build sets, or work behind the scenes in local productions', 50, 'hard', false),
        (new_list_id, 'Improv Comedy', 'Join classes or troupes to practice spontaneous performance', 50, 'hard', false),
        (new_list_id, 'Open Mic Nights', 'Share poetry, comedy, or music at local venues', 50, 'hard', false),
        (new_list_id, 'Volunteering', 'Give time to causes you care about: animal shelters, food banks, mentoring', 30, 'medium', false),
        (new_list_id, 'Coaching Youth Sports', 'Share your athletic knowledge while shaping young lives', 30, 'medium', false),
        (new_list_id, 'Community Gardening', 'Grow vegetables and flowers alongside neighbors in shared plots', 30, 'medium', false),
        (new_list_id, 'Car/Motorcycle Meets', 'Connect with fellow enthusiasts and show off your ride', 10, 'easy', false),
        (new_list_id, 'Gaming Communities', 'Join online or in-person groups for video games, D&D, or tabletop', 10, 'easy', false);

    -- =============================================
    -- LIST 4: The Education List
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'The Education List',
        'Build your brain and skillset one hobby at a time',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, description, points, difficulty, completed)
    VALUES
        (new_list_id, 'Coding & Programming', 'Learn Python, JavaScript, or app development', 50, 'hard', false),
        (new_list_id, 'Robotics', 'Build and program robots using Arduino, Raspberry Pi, or LEGO Mindstorms', 50, 'hard', false),
        (new_list_id, 'Electronics & Circuits', 'Learn to solder, build circuits, and understand electrical engineering', 50, 'hard', false),
        (new_list_id, '3D Printing', 'Design and print custom objects, tools, and prototypes', 30, 'medium', false),
        (new_list_id, 'Drone Building & Flying', 'Assemble FPV racing drones or aerial photography quadcopters', 50, 'hard', false),
        (new_list_id, 'Ham Radio Operating', 'Get licensed and communicate globally via amateur radio', 50, 'hard', false),
        (new_list_id, 'Astronomy', 'Study celestial objects, planets, and the universe through observation', 30, 'medium', false),
        (new_list_id, 'Amateur Chemistry', 'Conduct safe experiments and learn about chemical reactions', 50, 'hard', false),
        (new_list_id, 'Geology & Rock Collecting', 'Identify minerals, fossils, and geological formations', 10, 'easy', false),
        (new_list_id, 'Gardening & Horticulture', 'Grow vegetables, herbs, flowers, or indoor plants', 30, 'medium', false),
        (new_list_id, 'Beekeeping', 'Maintain hives, harvest honey, and support pollinator populations', 50, 'hard', false),
        (new_list_id, 'Mycology (Mushroom Cultivation)', 'Grow gourmet or medicinal mushrooms at home', 30, 'medium', false),
        (new_list_id, 'Learning a New Language', 'Master Spanish, Japanese, French, or sign language', 50, 'hard', false),
        (new_list_id, 'Creative Writing', 'Craft short stories, novels, screenplays, or fan fiction', 30, 'medium', false),
        (new_list_id, 'Podcasting', 'Start your own show discussing topics you''re passionate about', 30, 'medium', false),
        (new_list_id, 'Public Speaking (Toastmasters)', 'Improve presentation and communication skills', 50, 'hard', false),
        (new_list_id, 'Woodworking', 'Build furniture and learn joinery, finishing, and design', 50, 'hard', false),
        (new_list_id, 'Welding', 'Join metal through various welding techniques (MIG, TIG, stick)', 50, 'hard', false),
        (new_list_id, 'Automotive Repair', 'Learn to maintain and fix your own vehicle', 50, 'hard', false),
        (new_list_id, 'Sewing & Tailoring', 'Alter clothes, make garments from patterns, or repair textiles', 30, 'medium', false),
        (new_list_id, 'Home Brewing', 'Craft your own beer, cider, mead, or kombucha', 30, 'medium', false),
        (new_list_id, 'Business Analytics', 'Learn to analyze data and make informed business decisions', 50, 'hard', false),
        (new_list_id, 'Digital Marketing', 'Master SEO, social media marketing, and content strategy', 30, 'medium', false),
        (new_list_id, 'Finance & Investing', 'Understand personal finance, budgeting, and investment strategies', 30, 'medium', false),
        (new_list_id, 'Psychology Studies', 'Read and understand human behavior, cognition, and mental health', 30, 'medium', false);

    -- =============================================
    -- LIST 5: The Athlete's Bucket List
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'The Athlete''s Bucket List',
        'Push your limits, break a sweat, and discover what your body can do',
        'adventures',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, description, points, difficulty, completed)
    VALUES
        (new_list_id, 'Hiking & Backpacking', 'Explore trails from day hikes to multi-day wilderness treks', 30, 'medium', false),
        (new_list_id, 'Rock Climbing', 'Scale indoor walls or outdoor cliffs using strength and technique', 50, 'hard', false),
        (new_list_id, 'Mountain Biking', 'Ride off-road trails through forests and mountains', 50, 'hard', false),
        (new_list_id, 'Geocaching', 'Use GPS to find hidden treasures in a worldwide scavenger hunt', 10, 'easy', false),
        (new_list_id, 'Kayaking & Canoeing', 'Paddle rivers, lakes, and coastal waters', 30, 'medium', false),
        (new_list_id, 'Trail Running', 'Run through nature on dirt paths and mountain trails', 50, 'hard', false),
        (new_list_id, 'Parkour', 'Navigate urban environments with running, jumping, and climbing', 50, 'hard', false),
        (new_list_id, 'Snowboarding', 'Carve down mountains on a board during winter months', 50, 'hard', false),
        (new_list_id, 'Skiing', 'Glide down slopes with alpine or cross-country techniques', 50, 'hard', false),
        (new_list_id, 'Ice Skating', 'Skate on frozen ponds or indoor rinks for recreation or hockey', 30, 'medium', false),
        (new_list_id, 'Swimming', 'Train for fitness, competition, or just enjoy the water', 30, 'medium', false),
        (new_list_id, 'Surfing', 'Ride ocean waves on a board, connecting with nature''s power', 50, 'hard', false),
        (new_list_id, 'Stand-Up Paddleboarding (SUP)', 'Balance on a board while paddling calm waters', 30, 'medium', false),
        (new_list_id, 'Scuba Diving', 'Explore underwater worlds with certification and equipment', 50, 'hard', false),
        (new_list_id, 'Powerlifting', 'Build maximum strength with squat, bench press, and deadlift', 50, 'hard', false),
        (new_list_id, 'Bodybuilding', 'Sculpt your physique through targeted weight training and nutrition', 50, 'hard', false),
        (new_list_id, 'CrossFit', 'Engage in varied high-intensity functional fitness workouts', 50, 'hard', false),
        (new_list_id, 'Calisthenics', 'Master bodyweight exercises like pull-ups, muscle-ups, and handstands', 50, 'hard', false),
        (new_list_id, 'Running & Marathons', 'Train for 5Ks, half-marathons, or full marathon races', 50, 'hard', false),
        (new_list_id, 'Cycling', 'Ride road bikes, mountain bikes, or join group cycling clubs', 30, 'medium', false),
        (new_list_id, 'Boxing', 'Learn striking technique, footwork, and conditioning through pugilism', 50, 'hard', false),
        (new_list_id, 'Brazilian Jiu-Jitsu', 'Master ground fighting and submission grappling', 50, 'hard', false),
        (new_list_id, 'Muay Thai', 'Practice the "art of eight limbs" with kicks, knees, elbows, and punches', 50, 'hard', false),
        (new_list_id, 'Wrestling', 'Develop takedowns, pins, and mat control through this ancient sport', 50, 'hard', false),
        (new_list_id, 'Krav Maga', 'Learn practical self-defense techniques', 50, 'hard', false),
        (new_list_id, 'Taekwondo', 'Practice high kicks and forms in this Korean martial art', 50, 'hard', false),
        (new_list_id, 'Football (Soccer)', 'Join recreational leagues or pickup games', 30, 'medium', false),
        (new_list_id, 'Basketball', 'Play pickup games or join adult recreation leagues', 30, 'medium', false),
        (new_list_id, 'Volleyball', 'Compete in beach or indoor volleyball teams', 30, 'medium', false),
        (new_list_id, 'Ultimate Frisbee', 'Play this fast-paced team sport combining football and frisbee', 30, 'medium', false),
        (new_list_id, 'Roller Skating/Blading', 'Skate in parks, rinks, or on urban streets', 30, 'medium', false),
        (new_list_id, 'Skateboarding', 'Learn tricks at skate parks or cruise around town', 50, 'hard', false),
        (new_list_id, 'Slacklining', 'Balance on suspended webbing between trees or posts', 50, 'hard', false),
        (new_list_id, 'Bouldering', 'Climb short but challenging routes without ropes', 50, 'hard', false);

    -- =============================================
    -- LIST 6: The Money Maker's List
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'The Money Maker''s List',
        'Hobbies that build skills AND income',
        'miscellaneous',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, description, points, difficulty, completed)
    VALUES
        (new_list_id, 'YouTube Channel', 'Create videos, build an audience, and monetize through ads and sponsors', 50, 'hard', false),
        (new_list_id, 'TikTok Content Creation', 'Share short-form videos and grow a following', 30, 'medium', false),
        (new_list_id, 'Podcasting', 'Monetize through sponsorships, Patreon, or merchandise', 30, 'medium', false),
        (new_list_id, 'Blogging', 'Write content and earn through ads, affiliate marketing, or sponsored posts', 30, 'medium', false),
        (new_list_id, 'Social Media Influencing', 'Build a following on Instagram, Twitter, or LinkedIn', 50, 'hard', false),
        (new_list_id, 'Dropshipping', 'Sell products online without holding inventory', 30, 'medium', false),
        (new_list_id, 'Print on Demand', 'Design and sell custom apparel, mugs, and products', 30, 'medium', false),
        (new_list_id, 'Affiliate Marketing', 'Earn commissions promoting products you love', 30, 'medium', false),
        (new_list_id, 'Digital Product Creation', 'Sell courses, templates, presets, or ebooks', 50, 'hard', false),
        (new_list_id, 'Freelance Services', 'Offer writing, design, coding, or consulting services', 30, 'medium', false),
        (new_list_id, 'Stock Market Investing', 'Build wealth through equities, ETFs, and index funds', 30, 'medium', false),
        (new_list_id, 'Real Estate Investing', 'Purchase rental properties or flip houses for profit', 50, 'hard', false),
        (new_list_id, 'Cryptocurrency Trading', 'Learn about blockchain and digital asset markets', 50, 'hard', false),
        (new_list_id, 'Options Trading', 'Advanced strategy for income generation through stock options', 50, 'hard', false),
        (new_list_id, 'Selling Crafts (Etsy)', 'Turn handmade goods into an online business', 30, 'medium', false),
        (new_list_id, 'Photography Sales', 'Sell prints, stock photos, or offer portrait sessions', 30, 'medium', false),
        (new_list_id, 'Music Production', 'Create beats, sell samples, or license tracks', 50, 'hard', false),
        (new_list_id, 'Streaming (Twitch)', 'Play games or create content while earning from viewers', 50, 'hard', false);

END $$;
