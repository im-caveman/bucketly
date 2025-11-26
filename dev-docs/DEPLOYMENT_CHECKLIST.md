# 🚀 Deployment Checklist

## Pre-Deployment

### Database Migrations
- [ ] Migration files created
  - [ ] `20240112000000_add_social_links.sql`
  - [ ] `20240113000000_add_user_follows.sql`
- [ ] Migrations applied to database
- [ ] Verified new columns exist in `profiles` table
- [ ] Verified `user_follows` table created
- [ ] Verified triggers created
- [ ] Verified RLS policies enabled

### Code Changes
- [ ] All TypeScript files compile without errors
- [ ] No ESLint warnings
- [ ] Types updated in `types/supabase.ts`
- [ ] All imports resolved correctly
- [ ] No console errors in browser

### Component Testing
- [ ] UserPreviewModal renders correctly
- [ ] Hover preview appears on leaderboard
- [ ] Follow button works
- [ ] Social icons display correctly
- [ ] Links open in new tab

## Functional Testing

### Social Links Feature
- [ ] Navigate to Settings page
- [ ] Add Twitter URL → Save → Verify saved
- [ ] Add Instagram URL → Save → Verify saved
- [ ] Add LinkedIn URL → Save → Verify saved
- [ ] Add GitHub URL → Save → Verify saved
- [ ] Add Website URL → Save → Verify saved
- [ ] Navigate to Account page
- [ ] Verify social icons appear in sidebar
- [ ] Click each icon → Opens correct URL in new tab
- [ ] Hover over leaderboard user
- [ ] Verify social icons appear in preview modal

### Follow System
- [ ] Create two test accounts (User A, User B)
- [ ] Login as User A
- [ ] Navigate to Leaderboard
- [ ] Hover over User B
- [ ] Click "Follow" button
- [ ] Verify button changes to "Unfollow"
- [ ] Login as User B
- [ ] Check notifications
- [ ] Verify "User A followed you" notification exists
- [ ] Complete a bucket list item as User B
- [ ] Login as User A
- [ ] Check notifications
- [ ] Verify "User B completed..." notification exists

### Hover Preview Modal
- [ ] Navigate to Leaderboard
- [ ] Hover over user #1
- [ ] Verify preview modal appears
- [ ] Verify avatar displays correctly
- [ ] Verify username displays correctly
- [ ] Verify bio displays (if exists)
- [ ] Verify stats show correct numbers
- [ ] Verify social icons appear (if user has links)
- [ ] Verify follow button appears (if not own profile)
- [ ] Click avatar → Navigates to profile page
- [ ] Click username → Navigates to profile page
- [ ] Click social icon → Opens in new tab
- [ ] Click follow → Toggles follow status
- [ ] Move mouse away → Modal disappears

### Account Page Performance
- [ ] Navigate to Account page
- [ ] Click on "Your Statistics" tab
- [ ] Click on "Achievements" tab
- [ ] Click back to "Your Statistics"
- [ ] Verify page does NOT reload
- [ ] Verify no flickering
- [ ] Verify data persists

## Responsive Testing

### Desktop (1920x1080)
- [ ] Leaderboard hover preview appears correctly
- [ ] Account page layout is 3 columns
- [ ] Social icons display horizontally
- [ ] All text is readable
- [ ] No overflow issues

### Tablet (768x1024)
- [ ] Leaderboard hover preview appears correctly
- [ ] Account page layout is 2 columns
- [ ] Social icons display horizontally
- [ ] All text is readable
- [ ] No overflow issues

### Mobile (375x667)
- [ ] Leaderboard tap shows preview
- [ ] Account page layout is 1 column
- [ ] Social icons wrap correctly
- [ ] All text is readable
- [ ] No horizontal scroll
- [ ] Buttons are tappable (min 44x44px)

## Browser Testing

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Hover effects smooth
- [ ] Animations work

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Hover effects smooth
- [ ] Animations work

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Hover effects smooth
- [ ] Animations work

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Hover effects smooth
- [ ] Animations work

## Security Testing

### Authentication
- [ ] Unauthenticated users cannot follow
- [ ] Unauthenticated users cannot save social links
- [ ] Users can only edit their own profile
- [ ] Users can only follow/unfollow as themselves

### Data Validation
- [ ] Invalid URLs rejected in social links
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Cannot follow self
- [ ] Cannot follow same user twice

### Privacy
- [ ] Private completions don't notify followers
- [ ] Only public profiles show in leaderboard
- [ ] Social links only visible if set
- [ ] Follow counts accurate

## Performance Testing

### Load Times
- [ ] Leaderboard loads in < 2 seconds
- [ ] Account page loads in < 1 second
- [ ] Settings page loads in < 1 second
- [ ] Hover preview appears in < 100ms

### Database Queries
- [ ] No N+1 query issues
- [ ] Indexes used correctly
- [ ] Triggers execute quickly
- [ ] No slow queries (check Supabase logs)

### Client Performance
- [ ] No memory leaks
- [ ] No excessive re-renders
- [ ] Smooth animations (60fps)
- [ ] No layout shifts

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through leaderboard entries
- [ ] Can activate hover preview with keyboard
- [ ] Can navigate within preview modal
- [ ] Can follow/unfollow with keyboard
- [ ] Can access social links with keyboard

### Screen Readers
- [ ] Avatar has alt text
- [ ] Social icons have aria-labels
- [ ] Follow button has descriptive text
- [ ] Stats have proper labels
- [ ] Links announce correctly

### Visual
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Focus indicators visible
- [ ] Text is readable at 200% zoom
- [ ] No information conveyed by color alone

## Error Handling

### Network Errors
- [ ] Graceful handling of failed follow request
- [ ] Graceful handling of failed profile update
- [ ] Retry mechanism works
- [ ] Error messages are user-friendly

### Edge Cases
- [ ] User with no social links displays correctly
- [ ] User with no bio displays correctly
- [ ] User with no followers displays correctly
- [ ] Empty leaderboard displays message
- [ ] Deleted user handled gracefully

## Documentation

- [ ] README updated with new features
- [ ] API documentation updated
- [ ] Component documentation added
- [ ] Migration guide created
- [ ] Deployment guide created

## Post-Deployment

### Monitoring
- [ ] Check Supabase logs for errors
- [ ] Monitor database performance
- [ ] Check notification delivery
- [ ] Monitor API response times

### User Feedback
- [ ] Collect user feedback on hover preview
- [ ] Collect user feedback on follow system
- [ ] Monitor support tickets
- [ ] Track feature usage analytics

### Rollback Plan
- [ ] Backup database before deployment
- [ ] Document rollback SQL commands
- [ ] Test rollback procedure
- [ ] Have rollback plan ready

## Sign-Off

- [ ] Developer tested all features
- [ ] QA approved all features
- [ ] Product owner approved design
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## Quick Test Script

Run this to quickly verify core functionality:

```bash
# 1. Check migrations
psql -h <host> -U <user> -d <db> -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name LIKE '%_url';"

# 2. Check triggers
psql -h <host> -U <user> -d <db> -c "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name LIKE '%follower%';"

# 3. Start dev server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000/leaderboard
# Hover over a user
# Verify preview appears
```

---

## Deployment Commands

```bash
# 1. Apply migrations
npx supabase db push

# 2. Build production
npm run build

# 3. Test production build
npm run start

# 4. Deploy (adjust for your platform)
vercel deploy --prod
# or
npm run deploy
```

---

## Success Criteria

✅ All checklist items completed
✅ No critical bugs found
✅ Performance benchmarks met
✅ Security review passed
✅ User acceptance testing passed
✅ Documentation complete

🎉 **Ready for Production!**
