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
 * Formata telefone no padrão (XX) XXXXX-XXXX
 * @param telefone - Telefone com ou sem formatação
 * @returns Telefone formatado
 */
export function formatTelefone(telefone: string): string {
  if (!telefone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanTelefone = telefone.replace(/\D/g, '');
  
  // Se não tem 10 ou 11 dígitos, retorna como está
  if (cleanTelefone.length < 10 || cleanTelefone.length > 11) {
    return telefone;
  }
  
  // Formata no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (cleanTelefone.length === 11) {
    return `(${cleanTelefone.slice(0, 2)}) ${cleanTelefone.slice(2, 7)}-${cleanTelefone.slice(7)}`;
  } else {
    return `(${cleanTelefone.slice(0, 2)}) ${cleanTelefone.slice(2, 6)}-${cleanTelefone.slice(6)}`;
  }
}

/**
 * Remove formatação do telefone (deixa apenas números)
 * @param telefone - Telefone formatado
 * @returns Telefone apenas com números
 */
export function unformatTelefone(telefone: string): string {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
}