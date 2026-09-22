import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import { FeedPost, FeedPostInput } from "@meditation-log/shared";

type MemoryPost = {
  id: string;
  authorName: string;
  title: string;
  link: string;
  note: string;
  tag: string;
  baseBows: number;
  bowedBy: Set<string>;
  createdAt: string;
};

const HOUR = 3_600_000;
const DAY = 86_400_000;

function seedPosts(): MemoryPost[] {
  const now = Date.now();
  return [
    {
      id: randomUUID(),
      authorName: "Nadia",
      title: "On sitting when you do not feel like it",
      link: "",
      note: "Short piece from a teacher I follow. The line about 'the practice is the showing up' has been rattling around all week.",
      tag: "Article",
      baseBows: 14,
      bowedBy: new Set(),
      createdAt: new Date(now - 2 * HOUR).toISOString(),
    },
    {
      id: randomUUID(),
      authorName: "Tomas",
      title: "Breath counting, plainly explained",
      link: "",
      note: "Good for anyone who finds the instructions too vague. Ten minutes to read.",
      tag: "Guide",
      baseBows: 9,
      bowedBy: new Set(),
      createdAt: new Date(now - DAY).toISOString(),
    },
    {
      id: randomUUID(),
      authorName: "Priya",
      title: "A talk on grief and attention",
      link: "",
      note: "Forty minutes. Worth the walk it takes to listen to it.",
      tag: "Talk",
      baseBows: 22,
      bowedBy: new Set(),
      createdAt: new Date(now - 2 * DAY).toISOString(),
    },
    {
      id: randomUUID(),
      authorName: "Jonah",
      title: "Why streaks work, and where they stop working",
      link: "",
      note: "Useful caution. Do not let the grid become the reason you sit.",
      tag: "Article",
      baseBows: 31,
      bowedBy: new Set(),
      createdAt: new Date(now - 7 * DAY).toISOString(),
    },
  ];
}

let memoryPosts: MemoryPost[] = seedPosts();

const hasPostgres = Boolean(process.env.POSTGRES_URL);

async function ensureTable() {
  if (!hasPostgres) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS feed_posts (
      id UUID PRIMARY KEY,
      author_name TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL,
      tag TEXT NOT NULL,
      base_bows INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS feed_bows (
      post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL,
      PRIMARY KEY (post_id, owner_id)
    );
  `;

  const { rows } = await sql`SELECT count(*)::int AS count FROM feed_posts;`;
  if (rows[0]?.count === 0) {
    for (const post of seedPosts()) {
      await sql`
        INSERT INTO feed_posts (id, author_name, title, link, note, tag, base_bows, created_at)
        VALUES (${post.id}, ${post.authorName}, ${post.title}, ${post.link}, ${post.note}, ${post.tag}, ${post.baseBows}, ${post.createdAt});
      `;
    }
  }
}

function toFeedPost(post: MemoryPost, ownerId: string): FeedPost {
  return {
    id: post.id,
    authorName: post.authorName,
    title: post.title,
    link: post.link,
    note: post.note,
    tag: post.tag,
    bows: post.baseBows + post.bowedBy.size,
    bowed: post.bowedBy.has(ownerId),
    createdAt: post.createdAt,
  };
}

export async function listPosts(ownerId: string): Promise<FeedPost[]> {
  if (!hasPostgres) {
    return [...memoryPosts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((post) => toFeedPost(post, ownerId));
  }

  await ensureTable();
  const { rows } = await sql`
    SELECT p.id, p.author_name, p.title, p.link, p.note, p.tag, p.base_bows, p.created_at,
      (SELECT count(*)::int FROM feed_bows b WHERE b.post_id = p.id) AS bow_count,
      EXISTS(SELECT 1 FROM feed_bows b WHERE b.post_id = p.id AND b.owner_id = ${ownerId}) AS bowed
    FROM feed_posts p
    ORDER BY p.created_at DESC;
  `;

  return rows.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    title: row.title,
    link: row.link,
    note: row.note,
    tag: row.tag,
    bows: row.base_bows + row.bow_count,
    bowed: row.bowed,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function createPost(
  input: FeedPostInput,
  ownerId: string,
  authorName: string,
): Promise<FeedPost> {
  const note = input.link.trim() || "Shared with the community.";
  const createdAt = new Date().toISOString();

  if (!hasPostgres) {
    const post: MemoryPost = {
      id: randomUUID(),
      authorName,
      title: input.title,
      link: input.link,
      note,
      tag: "Shared",
      baseBows: 0,
      bowedBy: new Set(),
      createdAt,
    };
    memoryPosts = [post, ...memoryPosts];
    return toFeedPost(post, ownerId);
  }

  await ensureTable();
  const id = randomUUID();
  await sql`
    INSERT INTO feed_posts (id, author_name, title, link, note, tag, base_bows, created_at)
    VALUES (${id}, ${authorName}, ${input.title}, ${input.link}, ${note}, 'Shared', 0, ${createdAt});
  `;

  return { id, authorName, title: input.title, link: input.link, note, tag: "Shared", bows: 0, bowed: false, createdAt };
}

export async function toggleBow(postId: string, ownerId: string): Promise<FeedPost | null> {
  if (!hasPostgres) {
    const post = memoryPosts.find((p) => p.id === postId);
    if (!post) {
      return null;
    }
    if (post.bowedBy.has(ownerId)) {
      post.bowedBy.delete(ownerId);
    } else {
      post.bowedBy.add(ownerId);
    }
    return toFeedPost(post, ownerId);
  }

  await ensureTable();
  const { rows: existing } = await sql`
    SELECT 1 FROM feed_bows WHERE post_id = ${postId} AND owner_id = ${ownerId};
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM feed_bows WHERE post_id = ${postId} AND owner_id = ${ownerId};`;
  } else {
    await sql`INSERT INTO feed_bows (post_id, owner_id) VALUES (${postId}, ${ownerId});`;
  }

  const [post] = await listPosts(ownerId).then((posts) => posts.filter((p) => p.id === postId));
  return post ?? null;
}
