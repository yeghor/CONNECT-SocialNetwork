const estimatePostSize = (pictures: number, isReply: boolean): number => {
    let estimateSize: number = 250;

    switch (true) {
        case (pictures <= 0):
            break;
        case (pictures === 1):
            estimateSize = 300;
            break;
        case (pictures >= 2):
            estimateSize = 550;
    }

    if (isReply) {
        estimateSize += 75;
    }

    return estimateSize;
};

export default estimatePostSize;