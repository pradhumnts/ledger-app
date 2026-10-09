import assert from "node:assert/strict";
import test from "node:test";
import {
  PREVIEW_NAV,
  demoServicePages,
  homeLink,
  includedServicePageIds,
  pageForService,
  pageLink,
  paragraphs,
  servicePageSlug,
  servicePages,
} from "./service-pages.js";

test("service names become clean URL segments", () => {
  assert.equal(servicePageSlug("Bridal Makeup & Hair"), "bridal-makeup-and-hair");
  assert.equal(servicePageSlug("  Café  Décor!! "), "cafe-decor");
  assert.equal(servicePageSlug("दुल्हन मेकअप"), "");
  assert.equal(servicePageSlug("a".repeat(80)).length, 48);
});

test("only named, visible pages are listed, in order, with unique slugs", () => {
  const pages = servicePages({
    hidden: ["page2"],
    sections: {
      page1: { title: "Bridal Makeup", images: null },
      page2: { title: "Hidden one" },
      page3: { title: "Bridal makeup!" },
      page4: { title: "  " },
    },
  }, 4);
  assert.deepEqual(
    pages.map((page) => [page.id, page.slug, page.position]),
    [
      ["page1", "bridal-makeup", 1],
      ["page3", "bridal-makeup-2", 2],
    ],
  );
  assert.deepEqual(pages[0].images, []);
  assert.deepEqual(pages[0].highlights, []);
});

test("names that don't slugify, and reserved paths, still get a usable slug", () => {
  const pages = servicePages({
    sections: { page2: { title: "मेहंदी" }, page3: { title: "Share image" } },
  }, 4);
  assert.deepEqual(
    pages.map((page) => page.slug),
    ["service-2", "share-image-3"],
  );
});

test("services list items find their page by name", () => {
  const pages = servicePages({ sections: { page1: { title: "Bridal Makeup" } } });
  assert.equal(pageForService(pages, "bridal  makeup")?.id, "page1");
  assert.equal(pageForService(pages, "Party Makeup"), null);
  assert.equal(pageForService(pages, ""), null);
});

test("links work live and in the preview", () => {
  const page = { slug: "bridal-makeup" };
  assert.equal(homeLink({ home: "/sites/aarohi", pagePrefix: "/sites/aarohi/" }, "#about"), "/sites/aarohi#about");
  assert.equal(pageLink({ home: "/", pagePrefix: "/" }, page), "/bridal-makeup");
  assert.equal(homeLink(PREVIEW_NAV, "#about"), "#home#about");
  assert.equal(pageLink(PREVIEW_NAV, page), "#page=bridal-makeup");
});

test("details split into paragraphs on blank lines", () => {
  assert.deepEqual(paragraphs("One\nstill one\n\n  Two \n \nThree"), ["One\nstill one", "Two", "Three"]);
  assert.deepEqual(paragraphs(""), []);
});

test("demo pages come from the pack's services and gallery", () => {
  const pack = {
    sections: {
      services: { items: [{ name: "A", note: "a", price: 100 }, { name: "B", note: "b" }] },
      gallery: { images: ["/1.webp", "/2.webp", "/3.webp"] },
    },
  };
  const pages = demoServicePages(pack, 3);
  assert.deepEqual(Object.keys(pages), ["page1", "page2"]);
  assert.equal(pages.page2.image, "/2.webp");
  assert.deepEqual(pages.page2.images, ["/3.webp", "/1.webp"]);
  assert.equal(servicePages({ sections: pages }, 4).length, 2);
});

test("Standard shows only its included pages; later slots stay saved but unlisted", () => {
  const doc = { sections: { page1: { title: "Bridal" }, page2: { title: "Party" } } };
  assert.deepEqual(includedServicePageIds(), ["page1"]);
  assert.deepEqual(
    servicePages(doc).map((page) => page.id),
    ["page1"],
  );
  assert.deepEqual(Object.keys(demoServicePages({ sections: { services: { items: [{ name: "A" }, { name: "B" }] } } })), ["page1"]);
});
