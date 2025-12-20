import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router";

import { ChatMessage, MessagesResponse } from "../../../../fetching/responseDTOs.ts";
import { CookieTokenObject, getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler.ts";
import { NavigateFunction } from "react-router-dom";
import { safeAPICall } from "../../../../fetching/fetchUtils.ts";
import { fetchChatMessagesBatch } from "../../../../fetching/chatWS.ts";

import VirtualizedList from "../../../butterySmoothScroll/virtualizedList.tsx";
import {
    createInfiniteQueryOptionsUtil,
    infiniteQieryingFetchGuard
} from "../../../butterySmoothScroll/scrollVirtualizationUtils.ts";

import ChatMessageComp from "./message.tsx";

interface ChatProps {
    chatId: string;
}

const messagesFetcher = async (
    tokens: CookieTokenObject,
    navigate: NavigateFunction,
    chatId: string,
    page: number
): Promise<ChatMessage[]> => {

    const fetched = await safeAPICall<MessagesResponse>(
        tokens,
        fetchChatMessagesBatch,
        navigate,
        undefined,
        chatId,
        page
    );

    return fetched.success ? fetched.data : [];
};

interface ChatMessageListProps {
    chatId: string;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void
}


const MessagesList = (props: ChatMessageListProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            createInfiniteQueryOptionsUtil(
                messagesFetcher,
                [tokens, navigate, props.chatId],
                ["chatMessages", props.chatId]
            )
        );

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: messages.length,
        estimateSize: () => 72,
        overscan: 20,
        getScrollElement: () => scrollRef.current,
        measureElement: el => el?.getBoundingClientRect().height
    });

    const virtualItems = virtualizer.getVirtualItems();

    const infiniteQuerying = async () => {
        const flatMessages =
            data?.pages.flatMap(page => page ?? []) ?? [];

        setMessages(flatMessages);

        const lastItem = virtualItems[virtualItems.length - 1];

        if (
            infiniteQieryingFetchGuard(
                hasNextPage,
                isFetchingNextPage,
                lastItem,
                messages.length
            )
        ) {
            await fetchNextPage();
        }
    };

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage]);

    const componentsProps = messages.map(msg => ({
        messageData: msg,
        changeMessageCallable: props.changeMessageCallable,
        deleteMessageCallable: props.deleteMessageCallable
    }));

    return (
        <div
            ref={scrollRef}
            className="h-screen overflow-auto relative"
        >
            <VirtualizedList
                DisplayedComponent={ChatMessageComp}
                virtualizer={virtualizer}
                virtualItems={virtualItems}
                componentsProps={componentsProps}
            />
        </div>
    );
};

export default MessagesList;
