# Storage Bucket Setup Instructions

## Issue
The Supabase Storage bucket for product images needs to be created manually due to RLS (Row Level Security) policies that prevent automatic bucket creation from the client side.

## Solution
To enable image upload functionality, the storage bucket must be created through the Supabase Dashboard:

### Steps:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **ssbeycbrkfpxqdzlzhwa**
3. Navigate to **Storage** in the left sidebar
4. Click **"Create a new bucket"**
5. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Enabled**
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/*`
6. Click **"Create bucket"**

### RLS Policies (Optional)
After creating the bucket, you can add these RLS policies for better security:

```sql
-- Allow public read access
CREATE POLICY "Allow public read access on product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated admin users to upload
CREATE POLICY "Allow admin users to upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND 
      (user_profiles.email LIKE '%admin%' OR user_profiles.role = 'admin')
    )
  );
```

### Alternative Solutions
Until the storage bucket is set up, users can:
1. **Select from Assets folder** - Use existing images from the assets collection
2. **Use external URLs** - Enter direct image URLs from other services
3. **Upload temporarily** - Files will be stored as blob URLs (temporary, not persistent)

## Testing
After creating the bucket, test image upload functionality in `/admin/products`.