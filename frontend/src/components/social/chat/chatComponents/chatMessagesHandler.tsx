import React, {RefObject, useEffect, useRef, useState, useMemo} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router";

import { queryClient } from "../../../../index.tsx";

import {
    ChatMessage,
    ChatParticipant,
    mapSingleMessage,
    mapWebsocketReceivedMessage,
    MessagesResponse,
} from "../../../../fetching/responseDTOs.ts";
import { CookieTokenObject, getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler.ts";
import { NavigateFunction } from "react-router-dom";
import { safeAPICall } from "../../../../fetching/fetchUtils.ts";
import { fetchChatMessagesBatch } from "../../../../fetching/fetchChatWS.ts";

import VirtualizedList from "../../../butterySmoothScroll/virtualizedList.tsx";
import {
    createInfiniteQueryOptionsUtil,
    infiniteQieryingFetchGuard
} from "../../../butterySmoothScroll/scrollVirtualizationUtils.ts";

import FlowMessage, { ChatMessageProps } from "./message.tsx";
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
    isGroup: boolean;
    participantsData: ChatParticipant[];
    sendMessageCallable: (message: string, tempId: string) => void;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void;
}


const ChatMessagesHandler = (props: ChatMessageListProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    // There is no change, that user isn't on participants data, so passing as ChatParticipantData type
    const meAsParticipantData: ChatParticipant = props.participantsData.find((participant) => participant.me) as ChatParticipant

    const scrollRef = useRef<HTMLDivElement>(null);

    const currentChatQueryKeys = [ "chatMessages", props.chatId ]

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            createInfiniteQueryOptionsUtil(
                messagesFetcher,
                [ tokens, navigate, props.chatId ],
                currentChatQueryKeys
            )
        )

    const messages: ChatMessage[] = data?.pages.flatMap(page => page ?? []) ?? [];

    const virtualizer = useVirtualizer({
        count: messages.length,
        estimateSize: () => 200,
        overscan: 5,
        getScrollElement: () => scrollRef.current,
        measureElement: el => el?.getBoundingClientRect().height
    });


    const virtualItems = virtualizer.getVirtualItems();

    const infiniteQuerying = async () => {
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

    /**
     * @param isRemoteUpdate - If true, the update originated from another user.
     * If false, the update is local and triggers a network request.
     * * @remarks
     * This function handles both local UI updates and remote synchronization. 
     * It filters for messages where `tempId === null` to ensure we only edit 
     * messages already confirmed by the server.
     **/
    const changeMessageOptimistically = (message: string, messageId: string, isRemoteUpdate: boolean): void => {
        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            return {
                ...oldData,
                pages: [ ...oldData.pages ].map((page: ChatMessage[]) => {
                    return page.map((msg: ChatMessage) => {
                        if (msg.messageId == messageId && msg.tempId === null) {
                            const newMsg = { ...msg };
                            newMsg.text = message;
                            return newMsg;
                        }
                        return msg;                      
                    })
                })
            }
        });
        if (!isRemoteUpdate) {
            props.changeMessageCallable(message, messageId);
        }
    };

    /**
     * @param isRemoteUpdate - If true, the update originated from another user.
     * If false, the update is local and triggers a network request.
     * * @remarks
     * This function handles both local UI updates and remote synchronization. 
     * It filters for messages where `tempId === null` to ensure we only edit 
     * messages already confirmed by the server.
     **/
    const deleteMessageOptimistically = (messageId: string, isRemoteUpdate: boolean): void => {
        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            return {
                ...oldData,
                pages: [ ...oldData.pages ].map((page: ChatMessage[]) => {
                    return page.filter((msg: ChatMessage) => {
                        return !(msg.messageId == messageId);                       
                    })
                })
            }
        });
        if (!isRemoteUpdate) {
            props.deleteMessageCallable(messageId);
        }
    };

    const sendMessageOptimistically = (message: string,): void => {
        const tempId = crypto.randomUUID();

        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            if (!oldData) return oldData;

            // TODO: add user's owner data
            const newMessage = mapSingleMessage(tempId, message, new Date(), { userId: meAsParticipantData.userId, username: meAsParticipantData.username,  avatarURL: meAsParticipantData.avatarURL }, true,  tempId);
            const newFirstPage: any = [ newMessage, ...oldData.pages[0] ]; 
            
            return {
                ...oldData,
                pages: [ newFirstPage, ...oldData.pages.slice(1) ]
            };
        });

            props.sendMessageCallable(message, tempId);
        }

    const updateOrApplySentMessage = (incomingMessage: ChatMessage): void => {
        // cancelQueries is required, because without it first chat message will act unpredictable
        queryClient.cancelQueries()
        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            let messageApplied = false;

            const newFirstPage: ChatMessage[] = oldData.pages[0].map((msg: ChatMessage) => {
                if (incomingMessage.tempId && (msg.tempId === incomingMessage.tempId || msg.messageId === incomingMessage.tempId)) {
                    // Message that is recorded to the DB doesn't need tempId
                    messageApplied = true;
                    return { ...incomingMessage, tempId: null };
                } 
                return msg;                
            })

            // Nulling tempId in case the message isn't applied yet
            incomingMessage.tempId = null;

            return {
                ...oldData,
                pages: messageApplied ? [ newFirstPage, ...oldData.pages.slice(1) ] : [ [ { ...incomingMessage, tempId: null }, ...oldData.pages[0]  ], ...oldData.pages.slice(1) ]
            };
        });
    };

    const applyUpcomingWSMessage = (event: MessageEvent): void => {
        const incomingMessage = JSON.parse(event.data);  
        let mappedMessage = mapWebsocketReceivedMessage(incomingMessage);
        console.log("incoming ws message, ", incomingMessage)
        switch (incomingMessage.action) {
            case "send":
                if (!mappedMessage.text) return;
                // See responseDTOs.ts line:489 for explanation
                // @ts-ignore
                updateOrApplySentMessage(mapSingleMessage(mappedMessage.messageId, mappedMessage.text, mappedMessage.sent, mappedMessage.owner, mappedMessage.me, mappedMessage.tempId));
                break;
            case "change":
                if (!mappedMessage.text) return;
                changeMessageOptimistically(mappedMessage.text, mappedMessage.messageId, true);
                break;
            case "delete":
                deleteMessageOptimistically(mappedMessage.messageId, true);
        }
    };


    const fallbackUserID = crypto.randomUUID();
    const componentsProps: ChatMessageProps[] = messages.map(msg => {
        return {
            messageData: msg,
            // Passing temporary fake user data as a fallback, in case we didn't find owner data
            // When chatId changes, participantsData updates with a delay
            // Passing undefined to ownerData to flowMessage would crush the component. 
            ownerData: msg.tempId ? meAsParticipantData : (props.participantsData.find((participant) => participant.userId == msg.owner.userId) ?? { userId: fallbackUserID, username: "Loading", avatarURL: null, me: false }) as ChatParticipant,
            // Only pending messags have tempId value
            isSending: msg.tempId !== null,
            isGroup: props.isGroup,
            changeMessageCallable: (message, messageId) => changeMessageOptimistically(message, messageId, false),
            deleteMessageCallable: (messageId) => deleteMessageOptimistically(messageId, false)
        }
    });

    // Infinite querying effect
    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage, props.chatId]);

    // Websockets event listener assigner effect
    useEffect(() => {
        props.websocketRef.current.addEventListener("message", applyUpcomingWSMessage);
        return () => {
            props.websocketRef.current.removeEventListener("message", applyUpcomingWSMessage);
        }
    }, [props.chatId]);

    // https://github.com/TanStack/virtual/discussions/195 Thank You
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const invertedWheelScroll = (event: WheelEvent) => {
            el.scrollTop -= event.deltaY*10;
            event.preventDefault();
        };

        el.addEventListener('wheel', invertedWheelScroll, false);

        return () => {
            el.removeEventListener('wheel', invertedWheelScroll, false);
        };
    }, [scrollRef.current]);

    return (
        <div className="pb-6">
            <div>
                <button className="bg-white/10 hover:bg-white/20 text-white text-[11px] uppercase font-bold tracking-wider px-5 py-2.5 rounded-xl border border-white/10 transition-all active:scale-95" onClick={() => virtualizer.scrollToIndex(0, { align: "start" })}>Scroll bottom</button>
            </div>

            <div
                ref={scrollRef}
                className="h-[calc(100vh-580px)] overflow-auto scroll-smooth my-16 mx-4"
                style={{
                    // https://github.com/TanStack/virtual/discussions/195 Thank You
                    transform: "scaleY(-1)"
                }}
            >
                <VirtualizedList
                    DisplayedComponent={FlowMessage}
                    virtualizer={virtualizer}
                    virtualItems={virtualItems}
                    componentsProps={componentsProps}
                    reverse={true}
                />
            </div>
            <MessageBar sendMessageLocally={sendMessageOptimistically} />
        </div>
    );
};

export default ChatMessagesHandler;
