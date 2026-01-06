import React, {RefObject, useEffect, useRef, useState} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router";

import { queryClient } from "../../../../index.tsx";

import {
    ChatMessage,
    ChatParticipantData,
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

import ChatMessageComp, { ChatMessageProps } from "./message.tsx";
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
    participantsData: ChatParticipantData[];
    sendMessageCallable: (message: string, tempId: string) => void;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void;
}


const ChatMessagesHandler = (props: ChatMessageListProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    // There is no change, that user isn't on participants data, so passing as ChatParticipantData type
    const meAsParticipantData: ChatParticipantData = props.participantsData.find((participant) => participant.me) as ChatParticipantData

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

    const changeMessageOptimistically = (message: string, messageId: string): void => {
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

        props.changeMessageCallable(message, messageId)
        
    };
    const deleteMessageOptimistically = (messageId: string): void => {
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
        props.deleteMessageCallable(messageId);
    };

    const sendMessageOptimistically = (message: string): void => {
        const tempId = crypto.randomUUID();

        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            if (!oldData) return oldData;

            // TODO: add user's owner data
            const newMessage = mapSingleMessage(tempId, message, new Date(), { userId: meAsParticipantData.userId, username: meAsParticipantData.username,  avatarURL: meAsParticipantData.avatarURL }, tempId);
            console.log("new message ", newMessage)
            const newFirstPage: any = [ newMessage, ...oldData.pages[0] ]; 
            
            return {
                ...oldData,
                pages: [ newFirstPage, ...oldData.pages.slice(1) ]
            };
        });

            props.sendMessageCallable(message, tempId);
        }

    const updateOrApplySentMessage = (incomingMessage: ChatMessage): void => {
        queryClient.setQueryData(currentChatQueryKeys, (oldData: any) => {
            let appliedMessage = false;

            const newFirstPage: ChatMessage[] = oldData.pages[0].map((msg: ChatMessage) => {
                if (incomingMessage.tempId && (msg.tempId === incomingMessage.tempId || msg.messageId === incomingMessage.tempId)) {
                    // Message that is recorded to the DB doesn't need tempId
                    incomingMessage.tempId = null;
                    appliedMessage = true;
                    return incomingMessage;
                } 
                return msg;                
            })

            // Nulling tempId in case the message isn't ours
            incomingMessage.tempId = null;

            return {
                ...oldData,
                pages: [ appliedMessage ? newFirstPage : [incomingMessage, ...newFirstPage], ...oldData.pages.slice(1) ]
            };
        });
    };

    const applyUpcomingWSMessage = (event: MessageEvent): void => {
        const incomingMessage = JSON.parse(event.data);
        console.log(incomingMessage)
        let mappedMessage = mapWebsocketReceivedMessage(incomingMessage);

        switch (incomingMessage.action) {
            case "send":
                if (!mappedMessage.text) return;
                // See responseDTOs.ts line:489 for explanation
                //@ts-ignore
                updateOrApplySentMessage(mapSingleMessage(mappedMessage.messageId, mappedMessage.text, mappedMessage.sent, mappedMessage.owner, mappedMessage.tempId));
                break;
            case "change":
                if (!mappedMessage.text) return;
                changeMessageOptimistically(mappedMessage.text, mappedMessage.messageId);
                break;
            case "delete":
                console.log("at least mapped")
                deleteMessageOptimistically(mappedMessage.messageId);
        }
    };


    const componentsProps: ChatMessageProps[] = messages.map(msg => {
        return {
            messageData: msg,
            ownerData: msg.tempId ? meAsParticipantData : (props.participantsData.find((participant) => participant.userId == msg.owner.userId)) as ChatParticipantData,
            // Only pending messags have tempId value
            isSending: msg.tempId !== null,
            changeMessageCallable: changeMessageOptimistically,
            deleteMessageCallable: deleteMessageOptimistically
        }
    });

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

    // // https://github.com/TanStack/virtual/discussions/195 Thank You
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const invertedWheelScroll = (event: WheelEvent) => {
            el.scrollTop -= event.deltaY*5;
            // el.scrollTo({
            //     // Multiplying by 10 to make scroll more convinient
            //     top: el.scrollTop -= event.deltaY*5,
            // })
            event.preventDefault();
        };

        el.addEventListener('wheel', invertedWheelScroll, false);

        return () => {
            el.removeEventListener('wheel', invertedWheelScroll, false);
        };
    }, [scrollRef.current]);

    return (
        <div>
            <button className="bg-white p-1 text-black" onClick={() => virtualizer.scrollBy(750 , { behavior: "smooth" })}>Scroll up</button>
            <button className="bg-white p-1 text-black" onClick={() => virtualizer.scrollToIndex(0)}>Scroll down</button>
            <div
                ref={scrollRef}
                className="h-[600px] overflow-auto scroll-smooth my-16 mx-4"
                style={{
                    // https://github.com/TanStack/virtual/discussions/195 Thank You
                    transform: "scaleY(-1)"
                }}
            >
                <VirtualizedList
                    DisplayedComponent={ChatMessageComp}
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
