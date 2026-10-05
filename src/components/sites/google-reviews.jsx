/* eslint-disable @next/next/no-img-element -- reviewer photos come from Google; plain <img> keeps them off Vercel image optimisation */
import { ArrowUpRight, Star } from "lucide-react";

function Stars({ rating, className = "size-4" }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${className} ${value <= Math.round(rating) ? "fill-[#fbbc04] text-[#fbbc04]" : "fill-s-line text-s-line"}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  const author = review.authorUrl ? (
    <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {review.author}
    </a>
  ) : (
    review.author
  );
  return (
    <figure className="flex w-[82%] shrink-0 snap-start flex-col rounded-[1.25rem] border border-s-line bg-s-paper p-6 sm:w-[46%] md:w-auto">
      <div className="flex items-center gap-3">
        {review.photo ? (
          <img
            src={review.photo}
            alt=""
            referrerPolicy="no-referrer"
            loading="lazy"
            className="size-10 rounded-full bg-s-line object-cover"
          />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-s-accent text-sm font-semibold text-s-on-accent">
            {review.author.slice(0, 1).toUpperCase()}
          </span>
        )}
        <figcaption className="min-w-0">
          <p className="truncate text-[0.95rem] font-semibold text-s-ink">{author}</p>
          {review.when ? <p className="text-xs text-s-muted">{review.when}</p> : null}
        </figcaption>
      </div>
      <div className="mt-4">
        <Stars rating={review.rating} />
      </div>
      {review.text ? (
        <blockquote className="mt-3 line-clamp-6 text-[0.95rem] leading-relaxed whitespace-pre-line text-s-muted">
          {review.text}
        </blockquote>
      ) : null}
    </figure>
  );
}

/**
 * The shop's Google rating and the reviews Google returns for its listing
 * (Standard plan). Shown with Google attribution, unedited, as the Places
 * API terms require.
 */
export function GoogleReviews({ reviews, headingClassName = "" }) {
  if (!reviews || (!reviews.count && !reviews.reviews?.length)) return null;
  const rating = Math.round(reviews.rating * 10) / 10;
  return (
    <section id="reviews" data-section="reviews" className="py-20 md:py-28">
      <div className="s-wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="s-eyebrow text-s-muted">Google reviews</p>
            <div className="mt-4 flex items-center gap-4">
              <span className={`text-5xl leading-none text-s-ink md:text-6xl ${headingClassName}`}>
                {rating.toFixed(1)}
              </span>
              <div>
                <Stars rating={rating} className="size-5" />
                <p className="mt-1 text-sm text-s-muted">
                  {reviews.count.toLocaleString("en-IN")} reviews on Google
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {reviews.reviewUrl ? (
              <a
                href={reviews.reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-s-accent px-5 text-sm font-semibold text-s-on-accent"
              >
                Write a review
              </a>
            ) : null}
            {reviews.mapsUrl ? (
              <a
                href={reviews.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-s-line px-5 text-sm font-semibold text-s-ink"
              >
                See all on Google
                <ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </div>
        </div>
        {reviews.reviews?.length ? (
          <div className="sa-rail -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 scroll-px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {reviews.reviews.map((review, index) => (
              <ReviewCard key={`${review.author}-${index}`} review={review} />
            ))}
          </div>
        ) : null}
        <p className="mt-6 text-xs text-s-muted">Reviews from Google Maps</p>
      </div>
    </section>
  );
}
