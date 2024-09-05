/*
 * This file is auto-generated. Do not modify it manually!
 * Run 'yarn workspace @proton/icons build' to update the icons react components.
 */
import React from 'react';

import type { IconSize } from '../types';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    /** If specified, renders an sr-only element for screenreaders */
    alt?: string;
    /** If specified, renders an inline title element */
    title?: string;
    /**
     * The size of the icon
     * Refer to the sizing taxonomy: https://design-system.protontech.ch/?path=/docs/components-icon--basic#sizing
     */
    size?: IconSize;
}

export const IcFingerprint = ({ alt, title, size = 4, className = '', viewBox = '0 0 16 16', ...rest }: IconProps) => {
    return (
        <>
            <svg
                viewBox={viewBox}
                className={`icon-size-${size} ${className}`}
                role="img"
                focusable="false"
                aria-hidden="true"
                {...rest}
            >
                {title ? <title>{title}</title> : null}

                <path
                    fillRule="evenodd"
                    d="M8.204 2.01A6.33 6.33 0 0 0 1.52 8.842a.5.5 0 1 1-.997.077 7.33 7.33 0 0 1 7.755-7.906h.017l.322.041c3.617.224 6.535 3.117 6.836 6.738V7.8l.04.6v.003a2.295 2.295 0 0 1-2.364 2.467h-.009a2.306 2.306 0 0 1-2.053-1.59l-.003-.01-.401-1.288V7.98a2.884 2.884 0 0 0-3.116-2.026c-1.376.173-2.465 1.313-2.533 2.67v.006c-.073 1.174.215 2.806 1.416 4.827a.5.5 0 0 1-.86.51C4.284 11.803 3.93 9.974 4.016 8.572 4.11 6.708 5.59 5.19 7.424 4.96h.001a3.884 3.884 0 0 1 4.193 2.725l.4 1.283c.177.528.641.872 1.153.902a1.295 1.295 0 0 0 1.325-1.397v-.003l-.04-.6c-.262-3.136-2.796-5.633-5.916-5.82h-.016l-.32-.04Zm-.798.936c2.687-.22 5.194 1.502 5.942 4.148a.5.5 0 0 1-.962.272 4.707 4.707 0 0 0-4.9-3.423c-2.283.182-4.102 2-4.32 4.3l-.002.015-.002.014v.002l-.002.012a4.66 4.66 0 0 0-.026.296 7.13 7.13 0 0 0 .007.893c.052.754.232 1.777.742 2.856a.5.5 0 0 1-.905.427 9.006 9.006 0 0 1-.834-3.214 8.13 8.13 0 0 1-.009-1.02 5.639 5.639 0 0 1 .034-.37l.002-.018c.269-2.767 2.462-4.969 5.235-5.19Z"
                ></path>
                <path
                    fillRule="evenodd"
                    d="M7.618 8.051c.47-.198 1.047.068 1.211.601Zm1.211.601.038.145c.262 1.029.872 3.415 2.82 5.647a.5.5 0 1 0 .753-.658c-1.788-2.05-2.348-4.237-2.607-5.246a43.502 43.502 0 0 0-.038-.149l-.003-.009-.002-.008C9.469 7.3 8.283 6.685 7.23 7.13 6.301 7.521 6 8.356 6 9c-.001.58.164 1.242.387 1.883.226.649.525 1.312.82 1.904A26.97 26.97 0 0 0 8.36 14.86l.02.033.006.009.002.003.422-.268-.422.268a.5.5 0 1 0 .845-.535l-.002-.002-.004-.007-.018-.03a17.365 17.365 0 0 1-.328-.546 25.978 25.978 0 0 1-.78-1.445 15.746 15.746 0 0 1-.77-1.787c-.21-.603-.333-1.14-.332-1.553 0-.357.157-.755.618-.95"
                ></path>
            </svg>
            {alt ? <span className="sr-only">{alt}</span> : null}
        </>
    );
};
