import { infiniteQueryOptions } from "@tanstack/react-query"
import { VirtualItem } from "@tanstack/react-virtual";

/*
* Make sure that fetcherArgs in a right order with fetcher args.
* Make sure that fetcher is a custom wrapper over real fetcher and takes page as a last param
*/
export const createInfiniteQueryOptionsUtil = (fetcher: CallableFunction, fetcherArgs: any[], queryKeys: any[]) => {
    return infiniteQueryOptions({
            queryKey: queryKeys,
            queryFn: ({ pageParam = 0 }) => fetcher(...fetcherArgs, pageParam),
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
                if (lastPage) {
                    if (!lastPage || lastPage.length === 0) {
                        return undefined;
                    }
                    return lastPageParam + 1;
                } else {
                    return undefined;
                }
            },
            refetchOnWindowFocus: false,
        });
}

export const infiniteQieryingFetchGuard = (hasNextPage: boolean, isFetchingNextPage: boolean, lastItem: VirtualItem, allItemsLength: number): boolean => {
    if (!hasNextPage || isFetchingNextPage || !lastItem || !(lastItem.index >= allItemsLength - 1)) return false;
    return true;
}