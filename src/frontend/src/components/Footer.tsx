export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">♔</span>
          <div>
            <p className="font-serif font-bold text-foreground text-sm">
              MyChess
            </p>
            <p className="text-muted-foreground text-xs font-sans">
              Play · Study · Community
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs font-sans text-center">
          © {year}. Built with ♥ using{" "}
          <a
            href={utm}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
