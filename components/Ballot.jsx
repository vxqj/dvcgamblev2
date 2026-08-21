"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { NUGGET_NAMES } from "@/nugget.config";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CANDIDATES = NUGGET_NAMES.map((name) => ({ name, slug: slugify(name) }));
const MY_VOTE_KEY = "nugget-list-my-vote";

export default function Ballot() {
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [burstSlug, setBurstSlug] = useState(null);

  // Restore this browser's own vote (stored locally, not global)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MY_VOTE_KEY);
      if (saved) setMyVote(saved);
    } catch (e) {
      // localStorage unavailable (private browsing etc) — fine, just won't persist
    }
  }, []);

  // Load current counts, then subscribe to live changes from every visitor
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }

    let active = true;

    async function loadInitial() {
      const { data, error } = await supabase.from("votes").select("slug, count");
      if (error) {
        console.error("Nugget List: failed to read votes", error);
      } else if (active && data) {
        const next = {};
        data.forEach((row) => {
          next[row.slug] = row.count;
        });
        setVotes(next);
      }
      if (active) setLoaded(true);
    }
    loadInitial();

    const channel = supabase
      .channel("votes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          setVotes((prev) => ({ ...prev, [row.slug]: row.count }));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const castVote = useCallback(
    (slug) => {
      if (!isSupabaseConfigured || !loaded || myVote === slug) return;
      const prevVote = myVote;
      const candidate = CANDIDATES.find((c) => c.slug === slug);

      // optimistic local update — realtime event will confirm/correct it
      setVotes((prev) => ({ ...prev, [slug]: (prev[slug] || 0) + 1 }));
      if (prevVote) {
        setVotes((prev) => ({
          ...prev,
          [prevVote]: Math.max(0, (prev[prevVote] || 0) - 1),
        }));
      }

      supabase
        .rpc("increment_vote", { vote_slug: slug, vote_name: candidate.name })
        .then(({ error }) => {
          if (error) console.error("Nugget List: vote failed to save", error);
        });

      if (prevVote) {
        supabase.rpc("decrement_vote", { vote_slug: prevVote }).then(({ error }) => {
          if (error) console.error("Nugget List: vote switch failed to save", error);
        });
      }

      setMyVote(slug);
      try {
        window.localStorage.setItem(MY_VOTE_KEY, slug);
      } catch (e) {
        // ignore — vote still counted globally, just won't be remembered locally
      }

      setBurstSlug(slug);
      window.setTimeout(() => setBurstSlug(null), 600);
    },
    [loaded, myVote]
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="setup-banner">
        <b>&#9888; Supabase not configured yet</b>
        Add your Supabase project URL and anon key to <code>.env.local</code>{" "}
        (copy from <code>.env.local.example</code>), and run{" "}
        <code>supabase-setup.sql</code> in your project's SQL editor so votes
        sync globally. See the README for the full setup.
      </div>
    );
  }

  const sorted = CANDIDATES.map((c) => ({ ...c, count: votes[c.slug] || 0 })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
  const total = sorted.reduce((sum, c) => sum + c.count, 0);
  const maxVotes = Math.max(1, ...sorted.map((c) => c.count));

  const prettyName = (slug) => CANDIDATES.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <header className="header">
        <div className="eyebrow">Live public vote</div>
        <h1>
          Nugget
          <br />
          List
        </h1>
        <p className="tagline">
          Pick your favorite. Every vote updates the board in real time for
          everyone.
        </p>
        <div className="status-line">
          {myVote ? (
            <>
              you voted for <b>{prettyName(myVote)}</b> · tap another name to
              switch
            </>
          ) : (
            <>
              <b>{sorted.length}</b> candidates on the ballot
            </>
          )}
        </div>
      </header>

      <div className="ballot">
        <div className="ballot-head">
          <span className="label">Candidates</span>
          <span className="label">
            {total} {total === 1 ? "vote" : "votes"}
          </span>
        </div>

        <div className="rows">
          <AnimatePresence initial={false}>
            {sorted.map((c, i) => (
              <motion.div
                key={c.slug}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                className={`row ${myVote === c.slug ? "voted" : ""} ${
                  burstSlug === c.slug ? "burst-play" : ""
                }`}
                onClick={() => castVote(c.slug)}
              >
                <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                <span className="name-cell">
                  <span
                    className="bar"
                    style={{ width: `${(c.count / maxVotes) * 100}%` }}
                  />
                  <span className="name">{c.name}</span>
                </span>
                <span className="count">{c.count}</span>
                <span className="punch">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.2 12L13 4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="burst" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="ballot-foot">
          <span>
            {myVote
              ? "tap another name to change your vote"
              : "tap a name to cast your vote"}
          </span>
          <span>jarrah.lol</span>
        </div>
      </div>

      <footer className="sitefoot">NUGGET LIST · ONE VOTE, CHANGE IT ANYTIME</footer>
    </>
  );
}
