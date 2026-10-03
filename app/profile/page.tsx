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

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // LOAD PROFILE
        const profileResponse = await fetch("/api/profile");
        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          setProfileError(
            profileData.message || "Could not load profile."
          );
          return;
        }

        setCustomer(profileData.customer);
        setName(profileData.customer.name);
        setEmail(profileData.customer.email || "");

        // LOAD ADDRESSES
        const addressResponse = await fetch("/api/addresses");
        const addressData = await addressResponse.json();

        if (addressResponse.ok) {
          setAddresses(addressData.addresses);
        }
      } catch (error) {
        console.error(error);
        setProfileError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function saveProfile() {
    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileError(
          data.message || "Could not update profile."
        );
        return;
      }

      setCustomer(data.customer);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setProfileError("Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAddress() {
    try {
      setSavingAddress(true);
      setAddressMessage("");
      setAddressError("");

      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();

      if (!response.ok) {
        setAddressError(
          data.message || "Could not add address."
        );
        return;
      }

      setAddresses((currentAddresses) => [
        data.address,
        ...currentAddresses,
      ]);

      setNewAddress({
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });

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

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7] px-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center">

          <div className="text-6xl">🐾</div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Please login
          </h1>

          <p className="mt-3 text-gray-500">
            {profileError || "Login is required."}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-white"
          >
            Go to Login
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* NAVBAR */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

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

          <div className="flex gap-5">
            <Link
              href="/shop"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Shop
            </Link>

            <Link
              href="/"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Home
            </Link>
          </div>

        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-12">

        <div className="mb-8">
          <p className="font-bold uppercase tracking-wide text-orange-600">
            MY ACCOUNT
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            My Profile
          </h2>

          <p className="mt-2 text-gray-500">
            Manage your personal information and delivery
            addresses.
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-4 border-b border-gray-100 pb-5">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
              👤
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Personal Information
              </h3>

              <p className="text-sm text-gray-500">
                Update your account details.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {/* NAME */}
            <div>
              <label className="text-sm font-bold text-slate-700">
                Full Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            {/* MOBILE */}
            <div>
              <label className="text-sm font-bold text-slate-700">
                Mobile Number
              </label>

              <input
                value={customer.mobile}
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Mobile number cannot be changed here.
              </p>
            </div>

            {/* EMAIL */}
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                Email Address{" "}
                <span className="font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
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
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {profileError}
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-6 rounded-xl bg-orange-500 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {savingProfile
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

        {/* ADDRESS CARD */}
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
                📍
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  My Addresses
                </h3>

                <p className="text-sm text-gray-500">
                  Manage your delivery addresses.
                </p>
              </div>

            </div>

            <button
              onClick={() => {
                setShowAddressForm(!showAddressForm);
                setAddressError("");
              }}
              className="rounded-xl border border-orange-500 px-5 py-2.5 font-bold text-orange-600 hover:bg-orange-50"
            >
              {showAddressForm
                ? "Cancel"
                : "+ Add Address"}
            </button>

          </div>

          {/* ADD ADDRESS FORM */}
          {showAddressForm && (
            <div className="mt-7 rounded-2xl bg-orange-50 p-6">

              <h4 className="text-lg font-bold text-slate-900">
                Add Delivery Address
              </h4>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {/* ADDRESS */}
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">
                    Address *
                  </label>

                  <textarea
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

                {/* LANDMARK */}
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">
                    Landmark{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
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

                {/* CITY */}
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    City *
                  </label>

                  <input
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

                {/* STATE */}
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    State *
                  </label>

                  <input
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

                {/* PINCODE */}
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    PIN Code *
                  </label>

                  <input
                    value={newAddress.pincode}
                    maxLength={6}
                    inputMode="numeric"
                    onChange={(event) =>
                      setNewAddress({
                        ...newAddress,
                        pincode:
                          event.target.value.replace(
                            /\D/g,
                            ""
                          ),
                      })
                    }
                    placeholder="6-digit PIN code"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

              </div>

              {addressError && (
                <div className="mt-5 rounded-xl bg-red-100 p-4 text-sm font-semibold text-red-600">
                  {addressError}
                </div>
              )}

              <button
                onClick={addAddress}
                disabled={savingAddress}
                className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {savingAddress
                  ? "Saving..."
                  : "Save Address"}
              </button>

            </div>
          )}

          {addressMessage && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              ✓ {addressMessage}
            </div>
          )}

          {/* NO ADDRESS */}
          {addresses.length === 0 &&
            !showAddressForm && (
              <div className="mt-7 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-10 text-center">

                <div className="text-4xl">🏠</div>

                <p className="mt-3 font-bold text-slate-700">
                  No addresses added yet
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Add your delivery address for faster
                  checkout.
                </p>

              </div>
            )}

          {/* SAVED ADDRESSES */}
          {addresses.length > 0 && (
            <div className="mt-7 grid gap-4">

              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <div className="flex items-center gap-2">

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
                        {item.city}, {item.state} -{" "}
                        {item.pincode}
                      </p>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </section>

    </main>
  );
}