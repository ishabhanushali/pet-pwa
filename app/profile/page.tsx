
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
};

type Address = {
  id: number;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const emptyAddress = {
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function ProfileNavbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🐾</span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Pet PWA
            </h1>
            <p className="text-xs text-gray-500">
              Shop • Pet ID • Rewards
            </p>
          </div>
        </Link>

        <div className="flex flex-wrap gap-5">
          <Link href="/shop" className="font-semibold text-gray-600 hover:text-orange-600">
            Shop
          </Link>
          <Link href="/pets" className="font-semibold text-gray-600 hover:text-orange-600">
            Pets
          </Link>
          <Link href="/orders" className="font-semibold text-gray-600 hover:text-orange-600">
            Orders
          </Link>
          <Link href="/rewards" className="font-semibold text-gray-600 hover:text-orange-600">
            Rewards
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ ...emptyAddress });

  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);

        const profileResponse = await fetch("/api/profile", {
          cache: "no-store",
          credentials: "same-origin",
        });

        const profileData = await profileResponse.json();

        if (!active) return;

        const message = String(
          profileData.message || profileData.error || ""
        );

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403 ||
          (!profileResponse.ok &&
            /login|log in|sign in|unauthori[sz]ed/i.test(message))
        ) {
          setAuthRequired(true);
          return;
        }

        if (!profileResponse.ok) {
          setProfileError(message || "Could not load profile.");
          return;
        }

        const loadedCustomer = profileData.customer;

        if (!loadedCustomer) {
          setProfileError("Customer profile was not returned.");
          return;
        }

        setAuthRequired(false);
        setCustomer(loadedCustomer);
        setName(loadedCustomer.name);
        setEmail(loadedCustomer.email || "");

        const addressResponse = await fetch("/api/addresses", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (addressResponse.ok) {
          const addressData = await addressResponse.json();

          if (active) {
            setAddresses(
              Array.isArray(addressData.addresses)
                ? addressData.addresses
                : []
            );
          }
        }
      } catch (error) {
        console.error("Profile loading error:", error);
        if (active) setProfileError("Could not load profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  async function saveProfile() {
    if (!customer) return;

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileError(
          data.message || data.error || "Could not update profile."
        );
        return;
      }

      if (data.customer) {
        setCustomer(data.customer);
        setName(data.customer.name);
        setEmail(data.customer.email || "");
      }

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setProfileError("Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAddress() {
    setAddressError("");
    setAddressMessage("");

    if (
      !newAddress.address.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !/^\d{6}$/.test(newAddress.pincode)
    ) {
      setAddressError("Please fill all required fields and enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setSavingAddress(true);

      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();

      if (!response.ok) {
        setAddressError(
          data.message || data.error || "Could not add address."
        );
        return;
      }

      if (data.address) {
        setAddresses((current) => [data.address, ...current]);
      }

      setNewAddress({ ...emptyAddress });
      setShowAddressForm(false);
      setAddressMessage("Address added successfully.");
    } catch (error) {
      console.error(error);
      setAddressError("Could not add address.");
    } finally {
      setSavingAddress(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7]">
        <div className="text-center">
          <div className="text-6xl">🐾</div>
          <p className="mt-4 font-semibold text-gray-600">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  // FRIENDLY LOGGED-OUT SCREEN
  if (authRequired) {
    return (
      <main className="min-h-screen bg-[#fafaf7]">
        <ProfileNavbar />

        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-5xl">
              👤
            </div>

            <h1 className="mt-7 text-3xl font-bold text-slate-900">
              Your Pet PWA Profile Awaits!
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-gray-600">
              Sign in or create an account to manage your
              personal details, save delivery addresses,
              and keep everything you need for your pets
              in one place.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/login?next=%2Fprofile"
                className="rounded-xl bg-orange-500 px-8 py-3.5 font-bold text-white transition hover:bg-orange-600"
              >
                Login to Profile
              </Link>

              <Link
                href="/signup?next=%2Fprofile"
                className="rounded-xl border border-orange-500 bg-white px-8 py-3.5 font-bold text-orange-600 transition hover:bg-orange-50"
              >
                Create Account
              </Link>
            </div>

            <p className="mt-7 text-sm text-gray-500">
              🐾 Your personal pet care space is just a login away!
            </p>

            <Link
              href="/"
              className="mt-6 inline-block text-sm font-semibold text-orange-600 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-[#fafaf7]">
        <ProfileNavbar />

        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-8">
            <div className="text-5xl">🐾</div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Unable to Load Profile
            </h1>
            <p className="mt-3 text-gray-500">
              {profileError || "Please try again."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <ProfileNavbar />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <p className="font-bold uppercase tracking-wide text-orange-600">
            MY ACCOUNT
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your personal information and delivery addresses.
          </p>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-sm text-gray-500">
                Update your account details.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="text-sm font-bold text-slate-700">
                Full Name
              </label>

              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="profile-mobile" className="text-sm font-bold text-slate-700">
                Mobile Number
              </label>

              <input
                id="profile-mobile"
                value={customer.mobile}
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Mobile number cannot be changed here.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="profile-email" className="text-sm font-bold text-slate-700">
                Email Address{" "}
                <span className="font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {profileMessage && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              ✓ {profileMessage}
            </div>
          )}

          {profileError && (
            <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {profileError}
            </div>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-6 rounded-xl bg-orange-500 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* DELIVERY ADDRESSES */}
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
                📍
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  My Addresses
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your delivery addresses.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddressForm(!showAddressForm);
                setAddressError("");
              }}
              className="rounded-xl border border-orange-500 px-5 py-2.5 font-bold text-orange-600 hover:bg-orange-50"
            >
              {showAddressForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>

          {showAddressForm && (
            <div className="mt-7 rounded-2xl bg-orange-50 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Add Delivery Address
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="address-street" className="text-sm font-bold text-slate-700">
                    Address *
                  </label>
                  <textarea
                    id="address-street"
                    value={newAddress.address}
                    onChange={(event) =>
                      setNewAddress({
                        ...newAddress,
                        address: event.target.value,
                      })
                    }
                    placeholder="House / Flat No., Building, Street"
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address-landmark" className="text-sm font-bold text-slate-700">
                    Landmark (Optional)
                  </label>
                  <input
                    id="address-landmark"
                    value={newAddress.landmark}
                    onChange={(event) =>
                      setNewAddress({
                        ...newAddress,
                        landmark: event.target.value,
                      })
                    }
                    placeholder="Near..."
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="address-city" className="text-sm font-bold text-slate-700">
                    City *
                  </label>
                  <input
                    id="address-city"
                    value={newAddress.city}
                    onChange={(event) =>
                      setNewAddress({
                        ...newAddress,
                        city: event.target.value,
                      })
                    }
                    placeholder="City"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="address-state" className="text-sm font-bold text-slate-700">
                    State *
                  </label>
                  <input
                    id="address-state"
                    value={newAddress.state}
                    onChange={(event) =>
                      setNewAddress({
                        ...newAddress,
                        state: event.target.value,
                      })
                    }
                    placeholder="State"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="address-pincode" className="text-sm font-bold text-slate-700">
                    PIN Code *
                  </label>
                  <input
                    id="address-pincode"
                    value={newAddress.pincode}
                    maxLength={6}
                    inputMode="numeric"
                    onChange={(event) =>
                      setNewAddress({
                        ...newAddress,
                        pincode: event.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="6-digit PIN code"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {addressError && (
                <div role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-sm font-semibold text-red-600">
                  {addressError}
                </div>
              )}

              <button
                type="button"
                onClick={addAddress}
                disabled={savingAddress}
                className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {savingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          )}

          {addressMessage && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              ✓ {addressMessage}
            </div>
          )}

          {addresses.length === 0 && !showAddressForm && (
            <div className="mt-7 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-10 text-center">
              <div className="text-4xl">🏠</div>
              <p className="mt-3 font-bold text-slate-700">
                No addresses added yet
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Add your delivery address for faster checkout.
              </p>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="mt-7 grid gap-4">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">
                      🏠 Delivery Address
                    </p>

                    {item.isDefault && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-gray-600">
                    {item.address}
                  </p>

                  {item.landmark && (
                    <p className="mt-1 text-sm text-gray-500">
                      Landmark: {item.landmark}
                    </p>
                  )}

                  <p className="mt-1 text-gray-600">
                    {item.city}, {item.state} - {item.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
