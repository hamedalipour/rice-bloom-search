import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";
import { products as sampleProducts } from "@/data/products";

type Product = Tables<"products">;
type ProductInsert = TablesInsert<"products">;
type ProductUpdate = TablesUpdate<"products">;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products from Supabase...");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // If no products found in database, use sample data
      const productsToUse =
        data && data.length > 0
          ? data
          : sampleProducts.map(
              (product) =>
                ({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  category_id: product.category,
                  price: product.price,
                  original_price: product.originalPrice || null,
                  image_url: product.image,
                  description: product.description || "توضیحی ارائه نشده",
                  long_description:
                    product.longDescription || "توضیحات کامل ارائه نشده",
                  origin: product.origin || "نامشخص",
                  features: product.features || [],
                  weights: product.weights || [],
                  rating: product.rating || 0,
                  review_count: product.reviewCount || 0,
                  in_stock:
                    product.inStock !== undefined ? product.inStock : true,
                  gallery_images: [],
                  is_featured: false,
                  meta_title: null,
                  meta_description: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }) as Product,
            );

      console.log(
        "Products fetched successfully:",
        productsToUse.length,
        "products",
      );
      setProducts(productsToUse);
      setError(null);
    } catch (err) {
      console.error("Error in fetchProducts:", err);
      // Fallback to sample data
      const fallbackProducts = sampleProducts.map(
        (product) =>
          ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            category_id: product.category,
            price: product.price,
            original_price: product.originalPrice || null,
            image_url: product.image,
            description: product.description || "توضیحی ارائه نشده",
            long_description:
              product.longDescription || "توضیحات کامل ارائه نشده",
            origin: product.origin || "نامشخص",
            features: product.features || [],
            weights: product.weights || [],
            rating: product.rating || 0,
            review_count: product.reviewCount || 0,
            in_stock: product.inStock !== undefined ? product.inStock : true,
            gallery_images: [],
            is_featured: false,
            meta_title: null,
            meta_description: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }) as Product,
      );

      setProducts(fallbackProducts);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: ProductInsert) => {
    try {
      console.log("=== CREATING PRODUCT ===");
      console.log("Original form data:", product);

      // Create a safe product data without problematic fields
      const safeProductData: any = {
        name: product.name,
        slug: product.slug,
        category_id: product.category_id || null,
        price: Number(product.price),
        original_price: product.original_price
          ? Number(product.original_price)
          : null,
        description: product.description || "توضیحی ارائه نشده",
        long_description: product.long_description || "توضیحات کامل ارائه نشده",
        origin: product.origin || "نامشخص",
        // Ensure features is an array of strings, filter out empty strings
        features: Array.isArray(product.features)
          ? product.features.filter(
              (f) => f && typeof f === "string" && f.trim() !== "",
            )
          : ["ویژگی خاصی ندارد"],
        // Ensure weights is properly formatted as JSONB array
        weights: Array.isArray(product.weights)
          ? product.weights.filter((w) => w && w.value && w.price)
          : [],
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
      };

      // Handle image field - try both possible column names
      if (product.image_url) {
        safeProductData.image_url = product.image_url;
      }

      console.log("Safe product data (with category):", safeProductData);
      console.log("Data types:", {
        name: typeof safeProductData.name,
        slug: typeof safeProductData.slug,
        category_id: typeof safeProductData.category_id,
        price: typeof safeProductData.price,
        features: Array.isArray(safeProductData.features)
          ? "array"
          : typeof safeProductData.features,
        weights: Array.isArray(safeProductData.weights)
          ? "array"
          : typeof safeProductData.weights,
      });
      console.log("Features content:", safeProductData.features);
      console.log("Weights content:", safeProductData.weights);

      // Try inserting with all possible field combinations
      const insertionAttempts = [
        // Attempt 1: Full data with image_url
        async () => {
          console.log("Attempt 1: Full data with image_url");
          return await supabase
            .from("products")
            .insert(safeProductData)
            .select()
            .single();
        },
        // Attempt 2: Data without image fields
        async () => {
          console.log("Attempt 2: Data without image fields");
          const minimalData = { ...safeProductData };
          delete minimalData.image_url;
          return await supabase
            .from("products")
            .insert(minimalData)
            .select()
            .single();
        },
        // Attempt 3: Only required fields
        async () => {
          console.log("Attempt 3: Only required fields");
          const minimalData = {
            name: safeProductData.name,
            slug: safeProductData.slug,
            category_id: safeProductData.category_id,
            price: safeProductData.price,
            description: safeProductData.description,
            long_description: safeProductData.long_description,
            origin: safeProductData.origin,
          };
          return await supabase
            .from("products")
            .insert(minimalData)
            .select()
            .single();
        },
      ];

      let lastError: any = null;

      // Try each insertion attempt
      for (let i = 0; i < insertionAttempts.length; i++) {
        try {
          const { data, error } = await insertionAttempts[i]();

          if (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            console.error(
              `Error code: ${error.code}, Message: ${error.message}`,
            );
            console.error(`Error details:`, error.details);
            console.error(`Error hint:`, error.hint);
            lastError = error;
            continue;
          }

          console.log(`✅ Attempt ${i + 1} succeeded:`, data);
          await fetchProducts();
          return { data, error: null };
        } catch (attemptError) {
          console.error(`Attempt ${i + 1} threw exception:`, attemptError);
          lastError = attemptError;
        }
      }

      // If all attempts failed, throw the last error
      throw lastError;
    } catch (err) {
      console.error("=== CREATE PRODUCT FAILED ===");
      console.error("Final error:", err);

      // Provide more specific error messages
      let errorMessage = "Database error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;

        // Check for specific error types
        if (errorMessage.includes("duplicate key")) {
          errorMessage = "اسلاگ تکراری است. لطفاً اسلاگ دیگری انتخاب کنید";
        } else if (
          errorMessage.includes("column") &&
          errorMessage.includes("does not exist")
        ) {
          errorMessage =
            "مشکل در ساختار پایگاه داده. لطفاً با مدیر سیستم تماس بگیرید";
        } else if (
          errorMessage.includes("permission") ||
          errorMessage.includes("row-level security")
        ) {
          errorMessage = "عدم دسترسی برای ذخیره محصول";
        } else if (
          errorMessage.includes("null value in column") &&
          errorMessage.includes("violates not-null constraint")
        ) {
          errorMessage = "برخی فیلدهای الزامی خالی هستند";
        } else if (errorMessage.includes("foreign key constraint")) {
          errorMessage = "مقدار دسته‌بندی نامعتبر است";
        }
      }

      // Add more detailed error information
      if (err && typeof err === "object" && "code" in err) {
        const dbError = err as any;
        console.error("Database error code:", dbError.code);
        console.error("Database error details:", dbError.details);
        console.error("Database error hint:", dbError.hint);
      }

      return { data: null, error: errorMessage };
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdate) => {
    try {
      console.log("=== UPDATING PRODUCT ===");
      console.log("Product ID:", id);
      console.log("Update data:", updates);

      // First, get the existing product to see what fields we can update
      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Failed to fetch existing product:", fetchError);
        throw fetchError;
      }

      if (existingProduct) {
        console.log(
          "Existing product structure:",
          Object.keys(existingProduct),
        );
      }

      // Create safe update data
      const safeUpdate: any = {
        name: updates.name,
        slug: updates.slug,
        category_id: updates.category_id || null,
        price: Number(updates.price),
        original_price: updates.original_price
          ? Number(updates.original_price)
          : null,
        description: updates.description || "توضیحی ارائه نشده",
        long_description: updates.long_description || "توضیحات کامل ارائه نشده",
        origin: updates.origin || "نامشخص",
        // Ensure features is an array of strings, filter out empty strings
        features: Array.isArray(updates.features)
          ? updates.features.filter(
              (f) => f && typeof f === "string" && f.trim() !== "",
            )
          : [],
        // Ensure weights is properly formatted as JSONB
        weights: Array.isArray(updates.weights)
          ? updates.weights.filter((w) => w && w.value && w.price)
          : [],
        in_stock: updates.in_stock !== undefined ? updates.in_stock : true,
      };

      // Handle image field
      if (updates.image_url) {
        // Try both possible image field names
        if (existingProduct && "image_url" in existingProduct) {
          safeUpdate.image_url = updates.image_url;
        } else if (existingProduct && "image" in existingProduct) {
          safeUpdate.image = updates.image_url;
        } else {
          // Default to image_url
          safeUpdate.image_url = updates.image_url;
        }
      }

      console.log("Safe update (with category):", safeUpdate);
      console.log("Update data types:", {
        name: typeof safeUpdate.name,
        slug: typeof safeUpdate.slug,
        category_id: typeof safeUpdate.category_id,
        price: typeof safeUpdate.price,
        features: Array.isArray(safeUpdate.features)
          ? "array"
          : typeof safeUpdate.features,
        weights: Array.isArray(safeUpdate.weights)
          ? "array"
          : typeof safeUpdate.weights,
      });
      console.log("Update features content:", safeUpdate.features);
      console.log("Update weights content:", safeUpdate.weights);

      // Try updating with all possible field combinations
      const updateAttempts = [
        // Attempt 1: Full update
        async () => {
          console.log("Update attempt 1: Full update");
          return await supabase
            .from("products")
            .update(safeUpdate)
            .eq("id", id)
            .select()
            .single();
        },
        // Attempt 2: Minimal update (only core fields)
        async () => {
          console.log("Update attempt 2: Minimal update");
          const minimalUpdate = {
            name: safeUpdate.name,
            slug: safeUpdate.slug,
            category_id: safeUpdate.category_id,
            price: safeUpdate.price,
          };
          return await supabase
            .from("products")
            .update(minimalUpdate)
            .eq("id", id)
            .select()
            .single();
        },
      ];

      let lastError: any = null;

      // Try each update attempt
      for (let i = 0; i < updateAttempts.length; i++) {
        try {
          const { data, error } = await updateAttempts[i]();

          if (error) {
            console.error(`Update attempt ${i + 1} failed:`, error);
            console.error(
              `Error code: ${error.code}, Message: ${error.message}`,
            );
            console.error(`Error details:`, error.details);
            console.error(`Error hint:`, error.hint);
            lastError = error;
            continue;
          }

          console.log(`✅ Update attempt ${i + 1} succeeded:`, data);
          await fetchProducts();
          return { data, error: null };
        } catch (attemptError) {
          console.error(
            `Update attempt ${i + 1} threw exception:`,
            attemptError,
          );
          lastError = attemptError;
        }
      }

      // If all attempts failed, throw the last error
      throw lastError;
    } catch (err) {
      console.error("=== UPDATE PRODUCT FAILED ===");
      console.error("Final error:", err);

      // Provide more specific error messages
      let errorMessage = "Database error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;

        // Check for specific error types
        if (errorMessage.includes("duplicate key")) {
          errorMessage = "اسلاگ تکراری است. لطفاً اسلاگ دیگری انتخاب کنید";
        } else if (
          errorMessage.includes("column") &&
          errorMessage.includes("does not exist")
        ) {
          errorMessage =
            "مشکل در ساختار پایگاه داده. لطفاً با مدیر سیستم تماس بگیرید";
        } else if (
          errorMessage.includes("permission") ||
          errorMessage.includes("row-level security")
        ) {
          errorMessage = "عدم دسترسی برای به‌روزرسانی محصول";
        } else if (
          errorMessage.includes("null value in column") &&
          errorMessage.includes("violates not-null constraint")
        ) {
          errorMessage = "برخی فیلدهای الزامی خالی هستند";
        }
      }

      // Add more detailed error information
      if (err && typeof err === "object" && "code" in err) {
        const dbError = err as any;
        console.error("Database error code:", dbError.code);
        console.error("Database error details:", dbError.details);
        console.error("Database error hint:", dbError.hint);
      }

      return { data: null, error: errorMessage };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return { error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      return { error: errorMessage };
    }
  };

  const getProductBySlug = async (slug: string) => {
    try {
      console.log("Fetching product by slug:", slug);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      console.log("Product fetch result:", { data, error });

      if (error) {
        console.error("Error fetching product by slug:", error);
        // Try to find in sample data as fallback
        const sampleProduct = sampleProducts.find((p) => p.slug === slug);
        if (sampleProduct) {
          const convertedProduct = {
            id: sampleProduct.id,
            name: sampleProduct.name,
            slug: sampleProduct.slug,
            category_id: sampleProduct.category,
            price: sampleProduct.price,
            original_price: sampleProduct.originalPrice || null,
            image_url: sampleProduct.image,
            description: sampleProduct.description || "توضیحی ارائه نشده",
            long_description:
              sampleProduct.longDescription || "توضیحات کامل ارائه نشده",
            origin: sampleProduct.origin || "نامشخص",
            features: sampleProduct.features || [],
            weights: sampleProduct.weights || [],
            rating: sampleProduct.rating || 0,
            review_count: sampleProduct.reviewCount || 0,
            in_stock:
              sampleProduct.inStock !== undefined
                ? sampleProduct.inStock
                : true,
            gallery_images: [],
            is_featured: false,
            meta_title: null,
            meta_description: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Product;
          return { data: convertedProduct, error: null };
        }
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error("=== GET PRODUCT BY SLUG FAILED ===");
      console.error("Slug:", slug);
      console.error("Final error:", err);

      // Try to find in sample data as fallback
      const sampleProduct = sampleProducts.find((p) => p.slug === slug);
      if (sampleProduct) {
        const convertedProduct = {
          id: sampleProduct.id,
          name: sampleProduct.name,
          slug: sampleProduct.slug,
          category_id: sampleProduct.category,
          price: sampleProduct.price,
          original_price: sampleProduct.originalPrice || null,
          image_url: sampleProduct.image,
          description: sampleProduct.description || "توضیحی ارائه نشده",
          long_description:
            sampleProduct.longDescription || "توضیحات کامل ارائه نشده",
          origin: sampleProduct.origin || "نامشخص",
          features: sampleProduct.features || [],
          weights: sampleProduct.weights || [],
          rating: sampleProduct.rating || 0,
          review_count: sampleProduct.reviewCount || 0,
          in_stock:
            sampleProduct.inStock !== undefined ? sampleProduct.inStock : true,
          gallery_images: [],
          is_featured: false,
          meta_title: null,
          meta_description: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Product;
        return { data: convertedProduct, error: null };
      }

      const errorMessage =
        err instanceof Error ? err.message : "Database error occurred";
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductBySlug,
  };
};
