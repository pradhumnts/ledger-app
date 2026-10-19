/* eslint-disable @next/next/no-img-element -- post images come from Instagram's CDN with expiring URLs; plain <img> keeps them off Vercel image optimisation */
import { ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/sites/icons";

/** Instagram-style pin (top-left on the grid). */
function PinBadge() {
  return (
    <span className="absolute top-1.5 left-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-3.5 fill-white text-white md:size-4">
        <path d="M16 3a1 1 0 0 1 .8 1.6L14.4 8.2l1.7 4.3a1 1 0 0 1-.4 1.2l-1.5.9-2.1-2.9-2.6 2.6V20a1 1 0 1 1-2 0v-6.7l4.9-4.9.9-3.1A1 1 0 0 1 16 3Z" />
      </svg>
    </span>
  );
}

/** Instagram carousel / album stack (top-right). */
function AlbumBadge() {
  return (
    <span className="absolute top-1.5 right-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-3.5 text-white md:size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="7" y="7" width="13" height="13" rx="2" />
        <path d="M4 16V6a2 2 0 0 1 2-2h10" />
      </svg>
    </span>
  );
}

/** Instagram reel / video play (top-right). */
function VideoBadge() {
  return (
    <span className="absolute top-1.5 right-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-3.5 fill-white text-white md:size-4">
        <path d="M8 5.5v13l11-6.5L8 5.5Z" />
      </svg>
    </span>
  );
}

function PostTile({ post }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden bg-s-line"
    >
      <img
        src={post.image}
        alt={post.caption ? post.caption.slice(0, 120) : ""}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="size-full object-cover transition duration-500 group-hover:scale-105"
      />
      {post.pinned ? <PinBadge /> : null}
      {post.type === "video" ? <VideoBadge /> : post.type === "album" ? <AlbumBadge /> : null}
    </a>
  );
}

/**
 * The shop's latest Instagram posts as a 4×3 grid on desktop (Standard plan).
 * Phone keeps 3 columns so tiles stay tappable. `flushTop` when the section
 * above has the same background and already ends in padding.
 */
export function InstagramFeed({ feed, headingClassName = "", flushTop = false }) {
  const all = feed?.posts || [];
  // Prefer a full 4×3 (12) when we have enough; otherwise fill complete rows of 4,
  // or of 3 on short feeds so the phone layout still looks even.
  let posts = all;
  if (all.length >= 12) posts = all.slice(0, 12);
  else if (all.length >= 4) posts = all.slice(0, all.length - (all.length % 4));
  else if (all.length >= 3) posts = all.slice(0, all.length - (all.length % 3));
  if (!posts.length) return null;
  return (
    <section
      id="instagram"
      data-section="instagram"
      className={`pb-24 md:pb-32 ${flushTop ? "" : "pt-16 md:pt-24"}`}
    >
      <div className="s-wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="s-eyebrow text-s-muted">Instagram</p>
            <h2 className={`mt-4 text-3xl leading-tight text-s-ink md:text-4xl ${headingClassName}`}>
              @{feed.username}
            </h2>
          </div>
          {feed.profileUrl ? (
            <a
              href={feed.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-s-accent px-5 text-sm font-semibold text-s-on-accent md:self-auto"
            >
              <InstagramIcon className="size-4" />
              Follow on Instagram
              <ArrowUpRight className="size-4" />
            </a>
          ) : null}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-1 overflow-hidden rounded-[1.25rem] md:grid-cols-4 md:gap-2" data-reveal>
          {posts.map((post) => (
            <PostTile key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
