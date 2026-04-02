// src/components/Manager/GainsTable.jsx
import React from 'react';
import { formatMontant, traduireStatut, getCouleurStatut, formatDate } from '../../services/manager';

const GainsTable = ({ 
    gains = [], 
    loading = false, 
    selectedGains = [], 
    onSelectGain, 
    onSelectAll,
    onDemanderPaiement,
    showCheckboxes = true,
    type = 'livraison' // 'livraison' ou 'navette'
}) => {
    const gainsEnAttente = gains.filter(g => g.status === 'en_attente');

    const handleSelectAll = () => {
        if (selectedGains.length === gainsEnAttente.length && gainsEnAttente.length > 0) {
            onSelectAll([]);
        } else {
            onSelectAll(gainsEnAttente.map(g => g.id));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!gains.length) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Aucun gain {type === 'navette' ? 'de navette' : ''} trouvé
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {gainsEnAttente.length > 0 && showCheckboxes && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={selectedGains.length === gainsEnAttente.length && gainsEnAttente.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-primary-600"
                            />
                            Tout sélectionner ({gainsEnAttente.length})
                        </label>
                        <span className="text-sm text-gray-500">
                            Total: {formatMontant(gainsEnAttente.reduce((sum, g) => sum + (g.montant_commission || 0), 0))}
                        </span>
                    </div>
                    <button
                        onClick={() => onDemanderPaietype === 'navette' ? 'navette' : 'livraison' === 'navette' ? onDemanderPaiement() : onDemanderPaiement()}
                        disabled={selectedGains.length === 0}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
                    >
                        Demander le paiement ({selectedGains.length})
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {showCheckboxes && gainsEnAttente.length > 0 && (
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedGains.length === gainsEnAttente.length && gainsEnAttente.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-primary-600"
                                    />
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            {type === 'navette' ? (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Navette</th>
                            ) : (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livraison</th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {gains.map((gain) => (
                            <tr key={gain.id} className="hover:bg-gray-50">
                                {showCheckboxes && gain.status === 'en_attente' && (
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedGains.includes(gain.id)}
                                            onChange={() => onSelectGain(gain.id)}
                                            className="rounded border-gray-300 text-primary-600"
                                        />
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {formatDate(gain.created_at, true)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {type === 'navette' ? (
                                        <>
                                            {gain.navette_reference || `#${gain.navette_id?.substring(0, 8)}`}
                                            {gain.navette && (
                                                <span className="block text-xs text-gray-400">
                                                    {gain.navette.wilaya_depart_id} → {gain.navette.wilaya_arrivee_id}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        gain.livraison_reference || `#${gain.livraison_id?.substring(0, 8)}`
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        gain.wilaya_type === 'depart' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-purple-100 text-purple-800'
                                    }`}>
                                        {gain.wilaya_type === 'depart' ? 'Wilaya départ' : 'Wilaya arrivée'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {formatMontant(gain.montant_commission)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {gain.pourcentage_applique}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCouleurStatut(gain.status)}`}>
                                        {traduireStatut(gain.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {gain.status === 'en_attente' && (
                                        <button
                                            onClick={() => onDemanderPaiement(gain.id)}
                                            className="text-sm text-primary-600 hover:text-primary-800"
                                        >
                                            Demander
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GainsTable;