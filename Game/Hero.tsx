import React, {useEffect, useState, useRef} from 'react';
import {
  ImageBackground,
  Text,
  Touchable,
  View,
  TouchableOpacity,
  GestureResponderEvent,
  NativeTouchEvent,
  Animated,
} from 'react-native';
import {heroStyle} from '../style/hero';

interface IHero {
  pointerEvents?: {evt:any,type:any};
  myref?: any;
}

export const Hero = (props: IHero) => {
  const { pointerEvents } = props;
  const [heroPos, setHeroPos] = useState({xpos: 200, ypos: 200});
  const xy = useRef(new Animated.ValueXY()).current;
  const [scaleChange, setScaleChange] = useState(false);
  const [currentPointer, setCurrentPointer] = useState(0);
  const { type = '' } = pointerEvents || {};
  let layout = {x:200, y: 200};
  let currentPosX = 200, currentPosY = 200;

  useEffect(()=>{
    const {evt = {}, type = ''} = pointerEvents || {};
    const { pageX = currentPosX, pageY = currentPosY } = evt;
    
    if(type == 'onTouchStart'){
      currentPosX = heroPos.xpos;
      currentPosY = heroPos.ypos;
    }
    if(type == 'onTouchMove'){
      currentPosX = pageX - heroPos.xpos;
      currentPosY = pageY - heroPos.ypos;
      if(pageX > currentPointer && !scaleChange){
        setScaleChange(true);
      }
      if(pageX < currentPointer && scaleChange){
        setScaleChange(false);
      }
      setCurrentPointer(pageX);
    }
    Animated.spring(
      xy,
      {
        toValue: { x: currentPosX, y: currentPosY },
        useNativeDriver: false,
        velocity: 1,
      }
    ).start();
  },[pointerEvents])

  const measureView = (event: any) => {
    layout = event.nativeEvent;
    setHeroPos({xpos:event.nativeEvent.layout.x, ypos:event.nativeEvent.layout.y})
  }

  return (
    <Animated.View
      onLayout={(event) => {measureView(event)}}
      style={[{width: 80, height: 60, position:'absolute', transform: [{ scaleX: scaleChange ? -1 : 1 }]}, xy.getLayout()]}>
      <ImageBackground
        source={require('../assets/hero/1.png')}
        style={{flex: 1}}></ImageBackground>
    </Animated.View>
  );
};