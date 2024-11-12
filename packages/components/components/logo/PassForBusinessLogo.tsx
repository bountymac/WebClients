import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';

import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import clsx from '@proton/utils/clsx';
import generateUID from '@proton/utils/generateUID';

import type { LogoProps } from './Logo';

type Props = ComponentPropsWithoutRef<'svg'> & Pick<LogoProps, 'variant' | 'size' | 'hasTitle'>;

const PassForBusinessLogo = ({ variant = 'with-wordmark', size, className, hasTitle = true, ...rest }: Props) => {
    // This logo can be several times in the view, ids has to be different each time
    const [uid] = useState(generateUID('logo'));

    const logoWidth = variant === 'with-wordmark' ? 142 : 36;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox={`0 0 ${logoWidth} 36`}
            width={logoWidth}
            height="36"
            fill="none"
            role="img"
            className={clsx('logo', size && variant === 'glyph-only' && `icon-${size}p`, variant, className)}
            aria-labelledby={`${uid}-title`}
            {...rest}
        >
            {hasTitle && <title id={`${uid}-title`}>{PASS_APP_NAME}</title>}
            {variant === 'glyph-only' && (
                <>
                    <path
                        fill={`url(#${uid}-a)`}
                        d="M12.42 7.54c1.95-1.96 2.93-2.93 4.06-3.3a4.93 4.93 0 0 1 3.04 0c1.13.37 2.1 1.34 4.06 3.3l4.88 4.88c1.96 1.95 2.93 2.93 3.3 4.06.32.99.32 2.05 0 3.04-.37 1.13-1.34 2.1-3.3 4.06l-4.88 4.88c-1.95 1.96-2.93 2.93-4.06 3.3-.99.32-2.05.32-3.04 0-1.13-.37-2.1-1.34-4.06-3.3l-.92-1.03a7.87 7.87 0 0 1-1.03-1.28 3.7 3.7 0 0 1-.38-1c-.09-.4-.09-.82-.09-1.66V12.51c0-.84 0-1.26.09-1.65.08-.35.2-.7.38-1 .2-.36.48-.67 1.03-1.3l.92-1.02Z"
                    />
                    <path
                        fill={`url(#${uid}-b)`}
                        d="M12.42 7.54c1.95-1.96 2.93-2.93 4.06-3.3a4.93 4.93 0 0 1 3.04 0c1.13.37 2.1 1.34 4.06 3.3l4.88 4.88c1.96 1.95 2.93 2.93 3.3 4.06.32.99.32 2.05 0 3.04-.37 1.13-1.34 2.1-3.3 4.06l-4.88 4.88c-1.95 1.96-2.93 2.93-4.06 3.3-.99.32-2.05.32-3.04 0-1.13-.37-2.1-1.34-4.06-3.3l-.92-1.03a7.87 7.87 0 0 1-1.03-1.28 3.7 3.7 0 0 1-.38-1c-.09-.4-.09-.82-.09-1.66V12.51c0-.84 0-1.26.09-1.65.08-.35.2-.7.38-1 .2-.36.48-.67 1.03-1.3l.92-1.02Z"
                    />
                    <path
                        fill={`url(#${uid}-c)`}
                        d="M12.07 7.89c.98-.98 1.47-1.47 2.03-1.65.5-.16 1.03-.16 1.52 0 .57.18 1.05.67 2.03 1.65l7.33 7.32c.97.98 1.46 1.46 1.64 2.03.16.5.16 1.03 0 1.52-.18.56-.67 1.05-1.64 2.03l-7.33 7.32c-.98.98-1.46 1.47-2.03 1.65-.5.16-1.03.16-1.52 0-.56-.18-1.05-.67-2.03-1.65l-4.53-4.53c-1.96-1.95-2.93-2.93-3.3-4.06a4.93 4.93 0 0 1 0-3.04c.37-1.13 1.34-2.1 3.3-4.06l4.53-4.53Z"
                    />
                    <defs>
                        <radialGradient
                            id={`${uid}-a`}
                            cx="0"
                            cy="0"
                            r="1"
                            gradientTransform="rotate(-58.14 35.5 5.08) scale(23.3731 36.5508)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FFD580" />
                            <stop offset=".09" stopColor="#F6C592" />
                            <stop offset=".2" stopColor="#EBB6A2" />
                            <stop offset=".32" stopColor="#DFA5AF" />
                            <stop offset=".43" stopColor="#D397BE" />
                            <stop offset=".53" stopColor="#C486CB" />
                            <stop offset=".65" stopColor="#B578D9" />
                            <stop offset=".77" stopColor="#A166E5" />
                            <stop offset=".89" stopColor="#8B57F2" />
                            <stop offset="1" stopColor="#704CFF" />
                        </radialGradient>
                        <linearGradient
                            id={`${uid}-b`}
                            x1="11.49"
                            x2="16.93"
                            y1="-1.56"
                            y2="31.68"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#6D4AFF" />
                            <stop offset=".39" stopColor="#B39FFB" stopOpacity=".98" />
                            <stop offset="1" stopColor="#FFE8DB" stopOpacity=".8" />
                        </linearGradient>
                        <radialGradient
                            id={`${uid}-c`}
                            cx="0"
                            cy="0"
                            r="1"
                            gradientTransform="matrix(9.923 -15.96803 24.97081 15.51758 10.4 29.7)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FFD580" />
                            <stop offset=".09" stopColor="#F6C592" />
                            <stop offset=".2" stopColor="#EBB6A2" />
                            <stop offset=".32" stopColor="#DFA5AF" />
                            <stop offset=".43" stopColor="#D397BE" />
                            <stop offset=".53" stopColor="#C486CB" />
                            <stop offset=".65" stopColor="#B578D9" />
                            <stop offset=".77" stopColor="#A166E5" />
                            <stop offset=".89" stopColor="#8B57F2" />
                            <stop offset="1" stopColor="#704CFF" />
                        </radialGradient>
                    </defs>
                </>
            )}

            {variant === 'with-wordmark' && (
                <>
                    <path
                        d="M12.4198 7.53718C14.373 5.58394 15.3497 4.60731 16.4758 4.2414C17.4664 3.91953 18.5335 3.91953 19.5241 4.2414C20.6503 4.60731 21.6269 5.58394 23.5801 7.53718L28.4628 12.4198C30.416 14.3731 31.3926 15.3497 31.7586 16.4759C32.0804 17.4665 32.0804 18.5335 31.7586 19.5241C31.3926 20.6503 30.416 21.6269 28.4628 23.5802L23.5801 28.4628C21.6269 30.4161 20.6503 31.3927 19.5241 31.7586C18.5335 32.0805 17.4664 32.0805 16.4758 31.7586C15.3497 31.3927 14.373 30.4161 12.4198 28.4628L11.5018 27.4337C10.9463 26.8109 10.6685 26.4995 10.4705 26.1453C10.2948 25.8312 10.166 25.4931 10.088 25.1418C10 24.7457 10 24.3284 10 23.4939L10 12.5061C10 11.6716 10 11.2543 10.088 10.8582C10.166 10.5069 10.2948 10.1688 10.4705 9.85469C10.6685 9.50052 10.9463 9.18913 11.5018 8.56634L12.4198 7.53718Z"
                        fill={`url(#${uid}-d)`}
                    />
                    <path
                        d="M12.4198 7.53718C14.373 5.58394 15.3497 4.60731 16.4758 4.2414C17.4664 3.91953 18.5335 3.91953 19.5241 4.2414C20.6503 4.60731 21.6269 5.58394 23.5801 7.53718L28.4628 12.4198C30.416 14.3731 31.3926 15.3497 31.7586 16.4759C32.0804 17.4665 32.0804 18.5335 31.7586 19.5241C31.3926 20.6503 30.416 21.6269 28.4628 23.5802L23.5801 28.4628C21.6269 30.4161 20.6503 31.3927 19.5241 31.7586C18.5335 32.0805 17.4664 32.0805 16.4758 31.7586C15.3497 31.3927 14.373 30.4161 12.4198 28.4628L11.5018 27.4337C10.9463 26.8109 10.6685 26.4995 10.4705 26.1453C10.2948 25.8312 10.166 25.4931 10.088 25.1418C10 24.7457 10 24.3284 10 23.4939L10 12.5061C10 11.6716 10 11.2543 10.088 10.8582C10.166 10.5069 10.2948 10.1688 10.4705 9.85469C10.6685 9.50052 10.9463 9.18913 11.5018 8.56634L12.4198 7.53718Z"
                        fill={`url(#${uid}-e)`}
                    />
                    <path
                        d="M12.0711 7.88578C13.0477 6.90915 13.536 6.42084 14.0991 6.23789C14.5944 6.07695 15.1279 6.07695 15.6232 6.23789C16.1863 6.42084 16.6746 6.90915 17.6512 7.88578L24.9752 15.2098C25.9518 16.1864 26.4401 16.6747 26.6231 17.2378C26.784 17.7331 26.784 18.2666 26.6231 18.7619C26.4401 19.325 25.9518 19.8133 24.9752 20.7899L17.6512 28.1139C16.6746 29.0905 16.1863 29.5788 15.6232 29.7618C15.1279 29.9227 14.5944 29.9227 14.0991 29.7618C13.536 29.5788 13.0477 29.0905 12.0711 28.1139L7.53718 23.58C5.58394 21.6268 4.60731 20.6501 4.2414 19.524C3.91953 18.5334 3.91953 17.4663 4.2414 16.4757C4.60731 15.3495 5.58394 14.3729 7.53718 12.4197L12.0711 7.88578Z"
                        fill={`url(#${uid}-f)`}
                    />
                    <path
                        d="M42 15.2591V18.9241H44.5591V15.4192C44.5591 15.079 44.6927 14.7502 44.9344 14.5101C45.1732 14.27 45.5002 14.1327 45.8386 14.1327H48.463C49.6857 14.1327 50.86 13.6439 51.7244 12.7719C52.5888 11.9029 53.075 10.7222 53.075 9.49289C53.075 8.2636 52.5888 7.0829 51.7244 6.21097C50.86 5.34188 49.6857 4.85303 48.4602 4.85303H42V9.43285H44.5591V7.27444H48.2896C48.8697 7.27444 49.4241 7.50601 49.8336 7.91768C50.243 8.32935 50.4733 8.88682 50.4733 9.47002C50.4733 10.0532 50.243 10.6107 49.8336 11.0224C49.4241 11.434 48.8697 11.6656 48.2896 11.6656H45.5798C45.1107 11.6656 44.6444 11.7571 44.2122 11.94C43.7771 12.1201 43.3847 12.386 43.0521 12.7205C42.7194 13.055 42.4578 13.4523 42.2758 13.8869C42.0938 14.3186 42 14.7874 42 15.2591Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M53.4703 18.9241V13.3408C53.4703 11.0624 54.7925 9.24988 57.4397 9.24988C57.8633 9.24416 58.287 9.2899 58.7022 9.38996V11.6856C58.4008 11.6656 58.142 11.6656 58.0197 11.6656C56.6179 11.6656 56.0151 12.3117 56.0151 13.621V18.9241H53.4703Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M59.4641 14.19C59.4641 11.3883 61.5682 9.25278 64.4969 9.25278C67.4256 9.25278 69.5297 11.3883 69.5297 14.19C69.5297 16.9916 67.4256 19.1471 64.4969 19.1471C61.5682 19.1471 59.4641 16.9887 59.4641 14.19ZM67.0218 14.19C67.0218 12.5976 65.9584 11.4684 64.4969 11.4684C63.0325 11.4684 61.972 12.5947 61.972 14.19C61.972 15.8023 63.0354 16.9116 64.4969 16.9116C65.9612 16.9116 67.0218 15.7995 67.0218 14.19Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M77.6676 14.19C77.6676 11.3883 79.7717 9.25278 82.7004 9.25278C85.6263 9.25278 87.7304 11.3883 87.7304 14.19C87.7304 16.9916 85.6263 19.1471 82.7004 19.1471C79.7717 19.1471 77.6676 16.9887 77.6676 14.19ZM85.2225 14.19C85.2225 12.5976 84.1591 11.4684 82.6976 11.4684C81.2361 11.4684 80.1726 12.5947 80.1726 14.19C80.1726 15.8023 81.2361 16.9116 82.6976 16.9116C84.1591 16.9116 85.2225 15.7995 85.2225 14.19Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M89.0526 18.9242V13.5439C89.0526 11.0453 90.6364 9.24992 93.4627 9.24992C96.2692 9.24992 97.8529 11.0424 97.8529 13.5439V18.9242H95.328V13.744C95.328 12.3546 94.7053 11.4855 93.4627 11.4855C92.2202 11.4855 91.5975 12.3517 91.5975 13.744V18.9242H89.0526Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M76.9056 11.4882H74.1588V15.016C74.1588 16.2453 74.5996 16.8085 75.862 16.8085C75.9815 16.8085 76.2829 16.8085 76.6639 16.7885V18.864C76.1435 19.0041 75.6829 19.087 75.1796 19.087C73.0556 19.087 71.6112 17.7976 71.6112 15.3591V11.4882H69.9051V9.45276H70.3316C70.4994 9.45276 70.6671 9.41845 70.8207 9.35556C70.9771 9.28981 71.1164 9.19547 71.2358 9.0754C71.3553 8.95533 71.4491 8.81524 71.5145 8.65801C71.5799 8.50077 71.6112 8.33496 71.6112 8.16629V6.24803H74.156V9.45276H76.9027V11.4882H76.9056Z"
                        fill="var(--logo-text-proton-color)"
                    />
                    <path
                        d="M119.02 9.65C116.16 9.65 114.04 11.75 114.04 14.55C114.04 17.51 116.08 19.47 118.54 19.47C119.9 19.47 120.98 18.87 121.58 17.85L121.74 19.25H123.98V14.57C123.98 11.53 121.86 9.65 119.02 9.65ZM119.02 17.25C117.6 17.25 116.54 16.15 116.54 14.55C116.54 12.95 117.62 11.85 119.02 11.85C120.4 11.85 121.48 12.91 121.48 14.55C121.48 16.39 120.24 17.25 119.02 17.25Z"
                        fill="var(--logo-text-product-color)"
                    />
                    <path
                        d="M128.888 19.47C130.808 19.47 132.448 18.37 132.448 16.69C132.448 13.09 127.588 13.93 127.588 12.47C127.588 11.99 128.008 11.63 128.668 11.63C129.348 11.63 129.788 12.01 129.888 12.57H132.268C132.128 10.73 130.728 9.63 128.668 9.65C126.548 9.65 125.248 10.91 125.248 12.47C125.248 16.11 130.048 15.17 130.048 16.69C130.048 17.15 129.608 17.49 128.888 17.49C128.188 17.49 127.548 17.15 127.428 16.43H125.008C125.148 18.21 126.708 19.47 128.888 19.47Z"
                        fill="var(--logo-text-product-color)"
                    />
                    <path
                        d="M137.296 19.47C139.216 19.47 140.856 18.37 140.856 16.69C140.856 13.09 135.996 13.93 135.996 12.47C135.996 11.99 136.416 11.63 137.076 11.63C137.756 11.63 138.196 12.01 138.296 12.57H140.676C140.536 10.73 139.136 9.63 137.076 9.65C134.956 9.65 133.656 10.91 133.656 12.47C133.656 16.11 138.456 15.17 138.456 16.69C138.456 17.15 138.016 17.49 137.296 17.49C136.596 17.49 135.956 17.15 135.836 16.43H133.416C133.556 18.21 135.116 19.47 137.296 19.47Z"
                        fill="var(--logo-text-product-color)"
                    />
                    <path
                        d="M109.472 5H102.9V19.2505H105.504V15.703C105.504 15.3584 105.64 15.0254 105.886 14.7822C106.129 14.5389 106.461 14.3999 106.805 14.3999H109.472C110.716 14.3999 111.908 13.9047 112.785 13.0273C113.664 12.1469 114.156 10.9539 114.156 9.71154C114.159 9.09472 114.04 8.48081 113.806 7.91032C113.571 7.33984 113.227 6.81859 112.79 6.38132C112.354 5.94405 111.839 5.59654 111.269 5.35908C110.702 5.12163 110.091 5 109.472 5ZM111.523 9.67389C111.523 9.96637 111.466 10.256 111.353 10.5253C111.24 10.7946 111.078 11.0407 110.87 11.2463C110.664 11.4519 110.418 11.617 110.149 11.727C109.88 11.84 109.591 11.895 109.299 11.895H105.492V7.45568H109.299C109.591 7.45568 109.88 7.51359 110.152 7.62653C110.421 7.73947 110.667 7.90453 110.873 8.11014C111.078 8.31864 111.243 8.56478 111.353 8.8341C111.463 9.10631 111.52 9.39589 111.518 9.68837L111.523 9.67389Z"
                        fill="var(--logo-text-product-color)"
                    />
                    <path
                        d="M42.1055 32.5699V22.7148H47.975V23.9612H43.4678V27.0627H47.7721V28.309H43.4678V32.5699H42.1055Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M54.3883 31.7004C53.7216 32.3767 52.8907 32.7148 51.8955 32.7148C50.9004 32.7148 50.0646 32.3767 49.3883 31.7004C48.7216 31.0144 48.3883 30.1738 48.3883 29.1786C48.3883 28.1834 48.7216 27.3477 49.3883 26.6714C50.0646 25.9854 50.9004 25.6424 51.8955 25.6424C52.8907 25.6424 53.7216 25.9854 54.3883 26.6714C55.0646 27.3477 55.4028 28.1834 55.4028 29.1786C55.4028 30.1738 55.0646 31.0144 54.3883 31.7004ZM50.3303 27.5119C49.9245 27.9467 49.7216 28.5023 49.7216 29.1786C49.7216 29.8549 49.9245 30.4105 50.3303 30.8453C50.7458 31.2801 51.2675 31.4975 51.8955 31.4975C52.5236 31.4975 53.0405 31.2801 53.4463 30.8453C53.8617 30.4105 54.0695 29.8549 54.0695 29.1786C54.0695 28.5023 53.8617 27.9467 53.4463 27.5119C53.0405 27.0772 52.5236 26.8598 51.8955 26.8598C51.2675 26.8598 50.7458 27.0772 50.3303 27.5119Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M56.7064 28.2801C56.7064 27.4588 56.9382 26.8163 57.402 26.3525C57.8658 25.8791 58.4745 25.6424 59.2281 25.6424C59.4696 25.6424 59.716 25.6762 59.9672 25.7438V26.9612C59.8803 26.9516 59.7064 26.9467 59.4455 26.9467C58.9914 26.9467 58.6435 27.0723 58.402 27.3235C58.1605 27.5747 58.0397 27.9999 58.0397 28.5989V32.5699H56.7064V28.2801Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M64.7645 32.5699V22.7148H67.837C68.9481 22.7148 69.7694 22.9564 70.3008 23.4395C70.8418 23.9226 71.1124 24.5844 71.1124 25.425C71.1124 25.9757 70.9481 26.4346 70.6196 26.8018C70.3008 27.1689 69.924 27.3912 69.4892 27.4685V27.4975C70.0979 27.5747 70.6003 27.8066 70.9964 28.1931C71.4022 28.5796 71.6051 29.0917 71.6051 29.7293C71.6051 30.6086 71.3104 31.3042 70.7211 31.8163C70.1317 32.3187 69.2766 32.5699 68.1559 32.5699H64.7645ZM66.1269 31.3235H68.0544C69.494 31.3235 70.2138 30.7921 70.2138 29.7293C70.2138 29.1883 70.0109 28.7873 69.6051 28.5264C69.209 28.2656 68.5858 28.1351 67.7356 28.1351H66.1269V31.3235ZM66.1269 26.8888H67.7356C68.4312 26.8888 68.9336 26.7728 69.2428 26.5409C69.5616 26.309 69.7211 25.9371 69.7211 25.425C69.7211 24.4491 69.0592 23.9612 67.7356 23.9612H66.1269V26.8888Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M77.9254 31.9032C77.4037 32.4443 76.7032 32.7148 75.824 32.7148C74.9448 32.7148 74.2443 32.4443 73.7225 31.9032C73.2008 31.3622 72.9399 30.6617 72.9399 29.8018V25.7873H74.2733V29.7004C74.2733 30.2607 74.4037 30.6955 74.6646 31.0047C74.9254 31.3139 75.3119 31.4685 75.824 31.4685C76.3361 31.4685 76.7225 31.3139 76.9834 31.0047C77.2443 30.6955 77.3747 30.2607 77.3747 29.7004V25.7873H78.708V29.8018C78.708 30.6617 78.4472 31.3622 77.9254 31.9032Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M82.8034 32.7148C82.0498 32.7148 81.4266 32.5119 80.9338 32.1061C80.4507 31.7004 80.1899 31.1545 80.1512 30.4685H81.4845C81.5232 30.8066 81.6633 31.0772 81.9048 31.2801C82.156 31.483 82.4556 31.5844 82.8034 31.5844C83.1609 31.5844 83.4362 31.5071 83.6295 31.3525C83.8227 31.1979 83.9193 31.0095 83.9193 30.7873C83.9193 30.5264 83.7937 30.3187 83.5425 30.1641C83.2913 29.9999 82.987 29.8694 82.6295 29.7728C82.2816 29.6762 81.929 29.5603 81.5715 29.425C81.2237 29.2897 80.9242 29.0723 80.673 28.7728C80.4217 28.4733 80.2961 28.0917 80.2961 27.6279C80.2961 27.0965 80.5039 26.6327 80.9193 26.2366C81.3348 25.8404 81.9097 25.6424 82.644 25.6424C83.3396 25.6424 83.9097 25.8308 84.3541 26.2076C84.7986 26.5844 85.0546 27.111 85.1222 27.7873H83.7889C83.6826 27.111 83.301 26.7728 82.644 26.7728C82.3541 26.7728 82.1126 26.8501 81.9193 27.0047C81.7261 27.1593 81.6295 27.367 81.6295 27.6279C81.6295 27.8888 81.7551 28.0965 82.0063 28.2511C82.2575 28.4057 82.557 28.5313 82.9048 28.6279C83.2623 28.7245 83.615 28.8404 83.9628 28.9757C84.3203 29.1013 84.6246 29.3187 84.8758 29.6279C85.1271 29.9274 85.2527 30.3139 85.2527 30.7873C85.2527 31.3477 85.0208 31.8115 84.557 32.1786C84.0932 32.5361 83.5087 32.7148 82.8034 32.7148Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M86.5414 32.5699V25.7873H87.8747V32.5699H86.5414ZM86.5849 24.2366C86.4206 24.0723 86.3385 23.8694 86.3385 23.6279C86.3385 23.3863 86.4206 23.1834 86.5849 23.0192C86.7588 22.8453 86.9665 22.7583 87.208 22.7583C87.4496 22.7583 87.6525 22.8453 87.8167 23.0192C87.9907 23.1834 88.0776 23.3863 88.0776 23.6279C88.0776 23.8694 87.9907 24.0723 87.8167 24.2366C87.6525 24.4008 87.4496 24.483 87.208 24.483C86.9665 24.483 86.7588 24.4008 86.5849 24.2366Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M89.6264 28.5554C89.6264 27.6955 89.8921 26.995 90.4235 26.454C90.9549 25.9129 91.6699 25.6424 92.5684 25.6424C93.467 25.6424 94.182 25.9129 94.7134 26.454C95.2448 26.995 95.5105 27.6955 95.5105 28.5554V32.5699H94.1771V28.6569C94.1771 28.0868 94.0419 27.6472 93.7713 27.338C93.5008 27.0192 93.0998 26.8598 92.5684 26.8598C92.037 26.8598 91.6361 27.0192 91.3655 27.338C91.095 27.6472 90.9597 28.0868 90.9597 28.6569V32.5699H89.6264V28.5554Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M100.24 32.7148C99.2453 32.7148 98.424 32.3863 97.7767 31.7293C97.139 31.0723 96.8201 30.2221 96.8201 29.1786C96.8201 28.1351 97.139 27.2849 97.7767 26.6279C98.4143 25.9709 99.2356 25.6424 100.24 25.6424C101.139 25.6424 101.902 25.9854 102.53 26.6714C103.168 27.3477 103.487 28.1834 103.487 29.1786C103.487 29.3912 103.477 29.5651 103.458 29.7004H98.197C98.2936 30.2511 98.5255 30.6907 98.8926 31.0192C99.2694 31.338 99.7187 31.4975 100.24 31.4975C101.081 31.4975 101.651 31.1786 101.951 30.5409H103.313C103.11 31.1979 102.728 31.7245 102.168 32.1206C101.617 32.5168 100.975 32.7148 100.24 32.7148ZM98.2114 28.5989H102.11C102.062 28.1255 101.864 27.7197 101.516 27.3815C101.168 27.0337 100.743 26.8598 100.24 26.8598C99.7187 26.8598 99.2742 27.0192 98.9071 27.338C98.5496 27.6472 98.3177 28.0675 98.2114 28.5989Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M107.147 32.7148C106.393 32.7148 105.77 32.5119 105.277 32.1061C104.794 31.7004 104.533 31.1545 104.495 30.4685H105.828C105.866 30.8066 106.007 31.0772 106.248 31.2801C106.499 31.483 106.799 31.5844 107.147 31.5844C107.504 31.5844 107.78 31.5071 107.973 31.3525C108.166 31.1979 108.263 31.0095 108.263 30.7873C108.263 30.5264 108.137 30.3187 107.886 30.1641C107.635 29.9999 107.33 29.8694 106.973 29.7728C106.625 29.6762 106.272 29.5603 105.915 29.425C105.567 29.2897 105.267 29.0723 105.016 28.7728C104.765 28.4733 104.639 28.0917 104.639 27.6279C104.639 27.0965 104.847 26.6327 105.263 26.2366C105.678 25.8404 106.253 25.6424 106.987 25.6424C107.683 25.6424 108.253 25.8308 108.697 26.2076C109.142 26.5844 109.398 27.111 109.466 27.7873H108.132C108.026 27.111 107.644 26.7728 106.987 26.7728C106.697 26.7728 106.456 26.8501 106.263 27.0047C106.069 27.1593 105.973 27.367 105.973 27.6279C105.973 27.8888 106.098 28.0965 106.35 28.2511C106.601 28.4057 106.9 28.5313 107.248 28.6279C107.606 28.7245 107.958 28.8404 108.306 28.9757C108.664 29.1013 108.968 29.3187 109.219 29.6279C109.47 29.9274 109.596 30.3139 109.596 30.7873C109.596 31.3477 109.364 31.8115 108.9 32.1786C108.437 32.5361 107.852 32.7148 107.147 32.7148Z"
                        fill="#8C8C93"
                    />
                    <path
                        d="M113.232 32.7148C112.479 32.7148 111.856 32.5119 111.363 32.1061C110.88 31.7004 110.619 31.1545 110.58 30.4685H111.914C111.952 30.8066 112.092 31.0772 112.334 31.2801C112.585 31.483 112.885 31.5844 113.232 31.5844C113.59 31.5844 113.865 31.5071 114.059 31.3525C114.252 31.1979 114.348 31.0095 114.348 30.7873C114.348 30.5264 114.223 30.3187 113.972 30.1641C113.72 29.9999 113.416 29.8694 113.059 29.7728C112.711 29.6762 112.358 29.5603 112.001 29.425C111.653 29.2897 111.353 29.0723 111.102 28.7728C110.851 28.4733 110.725 28.0917 110.725 27.6279C110.725 27.0965 110.933 26.6327 111.348 26.2366C111.764 25.8404 112.339 25.6424 113.073 25.6424C113.769 25.6424 114.339 25.8308 114.783 26.2076C115.228 26.5844 115.484 27.111 115.551 27.7873H114.218C114.112 27.111 113.73 26.7728 113.073 26.7728C112.783 26.7728 112.542 26.8501 112.348 27.0047C112.155 27.1593 112.059 27.367 112.059 27.6279C112.059 27.8888 112.184 28.0965 112.435 28.2511C112.687 28.4057 112.986 28.5313 113.334 28.6279C113.691 28.7245 114.044 28.8404 114.392 28.9757C114.749 29.1013 115.054 29.3187 115.305 29.6279C115.556 29.9274 115.682 30.3139 115.682 30.7873C115.682 31.3477 115.45 31.8115 114.986 32.1786C114.522 32.5361 113.938 32.7148 113.232 32.7148Z"
                        fill="#8C8C93"
                    />
                    <defs>
                        <radialGradient
                            id={`${uid}-d`}
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(12.4503 32.5457) rotate(-58.142) scale(23.3731 36.5508)"
                        >
                            <stop stopColor="#FFD580" />
                            <stop offset="0.09375" stopColor="#F6C592" />
                            <stop offset="0.205" stopColor="#EBB6A2" />
                            <stop offset="0.324466" stopColor="#DFA5AF" />
                            <stop offset="0.42875" stopColor="#D397BE" />
                            <stop offset="0.53375" stopColor="#C486CB" />
                            <stop offset="0.64875" stopColor="#B578D9" />
                            <stop offset="0.77125" stopColor="#A166E5" />
                            <stop offset="0.89125" stopColor="#8B57F2" />
                            <stop offset="1" stopColor="#704CFF" />
                        </radialGradient>
                        <linearGradient
                            id={`${uid}-e`}
                            x1="11.486"
                            y1="-1.5597"
                            x2="16.9312"
                            y2="31.6785"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#6D4AFF" />
                            <stop offset="0.392009" stopColor="#B39FFB" stopOpacity="0.978022" />
                            <stop offset="1" stopColor="#FFE8DB" stopOpacity="0.8" />
                        </linearGradient>
                        <radialGradient
                            id={`${uid}-f`}
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(10.3973 29.6996) rotate(-58.142) scale(18.8001 29.3996)"
                        >
                            <stop stopColor="#FFD580" />
                            <stop offset="0.09375" stopColor="#F6C592" />
                            <stop offset="0.205" stopColor="#EBB6A2" />
                            <stop offset="0.324466" stopColor="#DFA5AF" />
                            <stop offset="0.42875" stopColor="#D397BE" />
                            <stop offset="0.53375" stopColor="#C486CB" />
                            <stop offset="0.64875" stopColor="#B578D9" />
                            <stop offset="0.77125" stopColor="#A166E5" />
                            <stop offset="0.89125" stopColor="#8B57F2" />
                            <stop offset="1" stopColor="#704CFF" />
                        </radialGradient>
                    </defs>
                </>
            )}
        </svg>
    );
};

export default PassForBusinessLogo;
