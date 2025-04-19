import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Resources
  crypto: 2000,
  research: 0,
  scripts: 1000, // Start with some scripts
  
  // Game state
  gameStarted: false,
  productionMode: 'scripts', // Set default production mode
  
  mainComputer: {
    ram: 4, // GB
    modules: Array(8).fill(null).map((_, index) => ({
      id: index,
      type: null,
      occupied: false
    }))
  },
  
  // Building costs and specs
  buildingCosts: {
    ram: 50,
    firewall: 75
  },

  buildingSpecs: {
    ram: {
      provides: 2, // GB RAM provided
      requires: 0  // GB RAM required
    },
    firewall: {
      provides: 0,
      requires: 2  // GB RAM required
    }
  },

  // Calculate available RAM
  getAvailableRAM: () => {
    const state = get();
    const baseRAM = 4;
    // Add RAM from RAM modules
    const additionalRAM = state.mainComputer.modules
      .filter(m => m.type === 'ram')
      .length * state.buildingSpecs.ram.provides;
    // Subtract RAM used by firewalls
    const usedRAM = state.mainComputer.modules
      .filter(m => m.type === 'firewall')
      .length * state.buildingSpecs.firewall.requires;
    return baseRAM + additionalRAM - usedRAM;
  },

  // Calculate total RAM (including base RAM and all modules)
  getTotalRAM: () => {
    const state = get();
    const baseRAM = 4;
    // Add RAM from RAM modules
    const additionalRAM = state.mainComputer.modules
      .filter(m => m.type === 'ram')
      .length * state.buildingSpecs.ram.provides;
    return baseRAM + additionalRAM;
  },

  // Calculate production rate based on available RAM
  getProductionRate: () => {
    const availableRAM = get().getAvailableRAM();
    return Math.floor(availableRAM / 2); // 2 units per 4GB RAM
  },

  // Production actions
  setProductionMode: (mode) => set({ productionMode: mode }),
  
  produce: () => {
    const state = get();
    const rate = state.getProductionRate();
    
    switch (state.productionMode) {
      case 'crypto':
        set((state) => ({ crypto: state.crypto + rate }));
        break;
      case 'research':
        set((state) => ({ research: state.research + rate }));
        break;
      case 'scripts':
        set((state) => ({ scripts: state.scripts + rate }));
        break;
    }

    // Emit production event
    if (window.game) {
      window.game.events.emit('production');
    }
  },
  
  // Resource actions
  addCrypto: (amount) => set((state) => ({ crypto: state.crypto + amount })),
  addResearch: (amount) => set((state) => ({ research: state.research + amount })),
  addScripts: (amount) => set((state) => ({ scripts: state.scripts + amount })),
  updateScripts: (amount) => set((state) => ({ scripts: state.scripts + amount })),
  
  // Check if we have enough RAM for a building
  hasEnoughRAM: (buildingType) => {
    const state = get();
    const availableRAM = state.getAvailableRAM();
    const requiredRAM = state.buildingSpecs[buildingType]?.requires || 0;
    return availableRAM >= requiredRAM;
  },

  // Module actions
  buildOnModule: (moduleId, buildingType) => set((state) => {
    const currentModule = state.mainComputer.modules[moduleId];
    let cryptoChange = -state.buildingCosts[buildingType];
    
    // If replacing a module, refund half the cost
    if (currentModule.type) {
      cryptoChange += Math.floor(state.buildingCosts[currentModule.type] / 2);
    }

    // Calculate RAM changes
    const currentRAM = state.getAvailableRAM();
    const removingRAMModule = currentModule.type === 'ram';
    const removingFirewall = currentModule.type === 'firewall';
    const addingRAMModule = buildingType === 'ram';
    const addingFirewall = buildingType === 'firewall';

    let ramChange = 0;
    if (removingRAMModule) ramChange -= state.buildingSpecs.ram.provides;
    if (removingFirewall) ramChange += state.buildingSpecs.firewall.requires;
    if (addingRAMModule) ramChange += state.buildingSpecs.ram.provides;
    if (addingFirewall) ramChange -= state.buildingSpecs.firewall.requires;

    const finalRAM = currentRAM + ramChange;

    if (state.crypto + cryptoChange >= 0 && finalRAM >= 0) {
      const updatedModules = [...state.mainComputer.modules];
      updatedModules[moduleId] = {
        ...updatedModules[moduleId],
        type: buildingType,
        occupied: true
      };
      
      return {
        crypto: state.crypto + cryptoChange,
        mainComputer: {
          ...state.mainComputer,
          modules: updatedModules
        }
      };
    }
    return state;
  }),

  removeModule: (moduleId) => set((state) => {
    const currentModule = state.mainComputer.modules[moduleId];
    if (currentModule.type) {
      // Refund half the cost when removing
      const refund = Math.floor(state.buildingCosts[currentModule.type] / 2);
      const updatedModules = [...state.mainComputer.modules];
      updatedModules[moduleId] = {
        ...updatedModules[moduleId],
        type: null,
        occupied: false
      };
      
      return {
        crypto: state.crypto + refund,
        mainComputer: {
          ...state.mainComputer,
          modules: updatedModules
        }
      };
    }
    return state;
  }),
  
  // Game control
  startGame: () => set({ gameStarted: true }),
  endGame: () => set({ gameStarted: false }),
}));

export default useGameStore; 