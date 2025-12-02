export default async function PostPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const res = await fetch(`https://dummyjson.com/posts/${id}`);
    const post = await res.json();

    return (
        <section className="sm:p-12 p-6 sm:w-2xl m-auto">
            <div className="h-20 bg-slate-900 rounded mb-8"></div>
            <div>
                <h1 className="text-4xl font-semibold text-stone-900 italic">
                    {post.title}
                </h1>
                <ul className="flex items-center justify-start gap-3 text-stone-500">
                    {post.tags.map((tag: string) => {
                        return (
                            <li
                                key={tag}
                                className="text-sm mt-2 mb-6 capitalize"
                            >
                                {tag}
                            </li>
                        );
                    })}
                </ul>
                <p className="text-xl text-stone-800">{post.body}</p>
            </div>
        </section>
    );
}
