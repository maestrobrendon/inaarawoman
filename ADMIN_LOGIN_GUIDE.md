# Admin Login System Guide

## Overview
The admin login system provides secure access to the admin dashboard where you can manage products, orders, customers, collections, and site settings.

## Accessing the Admin Panel

### Step 1: Navigate to Admin Login
There are two ways to access the admin login page:

1. **From the Footer** (Recommended):
   - Scroll to the bottom of any page on the website
   - Look for the "Admin Login" button in the footer (dark button with shield icon)
   - Click the "Admin Login" button

2. **Direct URL**:
   - Navigate directly to: `https://your-domain.com/admin/login`

### Step 2: Login Interface
You'll see a clean login interface with:
- **Email Address** field
- **Password** field
- **Sign In** button

**Note**: There is NO signup button. Admin accounts must be created directly in the database for security purposes.

### Step 3: Enter Credentials
Enter your admin credentials:
- **Email**: maestrobrendon@gmail.com
- **Password**: [Your password set in Supabase Auth]

### Step 4: Access Dashboard
After successful login, you'll be automatically redirected to the admin dashboard at `/admin`

## Authentication System Details

### Technology Stack
- **Frontend**: React with React Router
- **Authentication**: Supabase Auth (email/password)
- **Database**: Supabase PostgreSQL

### Security Features
1. **Protected Routes**: All admin pages require authentication
2. **Session Management**: Automatic session handling with Supabase
3. **Admin Verification**: Checks both Supabase Auth AND admin_users table
4. **Secure Password Storage**: Passwords hashed by Supabase Auth
5. **Active Status Check**: Only active admin accounts can login

### Authentication Flow
1. User enters email and password
2. Supabase Auth validates credentials
3. System checks if user exists in `admin_users` table
4. System verifies `is_active = true`
5. If all checks pass, user gets access to dashboard
6. If any check fails, login is denied with error message

## Admin User Management

### Current Admin Account
- **Email**: maestrobrendon@gmail.com
- **Role**: super_admin
- **Status**: Active

### Creating New Admin Users

To create a new admin user, follow these steps:

#### Step 1: Create User in Supabase Auth
```sql
-- This should be done in Supabase Dashboard > Authentication > Users
-- Or use Supabase Auth API
```

#### Step 2: Add User to admin_users Table
```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'USER_ID_FROM_AUTH',  -- UUID from auth.users
  'newadmin@example.com',
  'Admin Full Name',
  'admin',
  true
);
```

### Admin Roles
- **super_admin**: Full access to all features
- **admin**: Standard admin access
- **manager**: Limited management access

## Troubleshooting

### "Invalid email or password" Error
- Verify email is correct (check for typos)
- Verify password is correct
- Check if user exists in Supabase Auth

### Login Successful But No Dashboard Access
- Check if user exists in `admin_users` table
- Verify `is_active = true` in admin_users table
- Check if user ID matches between auth.users and admin_users

### Session Expired
- Simply login again at `/admin/login`
- Sessions are managed automatically by Supabase

### Forgot Password
Currently, password reset must be done through:
1. Supabase Dashboard > Authentication > Users
2. Or implement password reset flow (future enhancement)

## Database Schema

### admin_users Table
```sql
- id (uuid, primary key) - Must match auth.users.id
- email (text, not null)
- full_name (text, not null)
- role (text, not null)
- permissions (jsonb, nullable)
- is_active (boolean, default true)
- last_login (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

## Security Best Practices

1. **Never Share Admin Credentials**: Each admin should have their own account
2. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, and symbols
3. **Regular Password Changes**: Change passwords every 90 days
4. **Monitor Login Activity**: Check last_login field regularly
5. **Deactivate Unused Accounts**: Set is_active = false instead of deleting
6. **Limit Super Admin Access**: Only give super_admin role when necessary

## Features Available in Admin Dashboard

After login, admins can access:

1. **Dashboard**: Overview of store statistics
2. **Products**:
   - View all products
   - Add new products
   - Edit existing products
   - Manage product images
   - Set homepage visibility
3. **Orders**:
   - View all orders
   - Update order status
   - Process payments
4. **Customers**:
   - View customer list
   - View customer details
   - View customer order history
5. **Collections**:
   - Create collections
   - Edit collections
   - Manage collection products
6. **Homepage**:
   - Manage featured products
   - Configure homepage sections
7. **Settings**:
   - Site configuration
   - Admin preferences

## Logout

To logout:
1. Navigate to any admin page
2. Look for the logout button in the admin header
3. Click logout to end your session
4. You'll be redirected to the login page

## Support

For technical issues or questions about the admin system:
- Check this documentation first
- Review Supabase logs for authentication errors
- Check browser console for frontend errors
- Verify database connection and table structure
