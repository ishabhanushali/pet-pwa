"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  packSize: string;
  mrp: number;
  price: number;
  imageUrl: string | null;
  description: string | null;
  inStock: boolean;
  stock: number;
};

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type ProductForm = {
  name: string;
  brand: string;
  category: string;
  packSize: string;
  mrp: string;
  price: string;
  stock: string;
  imageUrl: string;
  description: string;
  inStock: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  brand: "",
  category: "",
  packSize: "",
  mrp: "",
  price: "",
  stock: "",
  imageUrl: "",
  description: "",
  inStock: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [admin, setAdmin] =
    useState<Admin | null>(null);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [editingProductId, setEditingProductId] =
    useState<number | null>(null);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==================================================
  // UPDATE FORM FIELD
  // ==================================================

  function updateField(
    field: keyof ProductForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setError("");

      const response = await fetch(
        "/api/admin/products",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href =
          "/admin/login";

        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Could not load products."
        );

        return;
      }

      setProducts(data.products || []);
      setAdmin(data.admin || null);
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      setError(
        "Something went wrong while loading products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // ==================================================
  // VALIDATE FORM
  // ==================================================

  function validateForm() {
    const mrp =
      Number(form.mrp);

    const price =
      Number(form.price);

    const stock =
      Number(form.stock);

    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.brand.trim()) {
      return "Brand is required.";
    }

    if (!form.category.trim()) {
      return "Category is required.";
    }

    if (!form.packSize.trim()) {
      return "Pack size is required.";
    }

    if (
      !Number.isFinite(mrp) ||
      mrp <= 0
    ) {
      return "Please enter a valid MRP.";
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return "Please enter a valid selling price.";
    }

    if (price > mrp) {
      return "Selling price cannot be greater than MRP.";
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return "Stock must be a whole number of 0 or more.";
    }

    if (
      form.description.length >
      1000
    ) {
      return "Description must be 1000 characters or less.";
    }

    return null;
  }

  // ==================================================
  // CREATE / UPDATE PRODUCT
  // ==================================================

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      const payload = {
        name:
          form.name.trim(),

        brand:
          form.brand.trim(),

        category:
          form.category.trim(),

        packSize:
          form.packSize.trim(),

        mrp:
          Number(form.mrp),

        price:
          Number(form.price),

        stock:
          Number(form.stock),

        imageUrl:
          form.imageUrl.trim(),

        description:
          form.description.trim(),

        inStock:
          form.inStock,
      };

      // ==============================================
      // EDIT EXISTING PRODUCT
      // ==============================================

      if (editingProductId !== null) {
        const response = await fetch(
          `/api/admin/products/${editingProductId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(payload),
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          window.location.href =
            "/admin/login";

          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Could not update product."
          );

          return;
        }

        setSuccess(
          "Product updated successfully."
        );
      }

      // ==============================================
      // CREATE NEW PRODUCT
      // ==============================================

      else {
        const response = await fetch(
          "/api/admin/products",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(payload),
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          window.location.href =
            "/admin/login";

          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Could not create product."
          );

          return;
        }

        setSuccess(
          "Product created successfully."
        );
      }

      // Reset form after success
      setForm(emptyForm);

      setEditingProductId(null);

      // Refresh products
      await loadProducts();

      // Scroll to products
      setTimeout(() => {
        document
          .getElementById(
            "product-list"
          )
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setError(
        "Something went wrong while saving the product."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // START EDITING
  // ==================================================

  function startEditing(
    product: Product
  ) {
    setEditingProductId(
      product.id
    );

    setForm({
      name:
        product.name,

      brand:
        product.brand,

      category:
        product.category,

      packSize:
        product.packSize,

      mrp:
        String(product.mrp),

      price:
        String(product.price),

      stock:
        String(product.stock),

      imageUrl:
        product.imageUrl || "",

      description:
        product.description || "",

      inStock:
        product.inStock,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================================
  // CANCEL EDIT
  // ==================================================

  function cancelEditing() {
    setEditingProductId(null);

    setForm(emptyForm);

    setError("");
    setSuccess("");
  }

  // ==================================================
  // LOGOUT
  // ==================================================

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      window.location.href =
        "/admin/login";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setError(
        "Could not logout."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* NAVBAR */}

      <nav className="border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-2"
          >

            <span className="text-3xl">
              🐾
            </span>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                Pet PWA
              </h1>

              <p className="text-xs text-gray-500">
                Admin Panel
              </p>

            </div>

          </Link>

          <div className="flex items-center gap-3">

            <Link
              href="/admin/rewards"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 sm:block"
            >
              Paw Points
            </Link>

            <Link
              href="/"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 sm:block"
            >
              Customer Site
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>

          </div>

        </div>

      </nav>

      {/* MAIN CONTENT */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div>

          <p className="font-bold uppercase tracking-wide text-orange-600">
            M22 · ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Product Management 📦
          </h1>

          <p className="mt-2 text-gray-500">
            Add and edit products,
            prices, stock and
            availability.
          </p>

          {admin && (

            <p className="mt-2 text-sm text-gray-400">
              Logged in as{" "}
              <span className="font-semibold">
                {admin.name}
              </span>
            </p>

          )}

        </div>

        {/* ERROR */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-600">
            {error}
          </div>

        )}

        {/* SUCCESS */}

        {success && (

          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4 font-semibold text-green-700">
            {success}
          </div>

        )}

        {/* ========================================== */}
        {/* PRODUCT FORM */}
        {/* ========================================== */}

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">

                {editingProductId
                  ? "Edit Product"
                  : "Add Product"}

              </h2>

              <p className="mt-1 text-sm text-gray-500">

                {editingProductId
                  ? `Editing Product ID #${editingProductId}`
                  : "Add a new product to your shop."}

              </p>

            </div>

            {editingProductId && (

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel Edit
              </button>

            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 grid gap-5 md:grid-cols-2"
          >

            {/* NAME */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Product Name *
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                placeholder="Royal Canin Maxi Adult"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* BRAND */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Brand *
              </label>

              <input
                value={form.brand}
                onChange={(e) =>
                  updateField(
                    "brand",
                    e.target.value
                  )
                }
                placeholder="Royal Canin"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Category *
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
              >

                <option value="">
                  Select category
                </option>

                <option value="Dog Food">
                  Dog Food
                </option>

                <option value="Cat Food">
                  Cat Food
                </option>

                <option value="Treats">
                  Treats
                </option>

                <option value="Cat Litter">
                  Cat Litter
                </option>

              </select>

            </div>

            {/* PACK SIZE */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Pack Size *
              </label>

              <input
                value={form.packSize}
                onChange={(e) =>
                  updateField(
                    "packSize",
                    e.target.value
                  )
                }
                placeholder="3 kg"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* MRP */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                MRP (₹) *
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.mrp}
                onChange={(e) =>
                  updateField(
                    "mrp",
                    e.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* SELLING PRICE */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Selling Price (₹) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  updateField(
                    "price",
                    e.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* STOCK */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Stock Quantity *
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  updateField(
                    "stock",
                    e.target.value
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Stock 0 automatically
                makes the product unavailable.
              </p>

            </div>

            {/* AVAILABILITY */}

            <div>

              <label className="text-sm font-bold text-slate-700">
                Availability
              </label>

              <div className="mt-2 flex h-[50px] items-center rounded-xl border border-gray-300 px-4">

                <input
                  id="inStock"
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) =>
                    updateField(
                      "inStock",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

                <label
                  htmlFor="inStock"
                  className="ml-3 cursor-pointer font-semibold text-slate-700"
                >
                  Product available
                  for purchase
                </label>

              </div>

            </div>

            {/* IMAGE */}

            <div className="md:col-span-2">

              <label className="text-sm font-bold text-slate-700">
                Image URL
              </label>

              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) =>
                  updateField(
                    "imageUrl",
                    e.target.value
                  )
                }
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="text-sm font-bold text-slate-700">
                Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                maxLength={1000}
                rows={4}
                placeholder="Product description..."
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {
                  form.description
                    .length
                }
                /1000
              </p>

            </div>

            {/* SAVE BUTTON */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving
                  ? "Saving..."
                  : editingProductId
                    ? "💾 Save Changes"
                    : "+ Add Product"}

              </button>

            </div>

          </form>

        </div>

        {/* ========================================== */}
        {/* PRODUCTS */}
        {/* ========================================== */}

        <div
          id="product-list"
          className="mt-10"
        >

          <div className="flex items-end justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {products.length} product
                {products.length === 1
                  ? ""
                  : "s"}{" "}
                in catalogue
              </p>

            </div>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>

          </div>

          {loadingProducts ? (

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading products...
            </div>

          ) : products.length === 0 ? (

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-10 text-center">

              <div className="text-5xl">
                📦
              </div>

              <h3 className="mt-3 text-xl font-bold text-slate-900">
                No products yet
              </h3>

            </div>

          ) : (

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {products.map(
                (product) => (

                  <div
                    key={product.id}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >

                    {/* IMAGE */}

                    <div className="flex h-48 items-center justify-center bg-gray-50">

                      {product.imageUrl ? (

                        <img
                          src={
                            product.imageUrl
                          }
                          alt={
                            product.name
                          }
                          className="h-full w-full object-contain p-4"
                        />

                      ) : (

                        <span className="text-6xl">
                          🐾
                        </span>

                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                            {
                              product.category
                            }
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-900">
                            {
                              product.name
                            }
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              product.brand
                            }{" "}
                            ·{" "}
                            {
                              product.packSize
                            }
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            product.inStock
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >

                          {product.inStock
                            ? "In Stock"
                            : "Disabled"}

                        </span>

                      </div>

                      {/* PRICE */}

                      <div className="mt-5 flex items-end gap-2">

                        <span className="text-2xl font-bold text-slate-900">
                          ₹
                          {
                            product.price
                          }
                        </span>

                        {product.mrp >
                          product.price && (

                          <span className="text-sm text-gray-400 line-through">
                            ₹
                            {
                              product.mrp
                            }
                          </span>

                        )}

                      </div>

                      {/* STOCK */}

                      <div className="mt-4 rounded-xl bg-gray-50 p-3">

                        <p className="text-xs text-gray-400">
                          Available Stock
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                          {
                            product.stock
                          }{" "}
                          units
                        </p>

                      </div>

                      {/* PRODUCT ID */}

                      <p className="mt-4 text-xs text-gray-400">
                        Product ID #
                        {product.id}
                      </p>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            product
                          )
                        }
                        className="mt-4 w-full rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 font-bold text-orange-700 transition hover:bg-orange-100"
                      >
                        ✏️ Edit Product
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}