import { create } from "zustand";

export type ObjectKind =
  | "wall"
  | "floor"
  | "door"
  | "window"
  | "roof"
  | "column"
  | "furniture"
  | "tree"
  | "dome";

export interface SceneObject {
  id: string;
  kind: ObjectKind;
  label: string;
  position: [number, number, number];
  size: [number, number, number]; // width, height, depth
  rotationY: number;
  color: string;
}

export type PresetKey = "empty" | "home" | "office" | "restaurant" | "temple";

interface SceneState {
  objects: SceneObject[];
  selectedId: string | null;
  preset: PresetKey;
  add: (kind: ObjectKind) => void;
  remove: (id: string) => void;
  select: (id: string | null) => void;
  update: (id: string, patch: Partial<SceneObject>) => void;
  clear: () => void;
  loadPreset: (preset: PresetKey) => void;
  setAll: (objs: SceneObject[]) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const defaults: Record<ObjectKind, Omit<SceneObject, "id" | "position">> = {
  wall:      { kind: "wall",      label: "Wall",      size: [4, 3, 0.2],   rotationY: 0, color: "#d6c9a8" },
  floor:     { kind: "floor",     label: "Floor",     size: [6, 0.1, 6],   rotationY: 0, color: "#8b6f47" },
  door:      { kind: "door",      label: "Door",      size: [1, 2.2, 0.1], rotationY: 0, color: "#6b3a1a" },
  window:    { kind: "window",    label: "Window",    size: [1.2, 1, 0.1], rotationY: 0, color: "#7ec8e3" },
  roof:      { kind: "roof",      label: "Roof",      size: [6, 0.3, 6],   rotationY: 0, color: "#b54225" },
  column:    { kind: "column",    label: "Column",    size: [0.4, 3, 0.4], rotationY: 0, color: "#e8e2d0" },
  furniture: { kind: "furniture", label: "Furniture", size: [1.5, 0.8, 1], rotationY: 0, color: "#3a3a3a" },
  tree:      { kind: "tree",      label: "Tree",      size: [0.6, 2.5, 0.6], rotationY: 0, color: "#3d6b35" },
  dome:      { kind: "dome",      label: "Dome",      size: [2, 2, 2],     rotationY: 0, color: "#e6b34a" },
};

function makeHome(): SceneObject[] {
  return [
    { id: uid(), ...defaults.floor, label: "Ground", size: [10, 0.1, 8], position: [0, 0, 0] },
    { id: uid(), ...defaults.wall,  label: "Back wall",  size: [10, 3, 0.2], position: [0, 1.5, -4] },
    { id: uid(), ...defaults.wall,  label: "Left wall",  size: [0.2, 3, 8],  position: [-5, 1.5, 0] },
    { id: uid(), ...defaults.wall,  label: "Right wall", size: [0.2, 3, 8],  position: [5, 1.5, 0] },
    { id: uid(), ...defaults.wall,  label: "Front L",    size: [3.5, 3, 0.2], position: [-3.25, 1.5, 4] },
    { id: uid(), ...defaults.wall,  label: "Front R",    size: [3.5, 3, 0.2], position: [3.25, 1.5, 4] },
    { id: uid(), ...defaults.door,  position: [0, 1.1, 4] },
    { id: uid(), ...defaults.window, position: [-2.5, 1.8, -4] },
    { id: uid(), ...defaults.window, position: [2.5, 1.8, -4] },
    { id: uid(), ...defaults.roof,  size: [10.4, 0.3, 8.4], position: [0, 3.15, 0], color: "#b54225" },
    { id: uid(), ...defaults.furniture, label: "Sofa", position: [-2, 0.4, -2], color: "#5d4a8a" },
    { id: uid(), ...defaults.tree, position: [-6, 1.25, 3] },
  ];
}

function makeOffice(): SceneObject[] {
  return [
    { id: uid(), ...defaults.floor, size: [14, 0.1, 10], position: [0, 0, 0], color: "#cccccc" },
    { id: uid(), ...defaults.wall,  size: [14, 4, 0.2], position: [0, 2, -5], color: "#dfe5ec" },
    { id: uid(), ...defaults.wall,  size: [0.2, 4, 10], position: [-7, 2, 0], color: "#dfe5ec" },
    { id: uid(), ...defaults.wall,  size: [0.2, 4, 10], position: [7, 2, 0], color: "#dfe5ec" },
    { id: uid(), ...defaults.window, size: [12, 2.5, 0.1], position: [0, 2.2, 5], color: "#7ec8e3" },
    { id: uid(), ...defaults.column, position: [-3, 2, 0] },
    { id: uid(), ...defaults.column, position: [3, 2, 0] },
    { id: uid(), ...defaults.furniture, label: "Desk 1", size: [2, 0.8, 1], position: [-4, 0.4, -2] },
    { id: uid(), ...defaults.furniture, label: "Desk 2", size: [2, 0.8, 1], position: [0, 0.4, -2] },
    { id: uid(), ...defaults.furniture, label: "Desk 3", size: [2, 0.8, 1], position: [4, 0.4, -2] },
    { id: uid(), ...defaults.roof, size: [14.4, 0.2, 10.4], position: [0, 4.1, 0], color: "#888" },
  ];
}

function makeRestaurant(): SceneObject[] {
  const tables: SceneObject[] = [];
  for (let x = -4; x <= 4; x += 4) {
    for (let z = -3; z <= 3; z += 3) {
      tables.push({ id: uid(), ...defaults.furniture, label: "Table", size: [1.2, 0.8, 1.2], position: [x, 0.4, z], color: "#7a4a2a" });
    }
  }
  return [
    { id: uid(), ...defaults.floor, size: [14, 0.1, 10], position: [0, 0, 0], color: "#3a1f12" },
    { id: uid(), ...defaults.wall, size: [14, 3.5, 0.2], position: [0, 1.75, -5], color: "#5a2418" },
    { id: uid(), ...defaults.wall, size: [0.2, 3.5, 10], position: [-7, 1.75, 0], color: "#5a2418" },
    { id: uid(), ...defaults.wall, size: [0.2, 3.5, 10], position: [7, 1.75, 0], color: "#5a2418" },
    { id: uid(), ...defaults.door, position: [0, 1.1, 5] },
    ...tables,
    { id: uid(), ...defaults.roof, size: [14.4, 0.3, 10.4], position: [0, 3.65, 0], color: "#2a1208" },
  ];
}

function makeTemple(): SceneObject[] {
  return [
    { id: uid(), ...defaults.floor, size: [12, 0.4, 12], position: [0, 0.2, 0], color: "#e8d9b8" },
    { id: uid(), ...defaults.floor, size: [10, 0.4, 10], position: [0, 0.6, 0], color: "#f0e4c8" },
    { id: uid(), ...defaults.column, size: [0.6, 4, 0.6], position: [-4, 2.8, -4], color: "#fff8e0" },
    { id: uid(), ...defaults.column, size: [0.6, 4, 0.6], position: [4, 2.8, -4], color: "#fff8e0" },
    { id: uid(), ...defaults.column, size: [0.6, 4, 0.6], position: [-4, 2.8, 4], color: "#fff8e0" },
    { id: uid(), ...defaults.column, size: [0.6, 4, 0.6], position: [4, 2.8, 4], color: "#fff8e0" },
    { id: uid(), ...defaults.wall, size: [8, 3.5, 0.3], position: [0, 2.6, -4], color: "#e8b34a" },
    { id: uid(), ...defaults.roof, size: [10, 0.4, 10], position: [0, 5, 0], color: "#c87a2a" },
    { id: uid(), ...defaults.dome, size: [3, 3, 3], position: [0, 6.5, 0], color: "#e8b34a" },
  ];
}

export const useScene = create<SceneState>((set, get) => ({
  objects: makeHome(),
  selectedId: null,
  preset: "home",
  add: (kind) =>
    set((s) => {
      const o: SceneObject = { id: uid(), ...defaults[kind], position: [0, defaults[kind].size[1] / 2, 0] };
      return { objects: [...s.objects, o], selectedId: o.id };
    }),
  remove: (id) => set((s) => ({ objects: s.objects.filter((o) => o.id !== id), selectedId: null })),
  select: (id) => set({ selectedId: id }),
  update: (id, patch) =>
    set((s) => ({ objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
  clear: () => set({ objects: [], selectedId: null, preset: "empty" }),
  setAll: (objs) => set({ objects: objs, selectedId: null }),
  loadPreset: (preset) => {
    const map: Record<PresetKey, () => SceneObject[]> = {
      empty: () => [],
      home: makeHome,
      office: makeOffice,
      restaurant: makeRestaurant,
      temple: makeTemple,
    };
    set({ objects: map[preset](), preset, selectedId: null });
  },
}));
