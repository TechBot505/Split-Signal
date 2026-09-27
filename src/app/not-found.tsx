import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-[360px] flex-col items-center gap-4">
        <span className="label-mono text-fail">Error 404</span>
        <h1 className="font-mono text-4xl font-semibold tracking-tight text-fg">Signal lost</h1>
        <p className="text-sm text-muted">
          That frequency is dead. The page you were looking for isn&apos;t on this channel.
        </p>
        <Link href="/play" className="mt-2">
          <Button variant="secondary">Return to base</Button>
        </Link>
      </div>
    </main>
  );
}
