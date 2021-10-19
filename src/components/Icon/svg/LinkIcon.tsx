import React from 'react';

interface Props {
  width?: number;
  height?: number;
  fill?: string | number;
}

function LinkIcon({
  width = 50,
  height = 50,
  ...props
}: Props & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 37.8 43.6" width={width} height={height} {...props}>
      <g data-name="Layer 2">
        <path
          d="M18.9 0l-4 2.3L4 8.6l-4 2.3v21.8L4 35l11 6.3 4 2.3 4-2.3L33.8 35l4-2.3V10.9l-4-2.3-10.9-6.3zM8 28.1V15.5l10.9-6.3 10.9 6.3v12.6l-10.9 6.3z"
          fill="#2a5ada"
          data-name="Layer 1"
        />
      </g>
    </svg>
  );
}

const MemoLinkIcon = React.memo(LinkIcon);
export default MemoLinkIcon;