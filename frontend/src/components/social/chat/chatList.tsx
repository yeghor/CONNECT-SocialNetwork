import React, {useState, useEffect, useRef} from "react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {CookieTokenObject, getCookiesOrRedirect} from "../../../helpers/cookies/cookiesHandler.ts";
import {useInfiniteQuery} from "@tanstack/react-query";
import {
    createInfiniteQueryOptionsUtil,
    infiniteQieryingFetchGuard
} from "../../butterySmoothScroll/scrollVirtualizationUtils.ts";
import {fetchChats} from "../../../fetching/chatWS.ts";
import {safeAPICall} from "../../../fetching/fetchUtils.ts";
import {ChatResponse, ChatsResponse} from "../../../fetching/responseDTOs.ts";
import {useVirtualizer} from "@tanstack/react-virtual";
import VirtualizedList from "../../butterySmoothScroll/virtualizedList.tsx";

import FlowChat from "./flowChat.tsx";

const chatsFetcher = async (tokens: CookieTokenObject, navigate: NavigateFunction, page: number): Promise<ChatResponse[]> => {
    const fetchedChats = await safeAPICall<ChatsResponse>(tokens, fetchChats, navigate, undefined, page);

    if (fetchedChats.success) {
        return fetchedChats.data;
    }

    return [];
}

const ChatList = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(chatsFetcher, [tokens, navigate], ["chats"]))
    const [ chats, setChats ] = useState<ChatResponse[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: chats.length,
        estimateSize: () => 120,
        overscan: 16,
        getScrollElement: () => scrollRef.current
    });

    const virtualItems = virtualizer.getVirtualItems();

    const infiniteQuerying = async () => {
        const flatMapPChats = data?.pages.flatMap((page) => {if(page) { return page; }}).filter((chat) => chat !== undefined) ?? []
        setChats(flatMapPChats);

        const lastItem = virtualItems[virtualItems.length - 1]
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, chats.length)) await fetchNextPage();
    }

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage]);


    return(
        <div className="w-full rounded-xl bg-white/30 p-8 m-8">
            <div ref={scrollRef} className="h-screen overflow-auto m-16 relative mx-auto border-gray-300 rounded-xl">
                <VirtualizedList DisplayedComponent={FlowChat} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={chats} />
            </div>
        </div>
    );
};

export default ChatList;