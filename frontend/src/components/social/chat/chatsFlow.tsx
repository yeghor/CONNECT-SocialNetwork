import React, { useState, useEffect, useRef, useContext } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { CookieTokenObject, getCookieTokens } from "../../../helpers/cookies/cookiesHandler.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    createInfiniteQueryOptionsUtil,
    infiniteQieryingFetchGuard
} from "../../butterySmoothScroll/scrollVirtualizationUtils.ts";
import { fetchChats, fetchNotApprovedChats, fetchNotApprovedChatsAmount } from "../../../fetching/fetchChatWS.ts";
import { safeAPICallPrivate } from "../../../fetching/fetchUtils.ts";
import { Chat, ChatsResponse, CustomSimpleResponse } from "../../../fetching/DTOs.ts";
import { useVirtualizer } from "@tanstack/react-virtual";
import VirtualizedList from "../../butterySmoothScroll/virtualizedList.tsx";

import FlowChat from "./flowChat.tsx";
import { TokensContext } from "../../../index.tsx";

const chatsFetcher = async (tokens: CookieTokenObject, navigate: NavigateFunction, approved: boolean, page: number): Promise<Chat[]> => {
    const fetcher = approved ? fetchChats : fetchNotApprovedChats

    const fetchedChats = await safeAPICallPrivate<ChatsResponse>(tokens, fetcher, navigate, undefined, page);

    if (fetchedChats.success) {
        return fetchedChats.data;
    }

    return [];
}

const ChatsFlow = (props: { showGroupCreationModelToggler: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate();
    const tokens = useContext(TokensContext).tokens;

    const [ showApprovedChats, setShowApprovedChats ] = useState(true);
    const [ notApprovedChatsAmount, setNotApprovedChatsAmount ] = useState(0);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(chatsFetcher, [tokens, navigate, showApprovedChats], ["chatsList", showApprovedChats]))
    const [ chats, setChats ] = useState<Chat[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: chats.length,
        estimateSize: () => 120,
        overscan: 3,
        getScrollElement: () => scrollRef.current,
        gap: 8
    });

    const virtualItems = virtualizer.getVirtualItems();

    //@ts-ignore
    const flatMapPChats = data?.pages.flatMap((page) => {if(page) { return page; }}).filter((chat) => chat !== undefined) ?? []

    const infiniteQuerying = async () => {
        setChats(flatMapPChats);
        const lastItem = virtualItems[virtualItems.length - 1]
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, chats.length)) await fetchNextPage();
    }

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage, showApprovedChats]);

    useEffect(() => {
        const fetcher = async () => {
            const response = await safeAPICallPrivate<CustomSimpleResponse<number>>(tokens, fetchNotApprovedChatsAmount, navigate, undefined)
            if (response.success) {
                setNotApprovedChatsAmount(response.content);
            }
        }
        fetcher();
    }, []);

    return(
        <div className="w-full rounded-2xl border border-white/10 px-6 mx-8 bg-white/5 backdrop-blur-xl shadow-xl">
            <div className="flex justify-start gap-3 text-white py-4 border-b border-white/10">
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex justify-center items-center ${
                        !showApprovedChats ? "bg-white/20" : "bg-white/10 hover:bg-white/15"
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
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex justify-center items-center ${
                        notApprovedChatsAmount > 0 ? (showApprovedChats  ? "bg-white/10 hover:bg-white/15" : "bg-white/20") : "bg-white/10 text-white/40"
                    }`}
                    onClick={() => {
                        if(showApprovedChats && notApprovedChatsAmount > 0) {
                            setShowApprovedChats((prevState) => !prevState);
                        }
                    }}
                >
                    Pending: {notApprovedChatsAmount}
                </button>
                <div className="w-full flex justify-end">
                    <button onClick={() => props.showGroupCreationModelToggler(true)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-sm transition-all flex justify-center items-center gap-2">
                        <span className="font-bold">+</span><span>Create Group</span>
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="h-[calc(100vh-400px)] overflow-auto relative mx-auto rounded-lg bg-white/5 border border-white/10 mt-4 p-3">
                <VirtualizedList DisplayedComponent={FlowChat} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={chats} interactive={true} />
            </div>
        </div>
    );
};

export default ChatsFlow;