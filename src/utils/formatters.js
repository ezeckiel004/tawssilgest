import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { STATUS_COLORS } from './constants';

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch {
    return '-';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: fr });
  } catch {
    return '-';
  }
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  // Format: 0550 12 34 56
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  return phone;
};

export const getStatusLabel = (status) => {
  const statusMap = {
    en_attente: 'En attente',
    prise_en_charge_ramassage: 'Prise en charge ramassage',
    ramasse: 'Ramasse',
    en_transit: 'En transit',
    prise_en_charge_livraison: 'Prise en charge livraison',
    livre: 'Livré',
    annule: 'Annulé',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || 'gray';
};

export const getStatusBadgeClass = (status) => {
  const colors = {
    en_attente: 'bg-gray-100 text-gray-800',
    prise_en_charge_ramassage: 'bg-blue-100 text-blue-800',
    ramasse: 'bg-indigo-100 text-indigo-800',
    en_transit: 'bg-purple-100 text-purple-800',
    prise_en_charge_livraison: 'bg-orange-100 text-orange-800',
    livre: 'bg-green-100 text-green-800',
    annule: 'bg-red-100 text-red-800',
  };
  
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`;
};