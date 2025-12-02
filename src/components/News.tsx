"use server";

import Link from "next/link";

interface Post {
    id: string;
    title: string;
    body: string;
    tags: string;
    views: number;
    userId: number;
    reactions: {
        likes: number;
        dislikes: number;
    };
}

async function getPosts(): Promise<Post[]> {
    const response = await fetch("https://dummyjson.com/posts");
    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }
    return response.json();
}

export default async function News() {
    const posts = await getPosts();
    return (
        <section>
            <ul>
                {posts.posts.map((post) => (
                    <Link
                        href={`http://localhost:3000/posts/${post.id}`}
                        key={post.id}
                        className="inline-flex flex-col p-4 hover:translate-x-2 transaction-all duration-300 cursor-pointer hover:bg-stone-100 rounded-lg"
                    >
                        <h2 className="text-xl font-semibold text-stone-800 hover:underline ">
                            {post.title}
                        </h2>
                        <p className="text-lg text-stone-600">
                            {post.body.slice(0, 100) + "...."}
                        </p>
                    </Link>
                ))}
            </ul>
        </section>
    );
}
