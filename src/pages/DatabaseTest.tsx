import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DatabaseTest = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products from database...");
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10);

        if (error) {
          console.error("Error fetching products:", error);
          setError(error.message);
        } else {
          console.log("Products fetched:", data);
          setProducts(data);
        }
      } catch (err) {
        console.error("Exception fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Database Test</h1>
        
        {loading && (
          <div className="text-center py-8">
            <p>Loading products...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Products Found: {products.length}</h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border p-4 rounded-lg">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Slug: {product.slug}</p>
                    <p className="text-sm text-muted-foreground">Category ID: {product.category_id}</p>
                    <p className="text-sm text-muted-foreground">Price: {product.price}</p>
                    <p className="text-sm text-muted-foreground">In Stock: {product.in_stock ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No products found in database.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8">
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DatabaseTest;