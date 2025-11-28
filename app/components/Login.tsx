"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in production use proper auth
    try {
      const request = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!request.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await request.json();

      // Store tokens in cookies
      document.cookie = `bearer_token=${data.access}; path=/; secure; samesite=strict`;
      document.cookie = `refresh_token=${data.refresh}; path=/; secure; samesite=strict`;
      router.push(`/r/${data.restaurant_name}`);

      console.log("Login response:", data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900">
          <span className="text-2xl font-bold text-white">D</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Bienvenido a Ding</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>

        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-950"
        >
          Iniciar sesión
        </button>

        <p className="text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{" "}
          <a href="#" className="font-medium text-zinc-900 hover:underline">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  );
}
