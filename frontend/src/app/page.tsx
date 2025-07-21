'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [grafanaUrl, setGrafanaUrl] = useState<string | null>(null);

  useEffect(() => {
    // Runs only on the client
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // Use fixed port if Grafana is always on 3001, else use window.location.port
    const grafanaPort = 3008; // change if needed
    // Or use the same port as the app: const grafanaPort = window.location.port;
    setGrafanaUrl(`${protocol}//${hostname}:${grafanaPort}/dashboards`);
  }, []);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background px-6 py-12 gap-10 font-sans">
      <main className="flex flex-col items-center gap-6 max-w-xl w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Cloud Native App Demo</h1>
        <p className="text-base text-muted-foreground mb-2">
          This portfolio project demonstrates a production-ready, dockerized platform running <span className="font-mono">Node.js</span> (API/backend) and <span className="font-mono">Next.js</span> (frontend) with CI/CD automation.
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside text-left w-full max-w-sm mx-auto">
          <li>Full stack deployable with Docker Compose</li>
          <li>Backend integrates <span className="font-mono">Kafka</span>, <span className="font-mono">PostgreSQL</span>, <span className="font-mono">MongoDB</span>, <span className="font-mono">Redis</span></li>
          <li>Prometheus &amp; Grafana for observability (auto-provisioned dashboards)</li>
          <li>Automated setup via <span className="font-mono">/scripts/pre-up.js</span> (buildkit, dashboards, config patching)</li>
          <li>CI/CD: Github Actions for build, test &amp; EC2 deployment</li>
          <li>Secrets managed via Github Actions secrets</li>
        </ul>
        <Link
          href={(grafanaUrl == null ? 'http://localhost:3008' : grafanaUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-base font-medium hover:bg-neutral-900 hover:dark:bg-neutral-200 transition"
        >
          View Live Grafana Dashboard →
        </Link>
        <p className="inline-flex items-center text-sm text-muted-foreground space-y-1 max-w-sm mx-auto">admin : ryanmilo</p>
      </main>
      <footer className="mt-8 text-xs text-muted-foreground opacity-75">
        © {new Date().getFullYear()} Ryan Lobban | Full-Stack Portfolio
      </footer>
    </div>
  );
}
