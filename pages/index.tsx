import { useState } from "react";
import Layout from "../components/Layout";

export default function Top() {
    const [rootList] = useState([...Array(100)]);
    const [displayList, setDisplayList] = useState(rootList.slice(0, 10));
    const [hasMore, setHasMore] = useState(rootList.length > 10);

    const displayMore = () => {
        const displayListLen = displayList.length;
        const moreItems = rootList.slice(0, displayListLen + 10);
        if (moreItems.length === rootList.length) {
            setHasMore(false);
        }
        setDisplayList(moreItems);
    };

    return (
        <Layout>
            <div className="flex-center">
                <div className="w-full flex flex-col flex-center mb-16">
                    <div className="flex justify-center flex-wrap items-end container">
                        {displayList.map((_, i) => (
                            <div className="w-3/4 mt-8 xl:max-w-lg xl:mx-4 2xl:max-w-xl border-b border-solid border-gray-300">
                                <p className="text-2xl font-semibold whitespace-pre-wrap opacity-75">小説{i + 1}のタイトル</p>
                                <div className="flex justify-between mt-1 items-baseline">
                                    <p className="opacity-75">小説の作者</p>
                                    <p className="text-sm opacity-50">小説の文字数</p>
                                </div>
                            </div>
                        ))}
                        <div className="w-full max-w-xl mx-4"></div>
                    </div>
                    {hasMore && (
                        <button className="my-4 p-2 border border-solid border-gray-300" onClick={() => displayMore()}>
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
}
