import React, { useState, useEffect, useRef } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { CookieTokenObject, getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    createInfiniteQueryOptionsUtil,
    infiniteQieryingFetchGuard
} from "../../butterySmoothScroll/scrollVirtualizationUtils.ts";
import { fetchChats, fetchNotApprovedChats, fetchNotApprovedChatsAmount } from "../../../fetching/fetchChatWS.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { Chat, ChatsResponse, CustomSimpleResponse } from "../../../fetching/responseDTOs.ts";
import { useVirtualizer } from "@tanstack/react-virtual";
import VirtualizedList from "../../butterySmoothScroll/virtualizedList.tsx";

import FlowChat from "./flowChat.tsx";

const chatsFetcher = async (tokens: CookieTokenObject, navigate: NavigateFunction, approved: boolean, page: number): Promise<Chat[]> => {
    const fetcher = approved ? fetchChats : fetchNotApprovedChats

    const fetchedChats = await safeAPICall<ChatsResponse>(tokens, fetcher, navigate, undefined, page);

    if (fetchedChats.success) {
        return fetchedChats.data;
    }

    return [];
}

const ChatsFlow = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ showApprovedChats, setShowApprovedChats ] = useState(true);
    const [ notApprovedChatsAmount, setNotApprovedChatsAmount ] = useState(0);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(chatsFetcher, [tokens, navigate, showApprovedChats], ["chats", showApprovedChats]))
    const [ chats, setChats ] = useState<Chat[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: chats.length,
        estimateSize: () => 120,
        overscan: 3,
        getScrollElement: () => scrollRef.current
    });

    const virtualItems = virtualizer.getVirtualItems();

    const flatMapPChats = data?.pages.flatMap((page) => {if(page) { return page; }}).filter((chat) => chat !== undefined) ?? []

    const infiniteQuerying = async () => {
        setChats(flatMapPChats);
        const lastItem = virtualItems[virtualItems.length - 1]
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, chats.length)) await fetchNextPage();
    }

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        const fetcher = async () => {
            const response = await safeAPICall<CustomSimpleResponse<number>>(tokens, fetchNotApprovedChatsAmount, navigate, undefined)
            if (response.success) {
                setNotApprovedChatsAmount(response.content);
            }
        }
        fetcher();
    }, []);

    return(
        <div className="w-full rounded-xl border border-white/20 border-2 p-4 mx-8">
            <div className="flex justify-center gap-2 text-white m-4">
                <button
                    className={`px-4 py-2 rounded-3xl ${
                        !showApprovedChats ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30"
                    }`}
                    onClick={() => {
                        if(!showApprovedChats) {
                            setShowApprovedChats((prevState) => !prevState);
                        }
                    }}
                >
                    Your Chats
                </button>
                <button
                    className={`px-4 py-2 rounded-3xl ${
                        notApprovedChatsAmount > 0 ? (showApprovedChats  ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30") : "bg-white/10 text-gray-300"
                    }`}
                    onClick={() => {
                        if(showApprovedChats && notApprovedChatsAmount > 0) {
                            setShowApprovedChats((prevState) => !prevState);
                        }
                    }}
                >
                    Pending: {notApprovedChatsAmount}
                </button>
            </div>

            <div ref={scrollRef} className="h-[calc(100vh-400px)] overflow-auto relative mx-auto border-gray-300 rounded-xl">
                <VirtualizedList DisplayedComponent={FlowChat} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={chats} interactive={true} />
            </div>
        </div>
    );
};

export default ChatsFlow;