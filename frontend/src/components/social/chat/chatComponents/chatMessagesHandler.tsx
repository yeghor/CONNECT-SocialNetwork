import React, {RefObject, useEffect, useRef, useState} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router";

import { queryClient } from "../../../../index.tsx";

import {
    ChatMessage,
    mapSingleMessage,
    mapWebsocketReceivedMessage,
    MessagesResponse
} from "../../../../fetching/responseDTOs.ts";
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
import MessageBar from "./messageBar.tsx";


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
    websocketRef: RefObject<WebSocket>;
    chatId: string;
    sendMessageCallable: (message: string, tempId: string) => void;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void;
}


const ChatMessagesHandler = (props: ChatMessageListProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ reRenderFlag, setReRenderFlag ] = useState<boolean>(false);

    const [ messages, setMessages ] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const currentChatQueryKeys = [ "chatMessages", props.chatId ]

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            createInfiniteQueryOptionsUtil(
                messagesFetcher,
                [ tokens, navigate, props.chatId ],
                currentChatQueryKeys
            )
        );


    const virtualizer = useVirtualizer({
        count: messages.length,
        estimateSize: () => 300,
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

    const changeMessageOptimistically = (message: string, messageId: string): void => {
        queryClient.setQueryData(currentChatQueryKeys, (oldData: { [key: number | string]: ChatMessage[] }) => {
            return oldData.map((msg) => {
                if (msg.messageId == messageId && msg.tempId === null) {
                    msg.text = message;
                }
                return msg;
            })
        });
        props.changeMessageCallable(message, messageId)
        
    };
    const deleteMessageOptimistically = (messageId: string): void => {
        queryClient.setQueryData(currentChatQueryKeys, (oldData: { [key: number | string]: ChatMessage[] }) => {
            return oldData.filter((msg) => {
                if (msg.tempId) { return true }
                return !(msg.messageId == messageId);
            });
        });
        props.deleteMessageCallable(messageId)
    };

    const sendMessageOptimistically = (message: string): void => {
        const tempId = crypto.randomUUID()

        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            if (!oldData) return oldData;

            const newMessage = mapSingleMessage(tempId, message, new Date(), { userId: crypto.randomUUID(), username: "",  avatarURL: null }, tempId);

            return {
                ...oldData,
                pages: oldData.pages.map((page: any, index: number) => {
                    if (index == 0) {
                        return [newMessage, ...page];
                    }
                    return page;
                })
            };
        })
        props.sendMessageCallable(message, tempId);
    }

    const updateSentMessage = (incomingMessage: ChatMessage): void => {
        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            return {
                ...oldData,
                pages: oldData.pages.map((page: ChatMessage[], index: any) => {
                    page.map((msg: ChatMessage) => {
                        if (msg.tempId === incomingMessage.tempId) {
                            incomingMessage.tempId = null;
                            return incomingMessage;
                        }
                        return msg                        
                    })
                    return page;
                })
            }
        });
    };

    const applyUpcomingWSMessage = (event: MessageEvent): void => {
        const incomingMessage = JSON.parse(event.data);
        const mappedMessage = mapWebsocketReceivedMessage(incomingMessage);

        switch (incomingMessage.action) {
            case "send":
                if (!mappedMessage.text) return;
                updateSentMessage(mapSingleMessage(mappedMessage.messageId, mappedMessage.text, mappedMessage.sent, mappedMessage.owner, mappedMessage.tempId));
                break;
            case "change":
                if (!mappedMessage.text) return;
                changeMessageOptimistically(mappedMessage.messageId, mappedMessage.text);
                break;
            case "delete":
                deleteMessageOptimistically(mappedMessage.messageId);
        }
    };

    const componentsProps = messages.map(msg => ({
        messageData: msg,
        changeMessageCallable: deleteMessageOptimistically,
        deleteMessageCallable: changeMessageOptimistically
    }));

    // Infinite querying effect
    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage]);

    // Websockets event assigner
    useEffect(() => {
        props.websocketRef.current.addEventListener("message", applyUpcomingWSMessage);
        return () => {
            props.websocketRef.current.removeEventListener("message", applyUpcomingWSMessage);
        }
    }, []);

    return (
        <div>
            <div
                ref={scrollRef}
                className="h-[600px] overflow-auto relative my-16"
            >
                <VirtualizedList
                    DisplayedComponent={ChatMessageComp}
                    virtualizer={virtualizer}
                    virtualItems={virtualItems}
                    componentsProps={componentsProps}
                />
            </div>
            <MessageBar sendMessageLocally={sendMessageOptimistically} />
        </div>
    );
};

export default ChatMessagesHandler;
