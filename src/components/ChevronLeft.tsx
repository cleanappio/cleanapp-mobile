import * as React from 'react';
import Svg, {SvgProps, Polyline} from 'react-native-svg';
const ChevronLeft = (props: SvgProps) => (
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
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);
export default ChevronLeft;
