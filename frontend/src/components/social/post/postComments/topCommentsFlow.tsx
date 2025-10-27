import React, {useState, useEffect, useRef} from "react";

import PostComments from "./postComments.tsx";

import { PostCommentsResponse } from "../../../../fetching/responseDTOs.ts";
import { getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler.ts"
import commentFetchHelper, { CommentProps } from "./commentFetchHelper.ts";
import { useNavigate } from "react-router";
import { useVirtualizer } from "@tanstack/react-virtual";


const CommentsFlow = (props: CommentProps) => {
    if(!props.originalPostData) {
        return null;
    }

    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ postComments, setPostComments ] = useState<PostCommentsResponse | undefined>();
    const [ page, setPage ] = useState(0);
    const [ loadMoreTrigger, setLoadMoreTrigger ] = useState<boolean>(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count:  postComments?.data?.length ?? 0,
        estimateSize: () => 200,
        getScrollElement: () => scrollRef.current,
        // Should re calculate virtual scroll elements positions when changing element
        measureElement: (element) => element.getBoundingClientRect().height
    });

    useEffect(() => {
        const fetchWrapper = async () => {
            const response = await commentFetchHelper(tokens, props.originalPostData.postId, page, navigate);
            if(response) {
                setPostComments(response);
            }
        }
        fetchWrapper();
    }, [loadMoreTrigger, setLoadMoreTrigger, page, setPage]);

    const loadMoreClick = (): void => {
        setLoadMoreTrigger(!loadMoreTrigger);
        setPage((prevState) => prevState + 1);
    }

    return (
        <div ref={scrollRef} className="h-screen overflow-y-auto flex flex-col gap-4">
            <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                {
                    virtualizer.getVirtualItems().map((vItem) => {
                        // Add props passing
                        const commentData = postComments?.data?.[vItem.index];
                        if(!commentData) { return null; }
                        return (
                            <div
                                key={vItem.key}
                                style={{
                                        transform: `translateY(${vItem.start}px)`,
                                        height: `${vItem.size}px`
                                    }}
                                className="absolute top-0 left-0 w-full"
                            >
                                <PostComments originalPostData={commentData} />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
};

export default CommentsFlow;