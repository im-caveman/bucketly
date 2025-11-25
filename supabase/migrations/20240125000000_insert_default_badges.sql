-- Insert default badges
INSERT INTO badges (name, description, icon_url, criteria) VALUES
('First Steps', 'Complete your first item', 'https://ui-avatars.com/api/?name=First+Steps&background=random', '{"type": "items_completed", "threshold": 1}'),
('Social Butterfly', 'Get 100 followers', 'https://ui-avatars.com/api/?name=Social+Butterfly&background=random', '{"type": "followers", "threshold": 100}'),
('Creator', 'Create your first list', 'https://ui-avatars.com/api/?name=Creator&background=random', '{"type": "lists_created", "threshold": 1}'),
('Centurion', 'Complete 100 items', 'https://ui-avatars.com/api/?name=Centurion&background=random', '{"type": "items_completed", "threshold": 100}'),
('Globe Trotter', 'Visit 25 countries', 'https://ui-avatars.com/api/?name=Globe+Trotter&background=random', '{"type": "manual", "threshold": 0}'),
('Legend', 'Reach top 10 on leaderboard', 'https://ui-avatars.com/api/?name=Legend&background=random', '{"type": "manual", "threshold": 0}')
ON CONFLICT (name) DO NOTHING;
