import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface EyeIconProps {
  size?: number;
  color?: string;
  visible?: boolean;
}

export const EyeIcon: React.FC<EyeIconProps> = ({ 
  size = 20, 
  color = '#666',
  visible = true 
}) => {
  if (visible) {
    // Ícone de olho aberto
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.62073 12.3166C2.49043 12.1157 2.49043 11.8843 2.62073 11.6834C4.23656 8.9459 7.81507 5 12 5C16.1849 5 19.7634 8.9459 21.3793 11.6834C21.5096 11.8843 21.5096 12.1157 21.3793 12.3166C19.7634 15.0541 16.1849 19 12 19C7.81507 19 4.23656 15.0541 2.62073 12.3166Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  } else {
    // Ícone de olho fechado (com linha atravessada)
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.76406 14.2359C9.28121 13.6102 9 12.8297 9 12C9 10.3431 10.3431 9 12 9C12.8297 9 13.6102 9.28121 14.2359 9.76406"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.65723 17.5693C4.48611 15.8334 2.73585 13.6637 2.62073 12.3166C2.49043 12.1157 2.49043 11.8843 2.62073 11.6834C4.23656 8.9459 7.81507 5 12 5C13.6259 5 15.1458 5.52333 16.4877 6.38197"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19.5 8.5L21.3793 11.6834C21.5096 11.8843 21.5096 12.1157 21.3793 12.3166C19.7634 15.0541 16.1849 19 12 19C11.3748 19 10.7621 18.9171 10.1709 18.7595"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M3 3L21 21"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
};

// Componente alternativo mais simples
export const EyeIconSimple: React.FC<EyeIconProps> = ({ 
  size = 20, 
  color = '#666',
  visible = true 
}) => {
  if (visible) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 3C16.9706 3 21.2348 6.85914 22.0175 11.5588C22.0886 12.1842 22.0886 12.8158 22.0175 13.4412C21.2348 18.1409 16.9706 22 12 22C7.02944 22 2.76521 18.1409 1.98248 13.4412C1.91144 12.8158 1.91144 12.1842 1.98248 11.5588C2.76521 6.85914 7.02944 3 12 3ZM12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z"
          fill={color}
        />
      </Svg>
    );
  } else {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="m10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="m2 2 20 20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
};

// Componente usando Bootstrap Icons SVG
export const EyeIconMinimal: React.FC<EyeIconProps> = ({ 
  size = 20, 
  color = '#666',
  visible = true 
}) => {
  if (visible) {
    // SVG do Bootstrap Icons - Olho aberto
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
        <Path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
        <Path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
      </Svg>
    );
  } else {
    // Olho fechado com linha diagonal
    return (
      <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
        <Path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
        <Path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
      </Svg>
    );
  }
};