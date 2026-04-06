import axios from 'axios';

export interface CepData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function buscarCEP(cep: string): Promise<CepData> {
  const cepNumbers = cep.replace(/\D/g, '');
  const response = await axios.get<CepData & { erro?: boolean }>(
    `https://viacep.com.br/ws/${cepNumbers}/json/`
  );
  if (response.data.erro) {
    throw new Error('CEP não encontrado');
  }
  return response.data;
}
