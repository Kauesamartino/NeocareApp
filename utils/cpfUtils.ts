/**
 * Utilitários para validação e formatação de CPF
 */

/**
 * Remove formatação do CPF (pontos e hífen)
 */
export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Formata CPF com pontos e hífen
 */
export const formatCPF = (cpf: string): string => {
  const numbers = cleanCPF(cpf);
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Valida se o CPF é válido usando o algoritmo oficial
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cleanCPF(cpf);
  
  // Verificar se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verificar se não é uma sequência de números iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = ((sum * 10) % 11) % 10;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = ((sum * 10) % 11) % 10;
  
  // Verificar se os dígitos calculados conferem
  return (
    parseInt(numbers[9]) === digit1 && 
    parseInt(numbers[10]) === digit2
  );
};

/**
 * Gera um CPF válido aleatório (para testes)
 */
export const generateValidCPF = (): string => {
  // Gerar 9 primeiros dígitos aleatórios
  const numbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  const digit1 = ((sum * 10) % 11) % 10;
  numbers.push(digit1);
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += numbers[i] * (11 - i);
  }
  const digit2 = ((sum * 10) % 11) % 10;
  numbers.push(digit2);
  
  return numbers.join('');
};

/**
 * Valida e formata CPF, retornando erro se inválido
 */
export const validateAndFormatCPF = (cpf: string): { valid: boolean; formatted: string; error?: string } => {
  if (!cpf || cpf.trim() === '') {
    return { valid: false, formatted: '', error: 'CPF é obrigatório' };
  }
  
  const cleaned = cleanCPF(cpf);
  
  if (cleaned.length !== 11) {
    return { valid: false, formatted: cpf, error: 'CPF deve ter 11 dígitos' };
  }
  
  if (!validateCPF(cleaned)) {
    return { valid: false, formatted: cpf, error: 'CPF inválido' };
  }
  
  return { valid: true, formatted: formatCPF(cleaned) };
};

export default {
  cleanCPF,
  formatCPF,
  validateCPF,
  generateValidCPF,
  validateAndFormatCPF,
};