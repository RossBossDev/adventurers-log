import { ApiHealth } from "./api-health";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Old School RuneScape companion
          </p>
          <h1 className="text-5xl font-bold tracking-tight">
            Adventurers&apos; Log
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Track OSRS activities, journals, goals, and future asynchronous
            imports across web and iOS.
          </p>
        </div>
        <ApiHealth />
      </section>
    </main>
  );
}
