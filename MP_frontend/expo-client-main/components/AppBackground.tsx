import { ImageBackground, ImageBackgroundProps, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

const BG = require('@/assets/images/app background.png');

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  imageStyle?: ImageBackgroundProps['imageStyle'];
};

/**
 * Figma ile uyumlu tam ekran koyu gradient arka plan görseli.
 * Auth ve onboarding akışlarında kullanın; sekme içi listeler için düz renk daha hafiftir.
 */
export default function AppBackground({ children, style, imageStyle }: Props) {
  return (
    <ImageBackground source={BG} style={[styles.flex, style]} imageStyle={imageStyle} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
