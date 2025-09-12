import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../services/Common/theme';

function MapIcon(props: any) {
  const {strokeColor = theme.COLORS.TEXT_GREY, ...svgProps} = props;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-map"
      {...svgProps}>
      <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <Path d="M8 2v16" />
      <Path d="M16 6v16" />
    </Svg>
  );
}

export default MapIcon;
