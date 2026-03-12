import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

const OPERA_GAME_PGN = `[Event "Opera Game"]\n[Site "Paris"]\n[Date "1858.??.??"]\n[White "Paul Morphy"]\n[Black "Duke of Brunswick and Count Isouard"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7\n8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7\n14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

const IMMORTAL_GAME_PGN = `[Event "Immortal Game"]\n[Site "London"]\n[Date "1851.??.??"]\n[White "Adolf Anderssen"]\n[Black "Lionel Kieseritzky"]\n[Result "1-0"]\n\n1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5\n8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8\n15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6\n21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`;

const GAME_OF_CENTURY_PGN = `[Event "Rosenwald Memorial Tournament"]\n[Site "New York"]\n[Date "1956.10.17"]\n[White "Donald Byrne"]\n[Black "Robert James Fischer"]\n[Result "0-1"]\n\n1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6\n8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4\n14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+\n20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1\n26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4\n32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+\n38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`;

const NOTABLE_GAMES = [
  {
    white: "Paul Morphy",
    black: "Duke of Brunswick",
    event: "Opera Game, Paris 1858",
    result: "1-0",
    year: 1858,
    pgn: OPERA_GAME_PGN,
  },
  {
    white: "Adolf Anderssen",
    black: "Lionel Kieseritzky",
    event: "Immortal Game, London 1851",
    result: "1-0",
    year: 1851,
    pgn: IMMORTAL_GAME_PGN,
  },
  {
    white: "Donald Byrne",
    black: "Robert J. Fischer",
    event: "Game of the Century, New York 1956",
    result: "0-1",
    year: 1956,
    pgn: GAME_OF_CENTURY_PGN,
  },
];

const DECORATIVE_PIECES = [
  { piece: "♔", x: "5%", y: "10%", size: "8vw", delay: 0 },
  { piece: "♛", x: "88%", y: "15%", size: "7vw", delay: 0.2 },
  { piece: "♖", x: "3%", y: "60%", size: "5vw", delay: 0.4 },
  { piece: "♝", x: "92%", y: "65%", size: "6vw", delay: 0.1 },
];

export default function HomePage() {
  const navigate = useNavigate();

  function openGame(pgn: string) {
    sessionStorage.setItem("notation_pgn", pgn);
    navigate({ to: "/notation" });
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {DECORATIVE_PIECES.map((d) => (
          <motion.span
            key={d.piece}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ delay: d.delay, duration: 1 }}
            className="absolute text-foreground pointer-events-none select-none"
            style={{ left: d.x, top: d.y, fontSize: d.size, lineHeight: 1 }}
          >
            {d.piece}
          </motion.span>
        ))}

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-conic-gradient(oklch(0.98 0 0) 0% 25%, transparent 0% 50%)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-muted-foreground font-sans text-xs tracking-[0.4em] uppercase mb-6">
              The Chess Community Platform
            </p>
            <h1
              className="font-serif font-bold text-foreground"
              style={{
                fontSize: "clamp(52px, 10vw, 120px)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
              }}
            >
              My
              <span className="italic">Chess</span>
            </h1>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-px bg-border flex-1 max-w-24" />
              <span className="text-muted-foreground text-sm font-sans">
                ♟ ♟ ♟
              </span>
              <div className="h-px bg-border flex-1 max-w-24" />
            </div>
            <p className="mt-6 text-muted-foreground font-sans text-lg max-w-2xl mx-auto leading-relaxed">
              Join chess communities, analyze famous games with the notation
              viewer, challenge other players, and connect with chess
              enthusiasts worldwide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/communities"
              data-ocid="home.primary_button"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-foreground text-background font-sans text-sm font-semibold tracking-wider uppercase hover:bg-muted-foreground transition-colors"
            >
              <Users className="h-4 w-4" /> Explore Communities
            </Link>
            <Link
              to="/notation"
              data-ocid="home.secondary_button"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-border text-foreground font-sans text-sm tracking-wider uppercase hover:bg-secondary transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Notation Viewer
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl font-bold text-foreground mb-12 text-center"
        >
          Everything You Need
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="h-6 w-6" />,
              title: "Communities",
              desc: "Create or join chess communities. Discuss openings, share games, and grow together.",
              href: "/communities",
              cta: "Browse Communities",
            },
            {
              icon: <BookOpen className="h-6 w-6" />,
              title: "Notation Viewer",
              desc: "Paste any PGN notation and watch the game unfold move-by-move on an interactive board.",
              href: "/notation",
              cta: "Open Viewer",
            },
            {
              icon: <Zap className="h-6 w-6" />,
              title: "Pairing Lobby",
              desc: "Browse open challenges, create your own, and find opponents across all time controls.",
              href: "/pairing",
              cta: "Find a Game",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              data-ocid="home.card"
            >
              <Link
                to={card.href}
                className="group block border border-border bg-card p-6 hover:border-foreground/50 transition-all duration-300"
              >
                <div className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors">
                  {card.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-4">
                  {card.desc}
                </p>
                <span className="text-foreground font-sans text-xs tracking-widest uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                  {card.cta} →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Notable Games */}
      <section className="border-t border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif text-2xl font-bold text-foreground mb-8 flex items-center gap-3"
          >
            <Zap className="h-5 w-5" />
            Notable Games
          </motion.h2>
          <div className="space-y-3">
            {NOTABLE_GAMES.map((game, i) => (
              <motion.div
                key={game.event}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`home.item.${i + 1}`}
              >
                <button
                  type="button"
                  onClick={() => openGame(game.pgn)}
                  className="w-full text-left flex items-center justify-between border border-border p-4 hover:bg-secondary transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-mono text-xs w-10 shrink-0">
                      {game.year}
                    </span>
                    <div>
                      <p className="text-foreground font-sans text-sm font-medium">
                        {game.white}{" "}
                        <span className="text-muted-foreground">vs</span>{" "}
                        {game.black}
                      </p>
                      <p className="text-muted-foreground font-sans text-xs">
                        {game.event}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-foreground">
                      {game.result}
                    </span>
                    <span className="text-muted-foreground font-sans text-xs hidden sm:inline group-hover:text-foreground transition-colors">
                      View →
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
