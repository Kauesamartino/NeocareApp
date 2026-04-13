/**
 * Utilitários de formatação para dados da aplicação
 */

/**
 * Formata CEP no padrão XXXXX-XXX
 * @param cep - CEP com ou sem formatação
 * @returns CEP formatado no padrão XXXXX-XXX
 */
export function formatCEP(cep: string): string {
  if (!cep) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Se não tem 8 dígitos, retorna como está
  if (cleanCEP.length !== 8) {
    return cep;
  }
  
  // Formata no padrão XXXXX-XXX
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
}

/**
 * Remove formatação do CEP (deixa apenas números)
 * @param cep - CEP formatado
 * @returns CEP apenas com números
 */
export function unformatCEP(cep: string): string {
  if (!cep) return '';
  return cep.replace(/\D/g, '');
}

/**
 * Valida se o CEP tem o formato correto
 * @param cep - CEP para validar
 * @returns true se válido, false caso contrário
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false;
  
  // Remove formatação
  const cleanCEP = unformatCEP(cep);
  
  // Deve ter exatamente 8 dígitos
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
}

/**
 * Formata telefone no padrão +55 (XX) XXXXX-XXXX para exibição
 * @param telefone - Telefone com ou sem formatação
 * @returns Telefone formatado para exibição
 */
export function formatTelefone(telefone: string): string {
  if (!telefone) return '';

  // Remove tudo que não é dígito
  let digits = telefone.replace(/\D/g, '');

  // Se começa com 55 e tem 12-13 dígitos, já inclui código do país
  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Limita a 11 dígitos (DDD + celular)
  digits = digits.slice(0, 11);

  // Aplica formatação progressiva: +55 (XX) XXXXX-XXXX
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `+55 (${digits}`;
  if (digits.length <= 7) return `+55 (${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    const split = digits.length === 11 ? 7 : 6;
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`;
  }
  return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Converte telefone de qualquer formato para +55XXXXXXXXXXX (envio à API)
 * @param telefone - Telefone em qualquer formato
 * @returns Telefone no formato +55XXXXXXXXXXX
 */
export function toPhoneAPI(telefone: string): string {
  if (!telefone) return '';
  let digits = telefone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }
  return `+55${digits}`;
}

/**
 * Remove formatação do telefone (deixa apenas números locais sem código do país)
 * @param telefone - Telefone formatado
 * @returns Telefone apenas com números (DDD + número)
 */
export function unformatTelefone(telefone: string): string {
  if (!telefone) return '';
  let digits = telefone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits.slice(2);
  }
  return digits;
}

/** Alias para compatibilidade */
export const formatPhone = formatTelefone;

/**
 * Formata data durante digitação (DD/MM/AAAA)
 */
export function formatDate(date: string): string {
  const numbers = date.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
}