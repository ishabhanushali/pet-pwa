
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

type AddressForm = {
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyAddress: AddressForm = {
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

const inputStyle =
  "mt-2 w-full rounded-2xl border border-[#DCE8DA] bg-white px-4 py-3.5 text-[#245C46] outline-none transition focus:border-[#245C46] focus:ring-2 focus:ring-[#E3F1DF]";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "My Pets", href: "/pets" },
  { label: "Orders", href: "/orders" },
  { label: "Rewards", href: "/rewards" },
  { label: "Reminders", href: "/reminders" },
  { label: "Support", href: "/support" },
];

function ProfileNavbar({
  customerName,
}: {
  customerName?: string;
}) {
  const firstName =
    customerName?.trim().split(/\s+/)[0] || "";

  return (
    <>
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🐾 Your happy pet care space starts here! 💚
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#E7ECE5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🐾</span>

            <div>
              <h1 className="text-xl font-black text-[#245C46]">
                Pet PWA
              </h1>

              <p className="text-xs text-[#819287]">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-[#486357] transition hover:text-[#E77B49]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-bold text-[#245C46]"
            >
              {firstName
                ? `👋 Hi, ${firstName}`
                : "👤 Profile"}
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="rounded-full bg-[#FFF0E4] px-3 py-2 text-xl"
            >
              🛒
            </Link>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto border-t border-[#F0F1EA] px-5 py-3 text-sm font-semibold lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-[#536A5D]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default function ProfilePage() {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [newAddress, setNewAddress] =
    useState<AddressForm>({ ...emptyAddress });

  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [addressMessage, setAddressMessage] =
    useState("");

  const [addressError, setAddressError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);

        const profileResponse = await fetch(
          "/api/profile",
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        );

        const profileData =
          await profileResponse.json();

        if (!active) return;

        const message = String(
          profileData.message ||
            profileData.error ||
            ""
        );

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403 ||
          (!profileResponse.ok &&
            /login|log in|sign in|unauthori[sz]ed/i.test(
              message
            ))
        ) {
          setAuthRequired(true);
          return;
        }

        if (!profileResponse.ok) {
          setProfileError(
            message || "Could not load profile."
          );
          return;
        }

        const loadedCustomer =
          profileData.customer as Customer | undefined;

        if (!loadedCustomer) {
          setProfileError(
            "Customer profile was not returned."
          );
          return;
        }

        setAuthRequired(false);
        setCustomer(loadedCustomer);
        setName(loadedCustomer.name);
        setEmail(loadedCustomer.email || "");

        const addressResponse = await fetch(
          "/api/addresses",
          {
            cache: "no-store",
            credentials: "same-origin",
          }
        );

        if (addressResponse.ok) {
          const addressData =
            await addressResponse.json();

          if (active) {
            setAddresses(
              Array.isArray(addressData.addresses)
                ? addressData.addresses
                : []
            );
          }
        }
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        if (active) {
          setProfileError(
            "Could not load profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  async function saveProfile() {
    if (!customer) return;

    setProfileMessage("");
    setProfileError("");

    if (name.trim().length < 2) {
      setProfileError(
        "Please enter your full name."
      );
      return;
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      setProfileError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setSavingProfile(true);

      const response = await fetch(
        "/api/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setProfileError(
          data.message ||
            data.error ||
            "Could not update profile."
        );
        return;
      }

      if (data.customer) {
        setCustomer(data.customer);
        setName(data.customer.name);
        setEmail(data.customer.email || "");
      }

      setProfileMessage(
        "Your profile has been updated successfully! 💚"
      );
    } catch (error) {
      console.error(error);
      setProfileError(
        "Could not update profile."
      );
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
      setAddressError(
        "Please fill all required fields and enter a valid 6-digit PIN code."
      );
      return;
    }

    try {
      setSavingAddress(true);

      const response = await fetch(
        "/api/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(newAddress),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAddressError(
          data.message ||
            data.error ||
            "Could not add address."
        );
        return;
      }

      if (data.address) {
        setAddresses((current) => [
          data.address,
          ...current,
        ]);
      }

      setNewAddress({ ...emptyAddress });
      setShowAddressForm(false);

      setAddressMessage(
        "Your delivery address has been added! 🏡"
      );
    } catch (error) {
      console.error(error);
      setAddressError(
        "Could not add address."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF7]">
        <div className="text-center">
          <div className="animate-bounce text-6xl">
            🐾
          </div>

          <p className="mt-5 font-bold text-[#708476]">
            Getting your happy space ready...
          </p>
        </div>
      </main>
    );
  }

  if (authRequired) {
    return (
      <main className="min-h-screen bg-[#FFFCF7]">
        <ProfileNavbar />

        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-[32px] border border-[#E3EAE0] bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
              🐶
            </div>

            <p className="mt-6 text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
              YOUR PERSONAL PET CARE SPACE
            </p>

            <h1 className="mt-3 text-3xl font-black text-[#245C46]">
              Your Pet PWA profile awaits!
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-[#708476]">
              Sign in to manage your personal
              information, save delivery addresses
              and keep everything for your furry
              friends in one happy place.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login?next=%2Fprofile"
                className="rounded-full bg-[#245C46] px-7 py-3.5 font-bold text-white"
              >
                Login to Profile
              </Link>

              <Link
                href="/signup?next=%2Fprofile"
                className="rounded-full border border-[#C9DEC9] bg-[#EAF5E9] px-7 py-3.5 font-bold text-[#245C46]"
              >
                Create Account
              </Link>
            </div>

            <Link
              href="/"
              className="mt-7 inline-block text-sm font-bold text-[#D97748]"
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
      <main className="min-h-screen bg-[#FFFCF7]">
        <ProfileNavbar />

        <section className="mx-auto max-w-lg px-5 py-20">
          <div className="rounded-[30px] border border-[#E3EAE0] bg-white p-9 text-center shadow-sm">
            <div className="text-6xl">🐾</div>

            <h1 className="mt-5 text-2xl font-black text-[#245C46]">
              A little paw-blem!
            </h1>

            <p className="mt-3 text-[#708476]">
              {profileError ||
                "We couldn't load your profile."}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-full bg-[#245C46] px-7 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  const firstName =
    customer.name.trim().split(/\s+/)[0];

  return (
    <main className="min-h-screen bg-[#FFFCF7] text-[#245C46]">
      <ProfileNavbar customerName={customer.name} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#FFF2E6]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#FFE0C9]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#E3F1DF]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:py-16">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-[#D97748] shadow-sm">
              🐾 YOUR HAPPY LITTLE SPACE
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Hello,{" "}
              <span className="text-[#E98557]">
                {firstName}!
              </span>{" "}
              👋
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#688071]">
              Welcome to your Pet PWA profile!
              Manage your details, keep delivery
              addresses handy, and make every
              pet care moment a little easier. 💚
            </p>

            <a
              href="#personal-information"
              className="mt-6 inline-flex rounded-full bg-[#245C46] px-7 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              Manage My Profile ✨
            </a>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex h-40 w-52 items-center justify-center sm:h-48 sm:w-64"
          >
            <div className="absolute h-40 w-40 rounded-full bg-[#F9DFC9] sm:h-48 sm:w-48" />

            <span className="relative text-7xl sm:text-8xl">
              🐶
            </span>

            <span className="absolute -right-2 top-2 text-4xl">
              🏡
            </span>

            <span className="absolute bottom-0 left-0 text-4xl">
              🐾
            </span>

            <span className="absolute bottom-2 right-2 text-3xl">
              ✨
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {/* QUICK SUMMARY */}
        <div className="mb-9 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] bg-[#EAF5E9] p-5">
            <span className="text-3xl">👤</span>

            <p className="mt-3 text-sm font-bold text-[#66806C]">
              My Account
            </p>

            <p className="mt-1 truncate text-lg font-black">
              {customer.name}
            </p>
          </div>

          <div className="rounded-[24px] bg-[#FFF0E4] p-5">
            <span className="text-3xl">🏡</span>

            <p className="mt-3 text-sm font-bold text-[#9A7866]">
              Saved Addresses
            </p>

            <p className="mt-1 text-3xl font-black">
              {addresses.length}
            </p>
          </div>

          <div className="rounded-[24px] bg-[#F2EDFA] p-5">
            <span className="text-3xl">💚</span>

            <p className="mt-3 text-sm font-bold text-[#827295]">
              Pet PWA Family
            </p>

            <p className="mt-1 text-lg font-black">
              Happy Member
            </p>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div
          id="personal-information"
          className="scroll-mt-32 overflow-hidden rounded-[30px] border border-[#E3EAE0] bg-white shadow-sm"
        >
          <div className="bg-[#EAF5E9] px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl">
                👤
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
                  YOUR DETAILS
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-[#708476]">
                  Keep your account details up to date.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-name"
                  className="text-sm font-extrabold"
                >
                  ✨ Full Name
                </label>

                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  maxLength={100}
                  placeholder="Your full name"
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="profile-mobile"
                  className="text-sm font-extrabold"
                >
                  📱 Mobile Number
                </label>

                <input
                  id="profile-mobile"
                  value={customer.mobile}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-2xl border border-[#E3EAE0] bg-[#F5F7F3] px-4 py-3.5 text-[#819287]"
                />

                <p className="mt-2 text-xs text-[#819287]">
                  Your registered mobile number
                  cannot be changed here.
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="profile-email"
                  className="text-sm font-extrabold"
                >
                  ✉️ Email Address
                  <span className="ml-2 font-normal text-[#819287]">
                    (Optional)
                  </span>
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="example@email.com"
                  className={inputStyle}
                />

                <p className="mt-2 text-xs text-[#819287]">
                  Keep your email updated for
                  important account communications.
                </p>
              </div>
            </div>

            {profileMessage && (
              <div
                role="status"
                className="mt-6 rounded-2xl bg-[#EAF5E9] p-4 text-sm font-bold text-[#245C46]"
              >
                ✓ {profileMessage}
              </div>
            )}

            {profileError && (
              <div
                role="alert"
                className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600"
              >
                {profileError}
              </div>
            )}

            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="mt-7 rounded-full bg-[#245C46] px-8 py-3.5 font-extrabold text-white transition hover:bg-[#194633] disabled:opacity-50"
            >
              {savingProfile
                ? "Saving Changes..."
                : "💚 Save My Changes"}
            </button>
          </div>
        </div>

        {/* DELIVERY ADDRESSES */}
        <div className="mt-9 overflow-hidden rounded-[30px] border border-[#E3EAE0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFF0E4] px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl">
                🏡
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
                  YOUR HAPPY PLACES
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  My Addresses
                </h2>

                <p className="mt-1 text-sm text-[#8B786C]">
                  Keep your delivery addresses handy.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddressForm(
                  !showAddressForm
                );
                setAddressError("");
              }}
              className="rounded-full bg-[#245C46] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              {showAddressForm
                ? "✕ Cancel"
                : "+ Add Address"}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {showAddressForm && (
              <div className="mb-7 rounded-[26px] border border-[#DCE8DA] bg-[#F4F9F1] p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📍</span>

                  <div>
                    <h3 className="text-xl font-black">
                      Add a Happy Place
                    </h3>

                    <p className="mt-1 text-sm text-[#708476]">
                      Where should we deliver
                      your pet's goodies?
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address-street"
                      className="text-sm font-extrabold"
                    >
                      🏠 Full Address *
                    </label>

                    <textarea
                      id="address-street"
                      rows={3}
                      value={newAddress.address}
                      onChange={(event) =>
                        setNewAddress({
                          ...newAddress,
                          address: event.target.value,
                        })
                      }
                      placeholder="Flat No., Building, Street"
                      className={`${inputStyle} resize-none`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="address-landmark"
                      className="text-sm font-extrabold"
                    >
                      📍 Landmark (Optional)
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
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address-city"
                      className="text-sm font-extrabold"
                    >
                      🏙️ City *
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
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address-state"
                      className="text-sm font-extrabold"
                    >
                      🌿 State *
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
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address-pincode"
                      className="text-sm font-extrabold"
                    >
                      📮 PIN Code *
                    </label>

                    <input
                      id="address-pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={newAddress.pincode}
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
                      className={inputStyle}
                    />
                  </div>
                </div>

                {addressError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600"
                  >
                    {addressError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addAddress}
                  disabled={savingAddress}
                  className="mt-6 rounded-full bg-[#245C46] px-8 py-3.5 font-extrabold text-white transition hover:bg-[#194633] disabled:opacity-50"
                >
                  {savingAddress
                    ? "Saving Address..."
                    : "🏡 Save Address"}
                </button>
              </div>
            )}

            {addressMessage && (
              <div
                role="status"
                className="mb-6 rounded-2xl bg-[#EAF5E9] p-4 text-sm font-bold text-[#245C46]"
              >
                ✓ {addressMessage}
              </div>
            )}

            {addresses.length === 0 &&
              !showAddressForm && (
                <div className="rounded-[26px] border-2 border-dashed border-[#DCE8DA] bg-[#FFFCF7] px-6 py-12 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
                    🏡
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    No addresses added yet!
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#708476]">
                    Save your delivery address
                    and make checkout easier
                    whenever you shop for your pet.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddressForm(true)
                    }
                    className="mt-6 rounded-full bg-[#245C46] px-6 py-3 text-sm font-extrabold text-white"
                  >
                    + Add My First Address
                  </button>
                </div>
              )}

            {addresses.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-[24px] border p-6 ${
                      index % 2 === 0
                        ? "border-[#DCE8DA] bg-[#EAF5E9]"
                        : "border-[#F3E0D2] bg-[#FFF0E4]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-4xl">
                        🏡
                      </span>

                      {item.isDefault && (
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#245C46]">
                          ✓ Default Address
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 text-lg font-black">
                      Delivery Address
                    </h3>

                    <p className="mt-3 break-words text-sm leading-7 text-[#536A5D]">
                      {item.address}
                    </p>

                    {item.landmark && (
                      <p className="mt-2 break-words text-sm text-[#708476]">
                        📍 Near {item.landmark}
                      </p>
                    )}

                    <p className="mt-2 text-sm font-semibold text-[#536A5D]">
                      {item.city}, {item.state} -{" "}
                      {item.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div className="mt-10 rounded-[30px] bg-[#245C46] p-8 text-center text-white sm:p-10">
          <div className="text-5xl">🐾</div>

          <h2 className="mt-4 text-2xl font-black">
            Everything your pet needs, in one place!
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#D7EBDE]">
            Explore treats, food, pet profiles,
            Paw Points and more — all made with
            love for your furry companions.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-white px-7 py-3 text-sm font-extrabold text-[#245C46]"
            >
              🛍️ Explore Shop
            </Link>

            <Link
              href="/pets"
              className="rounded-full border border-white/50 px-7 py-3 text-sm font-extrabold text-white"
            >
              🐶 My Pets
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E6EBE2] bg-[#F3F7EF] py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-black text-[#245C46]">
              🐾 Pet PWA
            </h3>

            <p className="mt-2 text-sm text-[#718478]">
              Little paws. Big love. Happy hearts.
            </p>
          </div>

          <p className="text-sm text-[#819287]">
            © 2026 Pet PWA. Made with 💚 for pets.
          </p>
        </div>
      </footer>
    </main>
  );
}
