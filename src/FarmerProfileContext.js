import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'agrisetu_farmer_profile_v1';

const FarmerProfileContext = createContext(null);

const mergeDefined = (base, patch) => {
  if (!patch) return base;
  const out = { ...base };
  Object.keys(patch).forEach((k) => {
    if (patch[k] !== undefined) out[k] = patch[k];
  });
  return out;
};

const defaultProfile = () => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  personalInfo: {
    fullName: '',
    mobileNumber: ''
  },
  location: {
    village: '',
    district: '',
    state: ''
  },
  farmDetails: {
    landSize: '',
    farmerType: 'Premium Farmer',
    soilType: '',
    irrigation: ''
  },
  crops: [],
  expenses: []
});

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const hydrateFromStorage = () => {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return null;
  }
};

const persistToStorage = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    // ignore
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'PATCH_PERSONAL':
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        personalInfo: mergeDefined(state.personalInfo, action.payload)
      };

    case 'PATCH_LOCATION':
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        location: mergeDefined(state.location, action.payload)
      };

    case 'PATCH_FARM_DETAILS':
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        farmDetails: mergeDefined(state.farmDetails, action.payload)
      };

    case 'UPSERT_CROP': {
      const crop = action.payload;
      const crops = Array.isArray(state.crops) ? state.crops : [];
      const next = crop.id
        ? crops.map((c) => (c.id === crop.id ? { ...c, ...crop } : c))
        : [...crops, { ...crop, id: String(Date.now()) }];
      return { ...state, updatedAt: new Date().toISOString(), crops: next };
    }

    case 'REMOVE_CROP': {
      const crops = Array.isArray(state.crops) ? state.crops : [];
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        crops: crops.filter((c) => c.id !== action.payload)
      };
    }

    case 'ADD_EXPENSE': {
      const expenses = Array.isArray(state.expenses) ? state.expenses : [];
      const next = [...expenses, { ...action.payload, id: String(Date.now()) }];
      return { ...state, updatedAt: new Date().toISOString(), expenses: next };
    }

    case 'UPDATE_EXPENSE': {
      const expenses = Array.isArray(state.expenses) ? state.expenses : [];
      const next = expenses.map((e) => (e.id === action.payload.id ? { ...e, ...action.payload } : e));
      return { ...state, updatedAt: new Date().toISOString(), expenses: next };
    }

    case 'REMOVE_EXPENSE': {
      const expenses = Array.isArray(state.expenses) ? state.expenses : [];
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        expenses: expenses.filter((e) => e.id !== action.payload)
      };
    }

    default:
      return state;
  }
};

const buildInitialProfile = (initial) => {
  const base = defaultProfile();
  const stored = hydrateFromStorage();
  const merged = stored ? { ...base, ...stored } : base;

  const fullName = initial?.personalInfo?.fullName ?? initial?.farmerName ?? '';
  const district = initial?.location?.district ?? initial?.locationData?.district ?? '';
  const state = initial?.location?.state ?? initial?.locationData?.state ?? '';
  const crop = initial?.locationData?.crop ?? '';
  const soilType = initial?.locationData?.soilType ?? '';
  const irrigation = initial?.locationData?.irrigation ?? '';
  const landSize = initial?.farmDetails?.landSize ?? initial?.locationData?.landSize ?? '';

  return {
    ...merged,
    personalInfo: {
      ...merged.personalInfo,
      fullName: merged.personalInfo.fullName || fullName
    },
    location: {
      ...merged.location,
      district: merged.location.district || district,
      state: merged.location.state || state
    },
    farmDetails: {
      ...merged.farmDetails,
      landSize: merged.farmDetails.landSize || landSize,
      soilType: merged.farmDetails.soilType || soilType,
      irrigation: merged.farmDetails.irrigation || irrigation
    },
    crops:
      Array.isArray(merged.crops) && merged.crops.length
        ? merged.crops
        : crop
          ? [
              {
                id: 'primary',
                name: crop,
                sowingMonth: '',
                harvestMonth: '',
                healthStatus: 'Good'
              }
            ]
          : merged.crops,
    expenses: Array.isArray(merged.expenses) ? merged.expenses : []
  };
};

export const FarmerProfileProvider = ({ children, initialProfile }) => {
  const initialState = useMemo(() => buildInitialProfile(initialProfile), [initialProfile]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    persistToStorage(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <FarmerProfileContext.Provider value={value}>{children}</FarmerProfileContext.Provider>;
};

export const useFarmerProfileContext = () => {
  const ctx = useContext(FarmerProfileContext);
  if (!ctx) throw new Error('useFarmerProfileContext must be used within FarmerProfileProvider');
  return ctx;
};
