import * as React from 'react';
import Svg, {SvgProps, Path, G} from 'react-native-svg';
const ShutterIcon = (props: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 49 49" fill="none" {...props}>
    <Path
      d="M42 24.5C42 34.165 34.165 42 24.5 42C14.835 42 7 34.165 7 24.5C7 14.835 14.835 7 24.5 7C34.165 7 42 14.835 42 24.5Z"
      fill="#F3EFE0"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24.5 4C13.1782 4 4 13.1782 4 24.5C4 35.8218 13.1782 45 24.5 45C35.8218 45 45 35.8218 45 24.5C45 13.1782 35.8218 4 24.5 4ZM0 24.5C0 10.969 10.969 0 24.5 0C38.031 0 49 10.969 49 24.5C49 38.031 38.031 49 24.5 49C10.969 49 0 38.031 0 24.5Z"
      fill="#F3EFE0"
    />
    <G transform="translate(13,14)">
      <Path
        d="M23 17C23 17.5304 22.7893 18.0391 22.4142 18.4142C22.0391 18.7893 21.5304 19 21 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4H7L9 1H15L17 4H21C21.5304 4 22.0391 4.21071 22.4142 4.58579C22.7893 4.96086 23 5.46957 23 6V17Z"
        stroke="#2B2B2B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15Z"
        stroke="#2B2B2B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
export default ShutterIcon;
