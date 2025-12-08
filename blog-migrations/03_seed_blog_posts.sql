-- Seed blog posts
-- Note: Replace 'YOUR_ADMIN_USER_ID' with your actual admin user ID from Supabase

-- Post 1: What is 75 Hard? Complete Beginner's Guide
INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    category,
    tags,
    author_id,
    status,
    published_at,
    reading_time_minutes,
    meta_title,
    meta_description,
    is_featured
) VALUES (
    'What is 75 Hard? Complete Beginner''s Guide',
    'what-is-75-hard-complete-beginners-guide',
    'A transformative 75-day mental toughness challenge combining fitness, nutrition, and personal development. No excuses, no exceptions.',
    E'# What is 75 Hard?\n\nThe 75 Hard program is a transformative mental toughness challenge created by entrepreneur Andy Frisella. It''s not just another fitness program - it''s a comprehensive mental and physical transformation that tests your discipline, consistency, and willpower over 75 consecutive days.\n\n## The 5 Daily Tasks\n\nTo complete 75 Hard, you must complete these 5 tasks EVERY SINGLE DAY for 75 days:\n\n### 1. Follow a Diet\nChoose any diet plan (keto, paleo, vegan, etc.) and stick to it with ZERO cheat meals or alcohol. The key is consistency and discipline.\n\n### 2. Two 45-Minute Workouts\nComplete two separate 45-minute workouts per day. One MUST be outdoors, regardless of weather conditions. This builds mental toughness.\n\n### 3. Drink a Gallon of Water\nConsume one gallon (128 oz) of water daily. This keeps you hydrated and helps with recovery and mental clarity.\n\n### 4. Read 10 Pages\nRead 10 pages of a non-fiction, personal development book. Audiobooks don''t count - this is about focused reading.\n\n### 5. Take a Progress Photo\nDocument your journey with a daily progress photo. This creates accountability and lets you see your transformation.\n\n## The Catch: No Exceptions\n\nIf you miss ANY task on ANY day, you must start over from Day 1. There are no exceptions, no excuses. This is what makes 75 Hard a true test of mental toughness.\n\n## Benefits of 75 Hard\n\n- **Mental Toughness**: Build unshakeable discipline and willpower\n- **Physical Transformation**: See significant changes in your body composition\n- **Habit Formation**: Develop lasting healthy habits\n- **Confidence**: Prove to yourself you can do hard things\n- **Clarity**: Gain mental clarity through consistent routines\n\n## Is 75 Hard Right for You?\n\n75 Hard is intense and demanding. It requires:\n- 3+ hours of daily commitment\n- Strong initial fitness base\n- Mental readiness for a challenge\n- Support system to help you succeed\n\nIf you''re ready to transform your life and prove your mental toughness, 75 Hard might be the challenge you need.\n\n## Tips for Success\n\n1. **Plan Ahead**: Schedule your workouts and reading time\n2. **Prep Your Meals**: Meal prep makes diet adherence easier\n3. **Track Everything**: Use a checklist or app to track daily tasks\n4. **Find Accountability**: Join a 75 Hard community or find a partner\n5. **Embrace the Suck**: Accept that it will be hard - that''s the point\n\n## Conclusion\n\n75 Hard isn''t about getting a beach body or losing weight - it''s about building mental toughness that carries over into every area of your life. If you''re ready to challenge yourself and discover what you''re truly capable of, start your 75 Hard journey today.\n\nRemember: The program is called 75 HARD, not 75 Easy. Embrace the challenge!',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=675&fit=crop',
    'guide',
    ARRAY['fitness', 'challenge', 'mental-toughness', 'self-improvement'],
    'user_33vYkyYitERmEBTUVSfYqPNXb71',
    'published',
    NOW(),
    8,
    'What is 75 Hard? Complete Beginner''s Guide to Mental Toughness',
    'Everything you need to know about the 75 Hard challenge - rules, benefits, tips for success, and how to build unshakeable mental toughness.',
    true
);

-- Post 2: Dopamine Detox: Science-Backed Brain Reset
INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    category,
    tags,
    author_id,
    status,
    published_at,
    reading_time_minutes,
    meta_title,
    meta_description,
    is_featured
) VALUES (
    'Dopamine Detox: Science-Backed Brain Reset',
    'dopamine-detox-science-backed-brain-reset',
    'Reset your brain''s reward system and break free from digital addiction. Science-backed strategies to boost motivation and focus.',
    E'# Dopamine Detox: Reset Your Brain''s Reward System\n\nFeeling unmotivated? Constantly scrolling social media? Struggling to focus? You might be experiencing dopamine dysregulation. A dopamine detox can help reset your brain''s reward system and restore your natural motivation.\n\n## What is Dopamine?\n\nDopamine is a neurotransmitter that plays a crucial role in motivation, pleasure, and reward. It''s released when you:\n- Eat delicious food\n- Achieve a goal\n- Receive social validation\n- Experience something novel or exciting\n\n## The Problem: Overstimulation\n\nModern life bombards us with dopamine-triggering activities:\n- Social media notifications\n- Video games\n- Junk food\n- Online shopping\n- Pornography\n- Binge-watching shows\n\nThis constant overstimulation can lead to:\n- Decreased sensitivity to dopamine\n- Reduced motivation for "normal" activities\n- Difficulty focusing\n- Anxiety and depression\n- Addiction-like behaviors\n\n## What is a Dopamine Detox?\n\nA dopamine detox (or "dopamine fast") involves temporarily removing high-dopamine activities from your life to reset your brain''s reward system. This isn''t about eliminating dopamine - that''s impossible and unhealthy. It''s about reducing overstimulation.\n\n## How to Do a Dopamine Detox\n\n### Level 1: Light Detox (1 Day)\n\nAvoid these high-dopamine activities for 24 hours:\n- Social media\n- Video games\n- TV/streaming\n- Junk food\n- Shopping\n- Internet browsing\n\nAllowed activities:\n- Walking\n- Meditation\n- Reading\n- Journaling\n- Light exercise\n- Cooking healthy meals\n\n### Level 2: Moderate Detox (3-7 Days)\n\nSame as Level 1, but for an extended period. This allows deeper reset and habit formation.\n\n### Level 3: Intensive Detox (30 Days)\n\nCommit to 30 days of reduced stimulation. This can create lasting changes in your brain chemistry and habits.\n\n## The Science Behind It\n\nResearch shows that:\n- Dopamine receptors can upregulate (become more sensitive) with reduced stimulation\n- Breaking addiction patterns requires 21-30 days of abstinence\n- Mindfulness practices increase baseline dopamine levels\n- Regular exercise naturally boosts dopamine production\n\n## Benefits You''ll Experience\n\n1. **Increased Motivation**: Everyday tasks become more rewarding\n2. **Better Focus**: Improved ability to concentrate on important work\n3. **Enhanced Mood**: More stable emotional state\n4. **Improved Sleep**: Better sleep quality and consistency\n5. **Greater Appreciation**: Increased enjoyment of simple pleasures\n6. **Reduced Anxiety**: Less dependence on external validation\n\n## Tips for Success\n\n### Before You Start\n- Choose a specific timeframe (1, 7, or 30 days)\n- Inform friends and family\n- Remove temptations (delete apps, hide devices)\n- Plan replacement activities\n\n### During the Detox\n- Embrace boredom - it''s part of the process\n- Journal your experiences and feelings\n- Practice mindfulness meditation\n- Spend time in nature\n- Focus on productive activities\n\n### After the Detox\n- Reintroduce activities mindfully\n- Set boundaries (e.g., 30 min social media daily)\n- Maintain some detox practices\n- Regular "mini-detoxes" (one day per week)\n\n## Common Challenges\n\n**Withdrawal Symptoms**: You may experience irritability, restlessness, or anxiety initially. This is normal and typically passes within 2-3 days.\n\n**Social Pressure**: Friends may not understand. Explain your goals and ask for support.\n\n**Boredom**: This is actually the goal! Boredom drives creativity and self-reflection.\n\n## Sustainable Lifestyle Changes\n\nA dopamine detox isn''t a one-time fix. Use it as a reset, then implement sustainable changes:\n\n- **Digital Boundaries**: Set specific times for social media\n- **Mindful Consumption**: Be intentional about entertainment\n- **Regular Exercise**: Natural dopamine boost\n- **Quality Sleep**: Essential for dopamine regulation\n- **Meaningful Goals**: Pursue long-term rewards\n\n## Conclusion\n\nA dopamine detox is a powerful tool for resetting your brain''s reward system and breaking free from the cycle of instant gratification. By temporarily removing overstimulating activities, you can restore your natural motivation, improve focus, and rediscover joy in simple pleasures.\n\nStart with a 24-hour detox and see how you feel. Your brain will thank you!',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=675&fit=crop',
    'how-to',
    ARRAY['mental-health', 'productivity', 'wellness', 'self-improvement'],
    'user_33vYkyYitERmEBTUVSfYqPNXb71',
    'published',
    NOW() - INTERVAL '3 days',
    7,
    'Dopamine Detox: Science-Backed Guide to Reset Your Brain',
    'Complete guide to dopamine detox - learn the science, benefits, and step-by-step process to reset your brain''s reward system and boost motivation.',
    true
);

-- Post 3: How to Read 52 Books in a Year
INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    category,
    tags,
    author_id,
    status,
    published_at,
    reading_time_minutes,
    meta_title,
    meta_description,
    is_featured
) VALUES (
    'How to Read 52 Books in a Year',
    'how-to-read-52-books-in-a-year',
    'Practical strategies to read one book per week. Transform your reading habits and finish 52 books annually with just 30 minutes daily.',
    E'# How to Read 52 Books in a Year\n\nReading 52 books in a year - one book per week - might seem impossible with your busy schedule. But with the right strategies and mindset, it''s not only achievable but can become one of the most rewarding habits you develop.\n\n## The Math: Is It Really Possible?\n\nLet''s break it down:\n- Average book: 250-300 pages\n- Average reading speed: 200-250 words per minute\n- Average time per book: 6-8 hours\n- **Daily reading needed: 30-45 minutes**\n\nThat''s it! Just 30-45 minutes of focused reading daily gets you to 52 books per year.\n\n## Strategy 1: Make Reading a Priority\n\n### Schedule It\nTreat reading like any other important appointment. Block out specific times:\n- Morning: 15 minutes with coffee\n- Lunch break: 15 minutes\n- Before bed: 15-30 minutes\n\n### Create a Reading Environment\n- Designate a comfortable reading spot\n- Keep books visible and accessible\n- Minimize distractions (phone away!)\n- Good lighting is essential\n\n## Strategy 2: Optimize Your Reading Time\n\n### Identify Dead Time\nReplace low-value activities with reading:\n- Waiting in line\n- Commuting (if not driving)\n- Waiting for appointments\n- During lunch breaks\n- While exercising (audiobooks)\n\n### The 5-Minute Rule\nAlways carry a book or e-reader. Even 5 minutes of reading adds up:\n- 5 minutes × 6 times daily = 30 minutes\n- 30 minutes daily = 1 book per week\n\n## Strategy 3: Choose Books Wisely\n\n### Mix It Up\nDon''t force yourself through books you hate:\n- **70% Interest**: Books you''re genuinely excited about\n- **20% Growth**: Challenging books that expand your knowledge\n- **10% Light**: Easy, fun reads for when you''re tired\n\n### The 50-Page Rule\nIf you''re not engaged after 50 pages, it''s okay to quit. Life''s too short for boring books.\n\n### Vary Length and Difficulty\n- Short books (150-200 pages) for busy weeks\n- Longer books (400+ pages) when you have more time\n- Mix fiction and non-fiction\n\n## Strategy 4: Use Technology\n\n### E-Readers and Apps\n- **Kindle**: Sync across devices, read anywhere\n- **Goodreads**: Track progress, find recommendations\n- **Libby**: Free library books on your phone\n\n### Audiobooks\nDouble your reading with audiobooks:\n- While commuting\n- During workouts\n- While doing chores\n- Walking the dog\n\n**Pro tip**: Set playback speed to 1.25x or 1.5x to finish faster.\n\n## Strategy 5: Build Reading Habits\n\n### Start Small\nDon''t jump to 52 books immediately:\n- Month 1: 2 books (establish habit)\n- Month 2: 3 books (build momentum)\n- Month 3: 4 books (reach target pace)\n\n### Chain Your Habits\nAttach reading to existing habits:\n- After morning coffee → read 15 minutes\n- Before bed → read 30 minutes\n- During lunch → read 10 minutes\n\n### Track Your Progress\n- Use Goodreads Reading Challenge\n- Keep a reading journal\n- Share progress with friends\n- Celebrate milestones (every 10 books)\n\n## Strategy 6: Eliminate Obstacles\n\n### Common Excuses and Solutions\n\n**"I''m too tired"**\n- Read easier books when tired\n- Try audiobooks\n- Read in the morning instead\n\n**"I don''t have time"**\n- Track your screen time - replace 30 min of scrolling\n- Wake up 30 minutes earlier\n- Use dead time effectively\n\n**"I can''t focus"**\n- Start with just 5 minutes\n- Remove distractions\n- Try different genres\n- Take notes while reading\n\n**"Books are expensive"**\n- Use your local library\n- Try Libby or OverDrive apps\n- Buy used books\n- Book swaps with friends\n\n## Strategy 7: Make It Social\n\n### Join a Book Club\n- Accountability and motivation\n- Diverse book selections\n- Deeper discussions\n\n### Share Your Journey\n- Post reviews on Goodreads\n- Share quotes on social media\n- Discuss books with friends\n- Start a reading challenge with others\n\n## Advanced Tips\n\n### Speed Reading Techniques\n- Minimize subvocalization (saying words in your head)\n- Use a pointer (finger or pen) to guide eyes\n- Read in chunks, not word-by-word\n- Practice regularly\n\n### Strategic Skimming\nFor non-fiction:\n- Read introduction and conclusion first\n- Skim chapters, focus on key sections\n- Take notes on main ideas\n- Skip redundant examples\n\n### The Two-Book Method\n- One physical book for home\n- One audiobook for commute/exercise\n- Finish 2 books simultaneously\n\n## Monthly Reading Plan\n\n### Week 1: Fiction (Light)\nStart the month with an engaging, easy read to build momentum.\n\n### Week 2: Non-Fiction (Growth)\nTackle something educational or challenging.\n\n### Week 3: Your Choice\nRead whatever you''re most excited about.\n\n### Week 4: Short Book\nEnd the month with a quick win (200 pages or less).\n\n## Tracking Your Progress\n\n### Create a Reading Spreadsheet\nTrack:\n- Book title and author\n- Pages\n- Start and finish dates\n- Rating (1-5 stars)\n- Key takeaways\n\n### Visual Progress\n- Reading jar (add a marble per book)\n- Wall chart\n- Goodreads progress bar\n- Instagram reading account\n\n## What to Read\n\n### Build Your Reading List\n- **Classics**: Timeless literature\n- **Bestsellers**: Current popular books\n- **Recommendations**: From friends, podcasts, blogs\n- **Award Winners**: Pulitzer, Nobel, Booker prizes\n- **Personal Interest**: Your hobbies and passions\n\n### Diversify Your Reading\n- Different genres\n- Various time periods\n- Diverse authors\n- Multiple perspectives\n\n## Conclusion\n\nReading 52 books in a year is absolutely achievable with:\n1. **Consistency**: 30-45 minutes daily\n2. **Strategy**: Smart book choices and time management\n3. **Flexibility**: Mix formats (physical, e-books, audio)\n4. **Accountability**: Track progress and share your journey\n\nRemember: The goal isn''t just to hit 52 books - it''s to develop a sustainable reading habit that enriches your life. Start today with just 15 minutes, and watch your reading life transform.\n\nHappy reading! 📚',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=675&fit=crop',
    'how-to',
    ARRAY['reading', 'productivity', 'self-improvement', 'habits'],
    'user_33vYkyYitERmEBTUVSfYqPNXb71',
    'published',
    NOW() - INTERVAL '7 days',
    9,
    'How to Read 52 Books in a Year: Complete Guide',
    'Proven strategies to read one book per week. Learn practical techniques, time management tips, and habit-building methods to read 52 books annually.',
    false
);
