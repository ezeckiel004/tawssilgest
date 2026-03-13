import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  TagIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

// Table de correspondance des wilayas
const WILAYAS = {
  "01": "Adrar",
  "02": "Chlef",
  "03": "Laghouat",
  "04": "Oum El Bouaghi",
  "05": "Batna",
  "06": "Béjaïa",
  "07": "Biskra",
  "08": "Béchar",
  "09": "Blida",
  10: "Bouira",
  11: "Tamanrasset",
  12: "Tébessa",
  13: "Tlemcen",
  14: "Tiaret",
  15: "Tizi Ouzou",
  16: "Alger",
  17: "Djelfa",
  18: "Jijel",
  19: "Sétif",
  20: "Saïda",
  21: "Skikda",
  22: "Sidi Bel Abbès",
  23: "Annaba",
  24: "Guelma",
  25: "Constantine",
  26: "Médéa",
  27: "Mostaganem",
  28: "M'Sila",
  29: "Mascara",
  30: "Ouargla",
  31: "Oran",
  32: "El Bayadh",
  33: "Illizi",
  34: "Bordj Bou Arréridj",
  35: "Boumerdès",
  36: "El Tarf",
  37: "Tindouf",
  38: "Tissemsilt",
  39: "El Oued",
  40: "Khenchela",
  41: "Souk Ahras",
  42: "Tipaza",
  43: "Mila",
  44: "Aïn Defla",
  45: "Naâma",
  46: "Aïn Témouchent",
  47: "Ghardaïa",
  48: "Relizane",
  49: "Timimoun",
  50: "Bordj Badji Mokhtar",
  51: "Ouled Djellal",
  52: "Béni Abbès",
  53: "In Salah",
  54: "In Guezzam",
  55: "Touggourt",
  56: "Djanet",
  57: "El M'Ghair",
  58: "El Meniaa",
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const wilayaCode = user?.gestionnaire?.wilaya_id;
  const wilayaNom = WILAYAS[wilayaCode] || wilayaCode || "Inconnue";

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: HomeIcon },
    { name: "Livraisons", href: "/livraisons", icon: TruckIcon },
    { name: "Livreurs", href: "/livreurs", icon: UsersIcon },
    { name: "Codes Promo", href: "/codes-promo", icon: TagIcon },
    { name: "Profil", href: "/profile", icon: UserCircleIcon },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
      >
        <div
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setSidebarOpen(false)}
        />

        <div className="fixed inset-y-0 left-0 w-72 bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div>
              <span className="text-xl font-semibold text-gray-900 block">
                {user?.prenom} {user?.nom}
              </span>
              <span className="text-sm text-primary-600">
                {wilayaNom} ({wilayaCode})
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <nav className="mt-5 px-3">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    location.pathname === item.href
                      ? "text-indigo-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <div>
              <span className="text-xl font-semibold text-gray-900 block">
                {user?.prenom} {user?.nom}
              </span>
              <span className="text-sm text-primary-600">
                {wilayaNom} ({wilayaCode})
              </span>
            </div>
          </div>

          <nav className="flex-1 mt-5 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-700">Wilaya d'affectation</p>
              <p className="text-primary-600 font-semibold">{wilayaNom}</p>
              <p className="text-xs text-gray-400 mt-1">Code: {wilayaCode}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
