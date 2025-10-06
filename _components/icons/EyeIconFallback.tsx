import React from 'react';
import { Text } from 'react-native';

interface EyeIconProps {
  size?: number;
  color?: string;
  visible?: boolean;
  style?: any;
}

// Versão alternativa usando símbolos Unicode se o SVG não funcionar
export const EyeIconFallback: React.FC<EyeIconProps> = ({ 
  size = 20, 
  color = '#666',
  visible = true,
  style 
}) => {
  return (
    <Text style={[
      { 
        fontSize: size, 
        color: color,
        fontWeight: 'normal',
        lineHeight: size,
      }, 
      style
    ]}>
      {visible ? '👁' : '🙈'}
    </Text>
  );
};

// Versão ainda mais simples usando caracteres
export const EyeIconSimpleText: React.FC<EyeIconProps> = ({ 
  size = 18, 
  color = '#666',
  visible = true,
  style 
}) => {
  return (
    <Text style={[
      { 
        fontSize: size, 
        color: color,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: size,
        fontFamily: 'monospace',
      }, 
      style
    ]}>
      {visible ? '●' : '○'}
    </Text>
  );
};

// Versão com símbolos Unicode mais profissionais
export const EyeIconUnicode: React.FC<EyeIconProps> = ({ 
  size = 16, 
  color = '#666',
  visible = true,
  style 
}) => {
  return (
    <Text style={[
      { 
        fontSize: size, 
        color: color,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: size,
      }, 
      style
    ]}>
      {visible ? '⦿' : '⦵'}
    </Text>
  );
};