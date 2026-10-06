/* eslint-disable @next/next/no-img-element -- post images come from Instagram's CDN with expiring URLs; plain <img> keeps them off Vercel image optimisation */
import { ArrowUpRight, Images, Play } from "lucide-react";
import { InstagramIcon } from "@/components/sites/icons";

function PostTile({ post }) {
  const TypeIcon = post.type === "video" ? Play : post.type === "album" ? Images : null;
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
      {TypeIcon ? (
        <TypeIcon
          className="absolute top-2 right-2 size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
          fill={post.type === "video" ? "currentColor" : "none"}
          strokeWidth={2}
        />
      ) : null}
    </a>
  );
}

/**
 * The shop's latest Instagram posts as a 3-column grid (Standard plan, connected account).
 * `flushTop` when the section above has the same background and already ends in padding.
 */
export function InstagramFeed({ feed, headingClassName = "", flushTop = false }) {
  const all = feed?.posts || [];
  const posts = all.length >= 3 ? all.slice(0, all.length - (all.length % 3)) : all;
  if (!posts.length) return null;
  return (
    <section
      id="instagram"
      data-section="instagram"
      className={`pb-16 md:pb-24 ${flushTop ? "" : "pt-16 md:pt-24"}`}
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
        <div className="mt-8 grid grid-cols-3 gap-1 overflow-hidden rounded-[1.25rem] md:gap-2" data-reveal>
          {posts.map((post) => (
            <PostTile key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
