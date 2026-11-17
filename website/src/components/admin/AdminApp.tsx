"use client";
/**
 * AdminApp.tsx – Einstieg für /verwaltung: prüft den Login-Status und zeigt
 * entweder das Login-Formular oder das Dashboard.
 * Die Seite selbst ist statisch – alle Daten kommen erst nach dem Login über
 * die Admin-API, die jede Anfrage serverseitig gegen die PHP-Session prüft.
 */
import { useCallback, useEffect, useState } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { api } from "@/lib/booking/api";

type Auth = "checking" | "in" | "out" | "error";

export default function AdminApp() {
  const [auth, setAuth] = useState<Auth>("checking");

  // useEffect: Login-Status einmal beim Laden abfragen (setState erst im Promise-Callback)
  useEffect(() => {
    let active = true;
    api.admin
      .session()
      .then((s) => {
        if (active) setAuth(s.loggedIn ? "in" : "out");
      })
      .catch(() => {
        if (active) setAuth("error");
      });
    return () => {
      active = false;
    };
  }, []);

  // useCallback: stabile Funktion – sie steht in den Abhängigkeiten des Lade-Effekts im Dashboard
  const handleLoggedOut = useCallback(() => setAuth("out"), []);

  if (auth === "checking") return <p className="text-muted">Prüfe Anmeldung …</p>;
  if (auth === "error") {
    return (
      <div role="alert" className="rounded-3xl border border-line bg-card p-6">
        <p className="font-semibold">Die Verwaltung ist gerade nicht erreichbar.</p>
        <p className="mt-1 text-muted">Prüfe, ob die API hochgeladen und config.php eingerichtet ist.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-4 min-h-12 rounded-full bg-accent px-6 font-semibold text-on-accent">Erneut versuchen</button>
      </div>
    );
  }
  if (auth === "out") return <AdminLogin onSuccess={() => setAuth("in")} />;
  return <AdminDashboard onLoggedOut={handleLoggedOut} />;
}