# Quick Admin Login Test Guide

## How to Test the Admin Login System

### Test 1: Navigate to Admin Login from Footer
1. Open the website in your browser
2. Scroll to the bottom of any page
3. Look for the dark "Admin Login" button with shield icon in the footer
4. Click the button
5. ✅ **Expected Result**: You should be redirected to `/admin/login` page

### Test 2: Login Interface Display
1. On the `/admin/login` page, verify you see:
   - Lock icon in a golden circle
   - "Admin Dashboard" heading
   - "Sign in to manage your store" subtitle
   - Email address input field with mail icon
   - Password input field with lock icon
   - "Sign In" button (full width)
   - Footer text: "Protected admin area. Unauthorized access is prohibited."
2. ✅ **Expected Result**: Clean, professional login interface with amber/golden accent colors

### Test 3: Login with Valid Credentials
1. Enter email: `maestrobrendon@gmail.com`
2. Enter your password (set in Supabase)
3. Click "Sign In" button
4. ✅ **Expected Result**:
   - Button shows "Signing in..." while processing
   - After successful login, redirect to `/admin` dashboard
   - Dashboard loads with navigation sidebar and admin content

### Test 4: Login with Invalid Credentials
1. Enter email: `wrong@email.com`
2. Enter password: `wrongpassword`
3. Click "Sign In"
4. ✅ **Expected Result**:
   - Red error message appears at top of form
   - Message says "Invalid email or password" or similar
   - User stays on login page

### Test 5: Protected Route Access (Logged Out)
1. Make sure you're logged out
2. Try to access: `/admin` or `/admin/products` directly
3. ✅ **Expected Result**:
   - Automatically redirected to `/admin/login`
   - No error, just clean redirect

### Test 6: Protected Route Access (Logged In)
1. Login successfully
2. Try to access various admin routes:
   - `/admin` - Dashboard
   - `/admin/products` - Products list
   - `/admin/orders` - Orders list
   - `/admin/customers` - Customers list
   - `/admin/collections` - Collections list
3. ✅ **Expected Result**:
   - All pages load successfully
   - Admin navigation visible
   - Content displays properly

### Test 7: Session Persistence
1. Login to admin
2. Navigate to `/admin/products`
3. Refresh the page (F5 or Ctrl+R)
4. ✅ **Expected Result**:
   - Page shows "Verifying authentication..." briefly
   - Then loads products page (no redirect to login)
   - Session maintained across refreshes

### Test 8: Logout Functionality
1. While logged in, look for logout option in admin interface
2. Click logout
3. ✅ **Expected Result**:
   - Logged out successfully
   - Redirected to login page or home page
   - Trying to access `/admin` now redirects to login

## Common Issues and Solutions

### Issue: Footer button doesn't work
- **Check**: Is the footer actually the EnhancedFooter component?
- **Solution**: The route is now `/admin/login` (fixed)

### Issue: Login shows "Invalid email or password"
- **Check 1**: Is the email exactly `maestrobrendon@gmail.com`?
- **Check 2**: Is the password correct in Supabase Auth?
- **Check 3**: Does the user exist in both `auth.users` AND `admin_users` tables?
- **Solution**: Verify credentials in Supabase Dashboard

### Issue: Login succeeds but still shows login page
- **Check**: Does user have `is_active = true` in admin_users table?
- **Solution**: Run SQL: `UPDATE admin_users SET is_active = true WHERE email = 'maestrobrendon@gmail.com';`

### Issue: Infinite redirect loop
- **Check**: Is the user ID in `admin_users.id` matching the ID in `auth.users.id`?
- **Solution**: They must match exactly (both are UUIDs)

### Issue: "Loading..." never finishes
- **Check browser console**: Look for JavaScript errors
- **Check Supabase logs**: Look for database connection errors
- **Solution**: Verify environment variables in `.env` file

## Admin Credentials

**Email**: maestrobrendon@gmail.com
**Password**: [Set in Supabase Auth]
**Role**: super_admin
**Status**: Active

## Quick Database Checks

### Check if admin exists and is active:
```sql
SELECT email, full_name, role, is_active
FROM admin_users
WHERE email = 'maestrobrendon@gmail.com';
```

### Check auth user ID:
```sql
SELECT id, email
FROM auth.users
WHERE email = 'maestrobrendon@gmail.com';
```

### Verify IDs match:
```sql
SELECT
  au.id as auth_id,
  ad.id as admin_id,
  au.email,
  ad.is_active
FROM auth.users au
LEFT JOIN admin_users ad ON au.id = ad.id
WHERE au.email = 'maestrobrendon@gmail.com';
```

## Success Checklist

- [ ] Admin Login button visible in footer
- [ ] Clicking button navigates to `/admin/login`
- [ ] Login page displays correctly with all elements
- [ ] Can login with valid credentials
- [ ] Redirects to `/admin` dashboard after login
- [ ] Dashboard loads with navigation and content
- [ ] Can access all admin routes when logged in
- [ ] Cannot access admin routes when logged out
- [ ] Session persists across page refreshes
- [ ] Error messages display for invalid credentials
- [ ] Loading states show during authentication

## Next Steps After Successful Login

Once logged in, you can:
1. **Manage Products**: Add, edit, delete products
2. **Process Orders**: View and update order status
3. **View Customers**: See customer information and order history
4. **Manage Collections**: Create and organize product collections
5. **Configure Homepage**: Set featured products and sections
6. **Adjust Settings**: Update site configuration

Refer to `ADMIN_LOGIN_GUIDE.md` for detailed information about each feature.
