"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import styles from "./login.module.css";
import { cn } from "@/lib/utils";

const ROLES = ["Principal", "Admin", "Teacher", "Parent", "Student"];

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    login({ email: email.trim(), password });
  };

  const errorMessage = (() => {
    if (formError) return formError;
    if (!error) return null;
    const e = error as any;
    return e.response?.data?.message || e.message || "Login failed.";
  })();

  const toggleRole = (role: string) => {
    setSelectedRole((prev) => (prev === role ? null : role));
  };

  return (
    <div className={styles.page}>

      {/* Ambient Background Blobs */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      <div className={styles.blob3}></div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className={styles.glassShell}>

        {/* LATER 3A — LEFT BRAND PANEL */}
        <div className={styles.brandCard}>
          <div className={styles.brandContent}>

            {/* Logo Mark */}
            <div className={styles.logoMark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L2 8.5L12 14L22 8.5L12 3Z" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 14L12 19.5L22 14" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22V14" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className={styles.brandTitle}>
              Government Intermediate College
            </h1>

            <div className={styles.brandBadge}>
              Management System
            </div>

            <p className={styles.brandDesc}>
              A unified platform for the principal, teachers, students and parents — live attendance, fees, results and timetables across both campuses.
            </p>

            <div className={styles.divider}></div>

            <div className="flex flex-col gap-3 mb-auto">
              {[
                "Secure Role-Based Access",
                "Real-time Attendance Tracking",
                "Advanced Fee Management"
              ].map((feature, i) => (
                <div key={i} className={styles.featureItem}>
                  <div className={styles.featDot}></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 40 }}>
              {[
                { num: "1000+", label: "STUDENTS" },
                { num: "45+", label: "STAFF" },
                { num: "2", label: "CAMPUSES" },
                { num: "5", label: "PROGRAMS" }
              ].map((stat) => (
                <div key={stat.label} className={styles.statTile}>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 21, fontWeight: 700, color: '#D4A843', marginBottom: 2 }}>{stat.num}</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 400, color: 'rgba(255, 255, 255, 0.32)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* LAYER 3B — RIGHT FORM PANEL */}
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit} className="flex flex-col w-full h-full justify-center max-w-[360px] mx-auto" style={{ position: 'relative', zIndex: 2 }}>

            <h2 className={styles.loginHead}>
              Welcome back
            </h2>
            <p className={styles.loginSub}>
              Sign in to continue
            </p>

            {/* Role Selector */}
            <div className="flex flex-wrap gap-2 mb-[22px]">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={cn(
                      "rounded-[8px] px-2 py-1.5 text-[11px] cursor-pointer transition-all duration-150",
                      isSelected
                        ? "bg-[rgba(15,68,68,0.12)] border border-[rgba(15,68,68,0.35)] text-[#0F4444] font-medium dark:bg-[rgba(212,168,67,0.15)] dark:border-[rgba(212,168,67,0.35)] dark:text-[#D4A843]"
                        : "bg-[rgba(255,255,255,0.40)] border border-[rgba(15,68,68,0.14)] text-[rgba(15,68,68,0.55)] dark:bg-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.12)] dark:text-[rgba(200,220,200,0.55)]"
                    )}
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className={styles.fieldLabel}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                placeholder="name@college.edu"
                className={cn(styles.fieldInput, errorMessage && styles.fieldInputError)}
              />
            </div>

            {/* Password Field */}
            <div className="mb-2">
              <label
                htmlFor="password"
                className={styles.fieldLabel}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  placeholder="Enter your password"
                  className={cn(styles.fieldInput, errorMessage && styles.fieldInputError, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-[rgba(15,68,68,0.40)] hover:text-[rgba(15,68,68,0.70)] dark:text-[rgba(255,255,255,0.40)] dark:hover:text-[rgba(255,255,255,0.70)] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-1.5 mt-2 animate-in fade-in duration-200">
                <AlertCircle size={12} color="#EF4444" />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: '#EF4444' }}>
                  {errorMessage}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={styles.btnSignin}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-secondary)' }}>
                Forgot your password? <span className={styles.forgotLink}>Contact admin office</span>
              </span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
