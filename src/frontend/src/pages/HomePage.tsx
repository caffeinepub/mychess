import { Link } from "@tanstack/react-router";
import { BookOpen, Trophy, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

const FEATURED_STATS = [
  { label: "Active Communities", value: "120+" },
  { label: "Games Analyzed", value: "50K+" },
  { label: "Players", value: "8,400+" },
  { label: "Notation Games", value: "30K+" },
];

const DECORATIVE_PIECES = [
  { piece: "♔", x: "5%", y: "10%", size: "8vw", delay: 0 },
  { piece: "♛", x: "88%", y: "15%", size: "7vw", delay: 0.2 },
  { piece: "♖", x: "3%", y: "60%", size: "5vw", delay: 0.4 },
  { piece: "♝", x: "92%", y: "65%", size: "6vw", delay: 0.1 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Decorative chess pieces */}
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

        {/* Subtle chess grid background */}
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
              Join chess communities, analyze games with our notation viewer,
              and connect with players from around the world.
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

      {/* Stats strip */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-y border-border py-8"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURED_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="font-serif text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

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
              icon: <Trophy className="h-6 w-6" />,
              title: "Save & Study",
              desc: "Save your favorite games, annotate them, and build a personal library of chess analysis.",
              href: "/notation",
              cta: "Start Studying",
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

      {/* Sample notable games */}
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
            {[
              {
                white: "Kasparov, G.",
                black: "Deep Blue",
                event: "Man vs Machine 1997, Game 6",
                result: "0-1",
                year: 1997,
              },
              {
                white: "Fischer, R.",
                black: "Spassky, B.",
                event: "World Championship 1972, Game 6",
                result: "1-0",
                year: 1972,
              },
              {
                white: "Morphy, P.",
                black: "Consultants",
                event: "Opera Game, Paris 1858",
                result: "1-0",
                year: 1858,
              },
              {
                white: "Tal, M.",
                black: "Botvinnik, M.",
                event: "World Championship 1960, Game 6",
                result: "1-0",
                year: 1960,
              },
            ].map((game, i) => (
              <motion.div
                key={game.event}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`home.item.${i + 1}`}
                className="flex items-center justify-between border border-border p-4 hover:bg-secondary transition-colors group cursor-default"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground font-mono text-xs w-8">
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
                <span className="font-mono text-sm text-foreground">
                  {game.result}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
