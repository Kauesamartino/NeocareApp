/**
 * Tipos de erro personalizados para a aplicação
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  CPF_INVALID = 'CPF_INVALID',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly originalError?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    statusCode?: number,
    originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export class CPFValidationError extends AppError {
  constructor(message: string = 'CPF inválido', originalError?: any) {
    super(message, ErrorType.CPF_INVALID, 400, originalError);
    this.name = 'CPFValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Erro de conexão', originalError?: any) {
    super(message, ErrorType.NETWORK_ERROR, undefined, originalError);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Erro de autenticação', originalError?: any) {
    super(message, ErrorType.AUTHENTICATION_ERROR, 401, originalError);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Dados inválidos', originalError?: any) {
    super(message, ErrorType.VALIDATION_ERROR, 400, originalError);
    this.name = 'ValidationError';
  }
}

/**
 * Mapeia erros da API para erros personalizados
 */
export const mapApiError = (error: any): AppError => {
  const status = error.response?.status;
  const data = error.response?.data;
  const message = data?.message || error.message || 'Erro desconhecido';

  // Erros específicos de CPF
  if (message.toLowerCase().includes('cpf') || 
      message.toLowerCase().includes('documento') ||
      (status === 400 && message.toLowerCase().includes('inválido'))) {
    return new CPFValidationError(message, error);
  }

  // Erros de validação
  if (status === 400) {
    return new ValidationError(message, error);
  }

  // Erros de autenticação
  if (status === 401) {
    return new AuthenticationError(message, error);
  }

  // Erros de autorização
  if (status === 403) {
    return new AppError(message, ErrorType.AUTHORIZATION_ERROR, status, error);
  }

  // Usuário não encontrado
  if (status === 404) {
    return new AppError(message, ErrorType.USER_NOT_FOUND, status, error);
  }

  // Erros de rede
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return new NetworkError('Verifique sua conexão com a internet', error);
  }

  // Erro genérico
  return new AppError(message, ErrorType.UNKNOWN_ERROR, status, error);
};

/**
 * Obtém mensagem amigável para o usuário
 */
export const getFriendlyErrorMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.CPF_INVALID:
      return 'CPF inválido. Verifique se o número está correto.';
    
    case ErrorType.VALIDATION_ERROR:
      if (error.message.toLowerCase().includes('cpf')) {
        return 'CPF inválido. Verifique se o número está correto.';
      }
      return error.message;
    
    case ErrorType.NETWORK_ERROR:
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    
    case ErrorType.AUTHENTICATION_ERROR:
      return 'Sessão expirada. Faça login novamente.';
    
    case ErrorType.AUTHORIZATION_ERROR:
      return 'Você não tem permissão para essa ação.';
    
    case ErrorType.USER_NOT_FOUND:
      return 'Usuário não encontrado.';
    
    case ErrorType.EMAIL_ALREADY_EXISTS:
      return 'Este email já está sendo usado por outro usuário.';
    
    default:
      return error.message || 'Erro inesperado. Tente novamente.';
  }
};

export default {
  ErrorType,
  AppError,
  CPFValidationError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  mapApiError,
  getFriendlyErrorMessage,
};