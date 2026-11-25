import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

export function getImageUrl(imagem) {
  if (!imagem) return null;
  if (imagem.startsWith('http://') || imagem.startsWith('https://')) {
    return imagem;
  }
  return `${API_URL}${imagem}`;
}

export function formatCurrency(value) {
  const num = Number(value || 0);
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default api;
