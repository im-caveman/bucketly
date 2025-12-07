-- Travel Destinations Seed Script
-- Usage: This script inserts 9 new travel bucket lists with their items.
-- User ID is pre-filled: 59b95405-1963-476d-a6b8-5041857ee24e

DO $$
DECLARE
    target_user_id uuid := '59b95405-1963-476d-a6b8-5041857ee24e';
    new_list_id uuid;
BEGIN
    -- =============================================
    -- LIST 1: PUNE BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Pune Bucket List',
        'Explore the cultural capital of Maharashtra',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Visit the Aga Khan Palace', 30, 'medium', false),
        (new_list_id, 'Explore the Shani Shingnapur Fort', 30, 'medium', false),
        (new_list_id, 'Walk through the Kirkee War Cemetery', 10, 'easy', false),
        (new_list_id, 'Attend a festival or event at the Sawai Gandharva Music Festival', 30, 'medium', false),
        (new_list_id, 'Visit the Pune Museum', 10, 'easy', false),
        (new_list_id, 'Take a stroll through the Fergusson College Campus', 10, 'easy', false),
        (new_list_id, 'Try the famous Misal Pav at a local eatery', 10, 'easy', false),
        (new_list_id, 'Indulge in Vada Pav at a street food stall', 10, 'easy', false),
        (new_list_id, 'Trek to the Sinhagad Fort', 50, 'hard', false),
        (new_list_id, 'Go camping at Pawna Lake', 30, 'medium', false),
        (new_list_id, 'Take a bike ride to the nearby Mulshi Lake', 30, 'medium', false),
        (new_list_id, 'Visit the Osho International Meditation Resort', 30, 'medium', false),
        (new_list_id, 'Visit the Tulshi Baug', 10, 'easy', false),
        (new_list_id, 'Party at the Koregaon Nightlife District', 30, 'medium', false),
        (new_list_id, 'Shop at the Fergusson College Road', 10, 'easy', false);

    -- =============================================
    -- LIST 2: JAIPUR BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Jaipur Bucket List',
        'Discover the Pink City of India',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Explore Amer Fort', 30, 'medium', false),
        (new_list_id, 'Visit City Palace', 30, 'medium', false),
        (new_list_id, 'Discover Hawa Mahal', 10, 'easy', false),
        (new_list_id, 'Attend a traditional Rajasthani folk dance show', 30, 'medium', false),
        (new_list_id, 'Take a hot air balloon ride', 50, 'hard', false),
        (new_list_id, 'Go on a camel safari', 30, 'medium', false),
        (new_list_id, 'Take a day trip to Sanganer', 30, 'medium', false),
        (new_list_id, 'Indulge in traditional Rajasthani cuisine', 10, 'easy', false),
        (new_list_id, 'Explore the ancient abandoned city of Abhaneri', 30, 'medium', false),
        (new_list_id, 'Visit the Jaipur Literature Festival', 30, 'medium', false),
        (new_list_id, 'Take a pottery class', 30, 'medium', false),
        (new_list_id, 'Visit the Nahargarh Fort', 30, 'medium', false),
        (new_list_id, 'Explore Ajmer and Pushkar', 50, 'hard', false),
        (new_list_id, 'Visit the Jawahar Kala Kendra', 10, 'easy', false);

    -- =============================================
    -- LIST 3: PONDICHERRY BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Pondicherry Bucket List',
        'Experience the French Riviera of the East',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Walk along the French colonial streets', 10, 'easy', false),
        (new_list_id, 'Visit the French Consulate', 10, 'easy', false),
        (new_list_id, 'Explore the French Quarter''s hidden alleys', 10, 'easy', false),
        (new_list_id, 'Visit the Sri Aurobindo Ashram', 10, 'easy', false),
        (new_list_id, 'Attend a meditation session at the Ashram', 30, 'medium', false),
        (new_list_id, 'Visit Auroville', 30, 'medium', false),
        (new_list_id, 'Relax at the Promenade Beach', 10, 'easy', false),
        (new_list_id, 'Take a sunset stroll along the beach', 10, 'easy', false),
        (new_list_id, 'Go surfing or kayaking', 50, 'hard', false),
        (new_list_id, 'Indulge in French-Indian cuisine', 10, 'easy', false),
        (new_list_id, 'Try fresh seafood at a beachside eatery', 10, 'easy', false),
        (new_list_id, 'Sample French pastries and coffee', 10, 'easy', false),
        (new_list_id, 'Attend a Bharatanatyam performance', 30, 'medium', false),
        (new_list_id, 'Visit the Pondicherry Museum', 10, 'easy', false),
        (new_list_id, 'Take a bike ride to the nearby villages', 30, 'medium', false);

    -- =============================================
    -- LIST 4: CHENNAI BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Chennai Bucket List',
        'Explore the Gateway to South India',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Relax on Marina Beach', 10, 'easy', false),
        (new_list_id, 'Explore Fort St. George', 30, 'medium', false),
        (new_list_id, 'Visit the Kapaleeshwarar Temple', 10, 'easy', false),
        (new_list_id, 'Go on a heritage walk at Mylapore', 30, 'medium', false),
        (new_list_id, 'Shop at Parrys Corner', 10, 'easy', false),
        (new_list_id, 'Learn about South Indian culture at Dakshinachitra', 30, 'medium', false),
        (new_list_id, 'See a Bharatnatyam performance', 30, 'medium', false),
        (new_list_id, 'Take a day trip to Mahabalipuram', 50, 'hard', false),
        (new_list_id, 'Go birdwatching at Pulicat Lake', 30, 'medium', false),
        (new_list_id, 'Visit the Government Museum', 10, 'easy', false),
        (new_list_id, 'Take a cooking class', 30, 'medium', false),
        (new_list_id, 'Have a filter coffee at a local cafe', 10, 'easy', false),
        (new_list_id, 'See a cricket match at the MA Chidambaram Stadium', 30, 'medium', false),
        (new_list_id, 'Relax at Elliot''s Beach', 10, 'easy', false),
        (new_list_id, 'Enjoy the nightlife in Adyar', 30, 'medium', false);

    -- =============================================
    -- LIST 5: MYSORE BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Mysore Bucket List',
        'Experience the City of Palaces',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Explore the Mysore Palace', 30, 'medium', false),
        (new_list_id, 'Visit the Jaganmohan Palace', 30, 'medium', false),
        (new_list_id, 'Walk through the Jayalakshmi Vilas Mansion', 10, 'easy', false),
        (new_list_id, 'Attend a yoga session at the Ashtanga Yoga Institute', 30, 'medium', false),
        (new_list_id, 'Take a meditation session at a serene ashram', 30, 'medium', false),
        (new_list_id, 'Try the Mysore Masala Dosa at a local eatery', 10, 'easy', false),
        (new_list_id, 'Indulge in Mysore Pak at a traditional sweet shop', 10, 'easy', false),
        (new_list_id, 'Take a scenic drive to the Chamundeshwari Hills', 30, 'medium', false),
        (new_list_id, 'Visit the Brindavan Gardens', 10, 'easy', false),
        (new_list_id, 'Go on a trek to the nearby Western Ghats', 50, 'hard', false),
        (new_list_id, 'Attend the Mysore Dasara Festival', 50, 'hard', false),
        (new_list_id, 'Visit the Mysore University Campus', 10, 'easy', false),
        (new_list_id, 'Explore the Devaraja Market', 10, 'easy', false),
        (new_list_id, 'Browse through the Chamarajendra Academy of Visual Arts', 10, 'easy', false),
        (new_list_id, 'Watch a movie at a traditional cinema hall', 10, 'easy', false);

    -- =============================================
    -- LIST 6: SPITI VALLEY BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Spiti Valley Bucket List',
        'Adventure in the Middle Land',
        'adventures',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Visit Key Monastery', 30, 'medium', false),
        (new_list_id, 'Explore the town of Kaza', 30, 'medium', false),
        (new_list_id, 'Trek to Chandratal Lake', 50, 'hard', false),
        (new_list_id, 'Discover the ancient Tabo Monastery', 30, 'medium', false),
        (new_list_id, 'Explore the village of Hikkim', 30, 'medium', false),
        (new_list_id, 'Visit the beautiful Kibber Village', 30, 'medium', false),
        (new_list_id, 'Trek to Langza and see the Buddha statue', 50, 'hard', false),
        (new_list_id, 'Experience the beauty of Dhankar Monastery', 30, 'medium', false),
        (new_list_id, 'Go camping near Chandratal Lake', 50, 'hard', false),
        (new_list_id, 'Visit the picturesque village of Komic', 30, 'medium', false),
        (new_list_id, 'Explore the stunning Pin Valley National Park', 50, 'hard', false),
        (new_list_id, 'Enjoy a homestay with locals in Mudh Village', 30, 'medium', false),
        (new_list_id, 'Visit the ancient monastery in Lhalung', 30, 'medium', false),
        (new_list_id, 'Take a scenic drive to Losar', 30, 'medium', false),
        (new_list_id, 'Explore the breathtaking landscapes of Spiti River', 30, 'medium', false);

    -- =============================================
    -- LIST 7: LADAKH BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Ladakh Bucket List',
        'Journey to the Land of High Passes',
        'adventures',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Pangong Lake: Visit this stunning blue lake', 50, 'hard', false),
        (new_list_id, 'Nubra Valley: Explore sand dunes and ride camels', 50, 'hard', false),
        (new_list_id, 'Leh Palace: Discover ancient Tibetan architecture', 30, 'medium', false),
        (new_list_id, 'Hemis Monastery: Experience Buddhist culture', 30, 'medium', false),
        (new_list_id, 'Thiksey Monastery: See a large Maitreya Buddha statue', 30, 'medium', false),
        (new_list_id, 'Khardung La Pass: Enjoy views from one of the world''s highest motorable passes', 50, 'hard', false),
        (new_list_id, 'Tso Moriri Lake: Witness serene high-altitude beauty', 50, 'hard', false),
        (new_list_id, 'Diskit Monastery: Visit the oldest monastery in Nubra Valley', 30, 'medium', false),
        (new_list_id, 'Magnetic Hill: Experience the optical illusion', 10, 'easy', false),
        (new_list_id, 'Lamayuru Monastery: Explore a mystical moonland landscape', 30, 'medium', false),
        (new_list_id, 'Chang La Pass: Visit another high-altitude pass', 50, 'hard', false),
        (new_list_id, 'Zanskar Valley: Trek and explore remote villages', 50, 'hard', false),
        (new_list_id, 'Alchi Monastery: See ancient murals and sculptures', 30, 'medium', false),
        (new_list_id, 'Rafting on the Zanskar River: Enjoy thrilling river adventures', 50, 'hard', false),
        (new_list_id, 'Local Markets: Shop for unique handicrafts and souvenirs', 10, 'easy', false);

    -- =============================================
    -- LIST 8: DARJEELING BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Darjeeling Bucket List',
        'Queen of the Hills',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Tiger Hill: Watch the sunrise over Kanchenjunga', 30, 'medium', false),
        (new_list_id, 'Darjeeling Himalayan Railway: Ride the famous Toy Train', 30, 'medium', false),
        (new_list_id, 'Batasia Loop: Visit the war memorial and enjoy scenic views', 10, 'easy', false),
        (new_list_id, 'Padmaja Naidu Himalayan Zoological Park: See rare Himalayan animals', 10, 'easy', false),
        (new_list_id, 'Himalayan Mountaineering Institute: Explore mountaineering history and exhibits', 30, 'medium', false),
        (new_list_id, 'Tea Gardens: Tour the famous tea plantations', 10, 'easy', false),
        (new_list_id, 'Japanese Peace Pagoda: Enjoy peace and panoramic views', 10, 'easy', false),
        (new_list_id, 'Observatory Hill: Visit the sacred Mahakal Temple', 30, 'medium', false),
        (new_list_id, 'Darjeeling Mall (Chowrasta): Relax and shop at the town square', 10, 'easy', false),
        (new_list_id, 'Ghoom Monastery: Visit one of the oldest Tibetan monasteries', 30, 'medium', false),
        (new_list_id, 'Rock Garden: Enjoy waterfalls and landscaped gardens', 10, 'easy', false),
        (new_list_id, 'Tenzing Rock: Try rock climbing', 50, 'hard', false),
        (new_list_id, 'Happy Valley Tea Estate: Tour and taste fresh Darjeeling tea', 10, 'easy', false),
        (new_list_id, 'Singalila National Park: Trek and spot rare red pandas', 50, 'hard', false),
        (new_list_id, 'Local Cuisine: Try Momos, Thukpa, and other local delicacies', 10, 'easy', false);

    -- =============================================
    -- LIST 9: AGRA BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Agra Bucket List',
        'Home of the Taj Mahal',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Watch the sunrise at the Taj Mahal', 30, 'medium', false),
        (new_list_id, 'Take a guided tour of the Taj Mahal', 30, 'medium', false),
        (new_list_id, 'Visit the Taj Mahal at night', 30, 'medium', false),
        (new_list_id, 'Explore the Agra Fort', 30, 'medium', false),
        (new_list_id, 'Visit the Itmad-ud-Daulah Tomb', 30, 'medium', false),
        (new_list_id, 'Explore Akbar''s Mausoleum', 30, 'medium', false),
        (new_list_id, 'Try the famous Agra Ka Petha', 10, 'easy', false),
        (new_list_id, 'Savor the local street food', 10, 'easy', false),
        (new_list_id, 'Visit Agra''s oldest cafe', 10, 'easy', false),
        (new_list_id, 'Visit the Keoladeo National Park', 30, 'medium', false),
        (new_list_id, 'Visit Fatehpur Sikri', 30, 'medium', false),
        (new_list_id, 'Explore the Sur Sarovar Bird Sanctuary', 30, 'medium', false),
        (new_list_id, 'Visit Mathura and Vrindavan', 30, 'medium', false),
        (new_list_id, 'Take a day trip to the Bateshwar Temple', 30, 'medium', false),
        (new_list_id, 'Go on a yoga tour', 30, 'medium', false);

    -- =============================================
    -- LIST 10: HYDERABAD BUCKET LIST
    -- =============================================
    INSERT INTO public.bucket_lists (user_id, name, description, category, is_public, follower_count)
    VALUES (
        target_user_id,
        'Hyderabad Bucket List',
        'City of Pearls and Biryani',
        'places',
        true,
        0
    )
    RETURNING id INTO new_list_id;

    INSERT INTO public.bucket_items (bucket_list_id, title, points, difficulty, completed)
    VALUES
        (new_list_id, 'Immerse yourself in history at the Charminar', 30, 'medium', false),
        (new_list_id, 'Explore the Golconda Fort', 30, 'medium', false),
        (new_list_id, 'Be amazed by the architectural beauty of the Chowmahalla Palace', 30, 'medium', false),
        (new_list_id, 'Learn about the rich heritage of Hyderabad at the Salar Jung Museum', 30, 'medium', false),
        (new_list_id, 'Hunt for treasures at Laad Bazaar', 10, 'easy', false),
        (new_list_id, 'Go on a wildlife adventure at the Nehru Zoological Park', 30, 'medium', false),
        (new_list_id, 'Take a boat ride on Hussain Sagar Lake', 10, 'easy', false),
        (new_list_id, 'See a spectacular light and sound show at the Chowmahalla Palace', 30, 'medium', false),
        (new_list_id, 'Enjoy a delicious Hyderabadi Biryani', 10, 'easy', false),
        (new_list_id, 'Watch a Tollywood movie', 10, 'easy', false),
        (new_list_id, 'Learn about the Nizams at the Nizams Museum', 30, 'medium', false),
        (new_list_id, 'Visit the Mecca Masjid', 10, 'easy', false),
        (new_list_id, 'Have a picnic at Lumbini Park', 10, 'easy', false),
        (new_list_id, 'Go shopping at the upscale malls in Hyderabad', 10, 'easy', false),
        (new_list_id, 'Take a day trip to Ramoji Film City', 30, 'medium', false);

END $$;
