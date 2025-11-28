import React from "react";
import {VirtualItem, Virtualizer} from "@tanstack/react-virtual";
import FlowPost from "../social/post/flowPost.tsx";

interface VirtualizedListProps {
    DisplayedComponent: any, // TODO: add react component type
    virtualizer: Virtualizer<HTMLDivElement, Element>,
    virtualItems: VirtualItem[],
    allData: any[],
    componentProps: {}[]
}

const VirtualizedList = ({ DisplayedComponent, virtualizer, virtualItems, allData, componentProps }: VirtualizedListProps) => {
    return(
        <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
            {
                virtualItems.map((vItem) => {
                    const post = allData[vItem.index];
                    return (
                        <div key={post.postId + vItem.index} className="absolute top-0 left-0 w-full" data-index={vItem.index}
                             style={
                                 {
                                     transform: `translateY(${vItem.start}px)`,
                                     height: `${vItem.size}px`,
                                 }
                             }>
                            <div className="hover:-translate-y-0.5 hover:border-white hover:border-3 transition-all">
                                <DisplayedComponent {...componentProps[vItem.index]} />
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default VirtualizedList;