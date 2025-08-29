import * as React from 'react';
import Svg, {SvgProps, Polygon} from 'react-native-svg';
const NavigationIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <Polygon points="3 11 22 2 13 21 11 13 3 11" />
  </Svg>
);
export default NavigationIcon;
