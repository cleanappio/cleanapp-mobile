import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../services/Common/theme';

function ReportIcon(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.COLORS.TEXT_GREY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-file-text"
      {...props}>
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <Path d="M14 2L14 8 20 8" />
      <Path d="M16 13L8 13" />
      <Path d="M16 17L8 17" />
      <Path d="M10 9L9 9 8 9" />
    </Svg>
  );
}

export default ReportIcon;
