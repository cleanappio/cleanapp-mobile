import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../services/Common/theme';

function ProfileIcon(props: any) {
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
      className="feather feather-user"
      {...svgProps}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  );
}

export default ProfileIcon;
