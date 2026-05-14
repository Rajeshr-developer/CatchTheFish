import React, { LegacyRef, MutableRefObject } from 'react';
import {Animated, Image, ImageSourcePropType, Text, View} from 'react-native';
import {foodStyle} from '../style/food';
import * as settings from '../settings/settings';
import SpriteSheet from 'rn-sprite-sheet';
import SpriteImage from 'react-native-sprite-sheet'

interface posleft {
  [key: string]: any;
}

interface stateProps extends posleft {
  totalFood: any;
}

export class Food extends React.Component<any, stateProps> {
  mummy: React.RefObject<any>;
  constructor(props: any) {
    super(props);
    this.state = {
      loop: true,
      resetAfterFinish: false,
      fps: '16',
      totalFood: 1,
      left1: new Animated.Value(100),
      left2: new Animated.Value(-100),
      left3: new Animated.Value(-100),
      left4: new Animated.Value(-100),
    };
    this.mummy = React.createRef();
  }

  componentDidMount(): void {
    let val = 1;
    // const timeout = setInterval(() => {
    //     console.log('val = '+val);
    //   Animated.timing(this.state['left' + val], {
    //     toValue: 200,
    //     duration: 10000+Math.random()*((Math.random()*5)*10000),
    //     useNativeDriver: false,
    //   }).start();
    //   if(val<this.state.totalFood){
    //     val+=1;
    //   }else{
    //   clearInterval(timeout)}
    // }, 3000);

    setTimeout(()=>{
      this.play('walk')
    },1000)

    

  console.log('rendering');
  }
  

  play = (type: any) => {
    const { fps, loop, resetAfterFinish } = this.state;
    if(this.mummy && this.mummy.current)
      this.mummy.current.play({
        type,
        fps: Number(fps),
        loop: loop,
        resetAfterFinish: resetAfterFinish,
        onFinish: () => console.log('onFinish')
      });
  };

  render(): React.ReactNode {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SpriteSheet
        ref={this.mummy}
        source={require('../assets/fish.png')}
        columns={6}
        rows={8}
        imageStyle={{ marginTop: -1 }}
        animations={{
          walk: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
          appear: Array.from({ length: 15 }, (v, i) => i + 18),
          die: Array.from({ length: 21 }, (v, i) => i + 33)
        }}
      />
    </View>
  }
}
