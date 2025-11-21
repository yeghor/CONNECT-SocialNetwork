const estimatePostSize = (pictures: number, isReply: boolean): number => {
    let estimateSize: number = 250;

    switch (true) {
        case (pictures <= 0):
            break;
        case (pictures === 1):
            estimateSize = 350;
            break;
        case (pictures >= 2):
            estimateSize = 500;
    }

    if (isReply) {
        estimateSize += 100;
    }

    return estimateSize;
};

export default estimatePostSize;