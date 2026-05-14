interface gameDimensions{
    height: number;
    width: number;
}

export const dimensions = (gameDimensions:gameDimensions) => {
    const gameRatio = 1.777;
    const {height, width} = gameDimensions;
    switch(width>height){
        case !!0:{
            return {width, height:width /  gameRatio};
            break;
        }
        case !0:{
            return {width:height *  gameRatio, height};
            break;
        }
    }
}