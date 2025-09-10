import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../services/Common/theme';

function MemberIcon(props: any) {
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
      className="feather feather-users"
      {...svgProps}>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export default MemberIcon;
