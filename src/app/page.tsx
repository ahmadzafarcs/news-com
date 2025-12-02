import News from "@/components/News";

export default function Home() {
    return (
        <div className="sm:p-12 p-6 sm:w-2xl m-auto">
            <header className="mb-8">
                <h4 className="text-xl text-stone-600 underline italic">
                    News.com
                </h4>
            </header>
            <News />
        </div>
    );
}
