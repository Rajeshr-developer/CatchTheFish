import { Image, ImageSourcePropType } from "react-native"

export interface IImage {
    [key: string]: ImageSourcePropType | undefined
}

export const settings:IImage = {
    image1:require('../assets/food/1.png'),
    image2:require('../assets/food/2.png'),
    image3:require('../assets/food/3.png'),
    image4:require('../assets/food/4.png'),
    image5:require('../assets/food/5.png'),
    image6:require('../assets/food/6.png'),
    image7:require('../assets/food/7.png')
}