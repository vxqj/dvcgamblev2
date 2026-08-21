"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ref, onValue, runTransaction } from "firebase/database";
import { db, isFirebaseConfigured } from "@/lib/firebase";
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

  // Subscribe to the global, shared vote counts
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoaded(true);
      return;
    }
    const votesRef = ref(db, "votes");
    const unsubscribe = onValue(
      votesRef,
      (snapshot) => {
        setVotes(snapshot.val() || {});
        setLoaded(true);
      },
      (error) => {
        console.error("Nugget List: failed to read votes", error);
        setLoaded(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const castVote = useCallback(
    (slug) => {
      if (!isFirebaseConfigured || !loaded || myVote === slug) return;
      const prevVote = myVote;

      runTransaction(ref(db, `votes/${slug}`), (current) => (current || 0) + 1).catch(
        (e) => console.error("Nugget List: vote failed to save", e)
      );
      if (prevVote) {
        runTransaction(ref(db, `votes/${prevVote}`), (current) =>
          Math.max(0, (current || 0) - 1)
        ).catch((e) => console.error("Nugget List: vote switch failed to save", e));
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

  if (!isFirebaseConfigured) {
    return (
      <div className="setup-banner">
        <b>&#9888; Firebase not configured yet</b>
        Add your Firebase Realtime Database credentials to{" "}
        <code>.env.local</code> (copy from <code>.env.local.example</code>) so
        votes sync globally across every visitor. See the README for the
        3-minute setup.
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
