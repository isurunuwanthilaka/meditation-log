import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { createPost, listPosts, toggleBow } from "../lib/feed-store";

beforeAll(() => {
  delete process.env.POSTGRES_URL;
});

describe("feed-store (in-memory fallback)", () => {
  it("lists the seeded posts for any owner", async () => {
    const posts = await listPosts(randomUUID());
    expect(posts.length).toBeGreaterThanOrEqual(4);
    expect(posts.every((post) => post.bowed === false)).toBe(true);
  });

  it("creates a post authored by the given member, tagged Shared", async () => {
    const ownerId = randomUUID();
    const post = await createPost({ title: "A quiet talk", link: "" }, ownerId, "Priya");

    expect(post.authorName).toBe("Priya");
    expect(post.title).toBe("A quiet talk");
    expect(post.tag).toBe("Shared");
    expect(post.note).toBe("Shared with the community.");
    expect(post.bows).toBe(0);

    const posts = await listPosts(ownerId);
    expect(posts[0].id).toBe(post.id);
  });

  it("uses the link as the note when one is provided", async () => {
    const ownerId = randomUUID();
    const post = await createPost({ title: "Worth a read", link: "https://example.com" }, ownerId, "Nadia");
    expect(post.note).toBe("https://example.com");
  });

  it("toggles a bow per-owner without affecting other viewers' counts", async () => {
    const ownerId = randomUUID();
    const other = randomUUID();
    const created = await createPost({ title: "On attention", link: "" }, ownerId, "Jonah");

    const bowed = await toggleBow(created.id, ownerId);
    expect(bowed?.bowed).toBe(true);
    expect(bowed?.bows).toBe(1);

    const fromOther = await listPosts(other);
    const seenByOther = fromOther.find((p) => p.id === created.id);
    expect(seenByOther?.bowed).toBe(false);
    expect(seenByOther?.bows).toBe(1);

    const unbowed = await toggleBow(created.id, ownerId);
    expect(unbowed?.bowed).toBe(false);
    expect(unbowed?.bows).toBe(0);
  });

  it("returns null when toggling a bow on a missing post", async () => {
    const result = await toggleBow(randomUUID(), randomUUID());
    expect(result).toBeNull();
  });
});
