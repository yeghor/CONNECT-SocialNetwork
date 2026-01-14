import React from "react";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";

// TODO: Add generics to props
interface VirtualizedListProps {
    DisplayedComponent: any, // TODO: add react component type to prevent TS from arguing ^_^
    virtualizer: Virtualizer<HTMLDivElement, Element>,
    virtualItems: VirtualItem[],
    componentsProps: any[],
    reverse?: boolean,
    interactive?: boolean
}

/*
* Use the list with outer divs structure like this:
* ```
* <div ref={scrollRef} className="mx-auto w-2/3 mb-16 h-[800px] overflow-y-auto flex flex-col gap-4">
*   <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
*     <VirtualizedList ... />
*   </div>
* </div>
*
*
* */
const VirtualizedList = ({ DisplayedComponent, virtualizer, virtualItems, componentsProps, reverse = false, interactive = false }: VirtualizedListProps) => {
    return(
        <div className={`relative ${reverse ? "flex flex-col-reverse" : null}`} style={{height: `${virtualizer.getTotalSize()}px`}}>
            {
                virtualItems.map((vItem) => {
                    return (
                        <div
                            key={vItem.key}
                            className="absolute top-0 left-0 w-full"
                            /*  */
                            data-index={vItem.index} //needed for dynamic row height measurement
                            ref={(node) => virtualizer.measureElement(node)} //measure dynamic row height
                            style={
                                {
                                    // https://github.com/TanStack/virtual/discussions/195 THANK YOU
                                    transform: `translateY(${vItem.start}px) ${reverse ? "scaleY(-1)" : ""}`,
                                }
                            }>
                            <div className={`hover:border-white hover:border-3 transition-all`}>
                                <DisplayedComponent {...componentsProps[vItem.index]} />
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default VirtualizedList;