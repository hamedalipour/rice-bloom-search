# Rice Bloom Search - فروشگاه برنج آنلاین

A modern e-commerce website for rice products with a comprehensive admin panel built with React, TypeScript, and Supabase.

## ✨ Features

### 🛍️ **Customer Features**
- **Product Catalog** - Browse different types of rice (Hashemi, Tarom, Fajr, Shirodi)
- **Product Details** - Detailed product pages with images, descriptions, and pricing
- **Shopping Cart** - Add/remove products with quantity management
- **User Authentication** - Login/register functionality
- **Responsive Design** - Works on desktop and mobile devices
- **Blog Section** - Read articles about rice and cooking tips

### 🎛️ **Admin Panel Features**
- **Product Management** - Full CRUD operations for products
- **Image Management** - Upload new images or select from asset library
- **Blog Management** - Create and manage blog posts
- **Order Management** - View and manage customer orders
- **Admin Authentication** - Secure admin access

## 🚀 **Tech Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database + Authentication + Storage)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel/Netlify

## 📁 **Project Structure**

```
rice-bloom-search/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── ProductForm.tsx
│   │   ├── ImageUpload.tsx
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── integrations/      # Supabase integration
│   └── assets/           # Images and static files
├── supabase/             # Database migrations
└── package.json
```

## 🛠️ **Setup Instructions**

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rice-bloom-search
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Database Setup
Run the migrations in your Supabase dashboard or using the CLI:
```bash
# If using Supabase CLI
supabase db push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🔐 **Admin Access**

For testing purposes, there's a hardcoded admin account:
- **Email**: `hamedalipour38@gmail.com`
- **Password**: `hamed69JOON`

Access the admin panel at: `/admin`

## 📊 **Database Schema**

### Products Table
- `id` (UUID) - Primary key
- `name` (TEXT) - Product name
- `slug` (TEXT) - URL-friendly name
- `price` (DECIMAL) - Product price
- `original_price` (DECIMAL) - Original price (optional)
- `image_url` (TEXT) - Product image URL
- `description` (TEXT) - Short description
- `long_description` (TEXT) - Detailed description
- `origin` (TEXT) - Product origin
- `features` (TEXT[]) - Product features array
- `weights` (JSON) - Available weights and prices
- `in_stock` (BOOLEAN) - Stock status

### User Profiles Table
- `id` (UUID) - Primary key (linked to auth.users)
- `email` (TEXT) - User email
- `role` (TEXT) - User role (admin/user)
- `first_name`, `last_name` (TEXT) - User details
- Address fields for shipping

## 🎨 **Key Components**

### ProductForm
- Multi-option image selection (upload, assets, URL)
- Form validation and error handling
- Support for both create and edit modes

### ImageUpload
- Drag & drop file upload
- Image preview and validation
- Integration with Supabase Storage

### AssetSelector
- Browse and select from pre-loaded images
- Grid view with thumbnails
- Asset preview functionality

## 🔧 **Features Implemented**

✅ **Product Management**
- Create, read, update, delete products
- Image upload and asset selection
- Form validation and error handling

✅ **User Authentication**
- Login/register functionality
- Admin role-based access control
- Protected routes for admin panel

✅ **Shopping Cart**
- Add/remove products
- Quantity management
- Persistent cart state

✅ **Responsive Design**
- Mobile-friendly interface
- Touch-optimized interactions
- Adaptive layouts

## 🐛 **Known Issues & Solutions**

### Storage Bucket Setup
If image upload fails, create the storage bucket manually in Supabase:
1. Go to Storage in Supabase Dashboard
2. Create bucket named `product-images`
3. Make it public
4. Set file size limit to 5MB

### Database Schema Correction
If you encounter column errors with blog images, it may be due to a mismatch between the expected column name and the actual database schema. The application now correctly uses `featured_image_url` as the column name for blog post images.

### Image Upload Fix
The image upload functionality has been fixed to properly upload images to Supabase Storage. Temporary blob URLs have been completely removed - all images are now permanently stored in Supabase Storage.

### Database Schema
The application is designed to work with the current database schema. If you encounter column errors, the app will gracefully handle missing fields.

## 🚀 **Deployment**

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### GitHub Pages Deployment
1. Go to your repository Settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The site will automatically deploy on every push to the main branch
5. Your site will be available at `https://[username].github.io/rice-bloom-search/`

### Manual Deployment
```bash
# Build the project
npm run build

# Upload dist/ folder to your hosting provider
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is open source and available under the MIT License.

## 📞 **Support**

For questions or issues, please create an issue in the GitHub repository.

---

**Made with ❤️ for rice lovers everywhere** 🍚