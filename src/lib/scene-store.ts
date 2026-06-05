import { create } from "zustand";

export type ObjectKind =
  | "wall" | "floor" | "door" | "window" | "roof" | "column"
  | "furniture" | "tree" | "dome"
  | "stair" | "railing" | "pool" | "car" | "person" | "streetlamp"
  | "fence" | "bed" | "table" | "chair" | "sink" | "toilet"
  | "tv" | "plant" | "fountain" | "statue" | "gate" | "sign"
  | "solar" | "kitchen" | "bathtub" | "sofa";

export interface SceneObject {
  id: string;
  kind: ObjectKind;
  label: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  color: string;
  locked?: boolean;
  hidden?: boolean;
  material?: "matte" | "glossy" | "metal" | "glass" | "wood" | "stone" | "concrete";
  costPerUnit?: number;
}

export type PresetKey =
  | "empty" | "home" | "office" | "restaurant" | "temple"
  | "villa" | "apartment" | "school" | "hospital" | "mall"
  | "mosque" | "hotel" | "cafe" | "gym";

export type ViewMode = "3d" | "top" | "front" | "side";
export type GizmoMode = "translate" | "rotate" | "scale";

export interface SceneSettings {
  timeOfDay: number; // 0-24
  fog: number; // 0-1
  groundColor: string;
  snapEnabled: boolean;
  snapSize: number;
  showDimensions: boolean;
  showGrid: boolean;
  viewMode: ViewMode;
  screenshotTick: number;
  gizmoMode: GizmoMode;
}

interface History { past: SceneObject[][]; future: SceneObject[][] }

interface SceneState {
  objects: SceneObject[];
  selectedId: string | null;
  preset: PresetKey;
  settings: SceneSettings;
  history: History;
  add: (kind: ObjectKind) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  select: (id: string | null) => void;
  update: (id: string, patch: Partial<SceneObject>) => void;
  toggleLock: (id: string) => void;
  toggleHidden: (id: string) => void;
  clear: () => void;
  loadPreset: (preset: PresetKey) => void;
  setAll: (objs: SceneObject[]) => void;
  undo: () => void;
  redo: () => void;
  setSetting: <K extends keyof SceneSettings>(k: K, v: SceneSettings[K]) => void;
  saveLocal: (name?: string) => void;
  loadLocal: (name?: string) => boolean;
  exportJSON: () => string;
  importJSON: (text: string) => boolean;
  applyAIScene: (objs: Partial<SceneObject>[], merge?: boolean) => void;
  requestScreenshot: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

type Def = Omit<SceneObject, "id" | "position">;
export const defaults: Record<ObjectKind, Def> = {
  wall:       { kind: "wall",       label: "Wall",        size: [4, 3, 0.2],   rotationY: 0, color: "#d6c9a8", material: "matte",    costPerUnit: 120 },
  floor:      { kind: "floor",      label: "Floor",       size: [6, 0.1, 6],   rotationY: 0, color: "#8b6f47", material: "wood",     costPerUnit: 80 },
  door:       { kind: "door",       label: "Door",        size: [1, 2.2, 0.1], rotationY: 0, color: "#6b3a1a", material: "wood",     costPerUnit: 200 },
  window:     { kind: "window",     label: "Window",      size: [1.2, 1, 0.1], rotationY: 0, color: "#7ec8e3", material: "glass",    costPerUnit: 150 },
  roof:       { kind: "roof",       label: "Roof",        size: [6, 0.3, 6],   rotationY: 0, color: "#b54225", material: "matte",    costPerUnit: 90 },
  column:     { kind: "column",     label: "Column",      size: [0.4, 3, 0.4], rotationY: 0, color: "#e8e2d0", material: "stone",    costPerUnit: 140 },
  furniture:  { kind: "furniture",  label: "Furniture",   size: [1.5, 0.8, 1], rotationY: 0, color: "#3a3a3a", material: "matte",    costPerUnit: 250 },
  tree:       { kind: "tree",       label: "Tree",        size: [0.6, 2.5, 0.6], rotationY: 0, color: "#3d6b35", material: "matte", costPerUnit: 50 },
  dome:       { kind: "dome",       label: "Dome",        size: [2, 2, 2],     rotationY: 0, color: "#e8b34a", material: "metal",    costPerUnit: 400 },
  stair:      { kind: "stair",      label: "Stairs",      size: [2, 1.8, 3],   rotationY: 0, color: "#a8967a", material: "wood",     costPerUnit: 220 },
  railing:    { kind: "railing",    label: "Railing",     size: [3, 1, 0.1],   rotationY: 0, color: "#222",    material: "metal",    costPerUnit: 60 },
  pool:       { kind: "pool",       label: "Pool",        size: [5, 0.6, 3],   rotationY: 0, color: "#2aa9c9", material: "glass",    costPerUnit: 600 },
  car:        { kind: "car",        label: "Car",         size: [1.8, 1.4, 4], rotationY: 0, color: "#202830", material: "glossy",   costPerUnit: 0 },
  person:     { kind: "person",     label: "Person",      size: [0.5, 1.7, 0.3], rotationY: 0, color: "#e6c1a0", material: "matte",  costPerUnit: 0 },
  streetlamp: { kind: "streetlamp", label: "Street Lamp", size: [0.2, 4, 0.2], rotationY: 0, color: "#1a1a1a", material: "metal",    costPerUnit: 180 },
  fence:      { kind: "fence",      label: "Fence",       size: [3, 1.2, 0.1], rotationY: 0, color: "#6b4a2a", material: "wood",     costPerUnit: 40 },
  bed:        { kind: "bed",        label: "Bed",         size: [2, 0.6, 1.8], rotationY: 0, color: "#c8b8d8", material: "matte",    costPerUnit: 350 },
  table:      { kind: "table",      label: "Table",       size: [1.6, 0.8, 0.9], rotationY: 0, color: "#7a4a2a", material: "wood",   costPerUnit: 180 },
  chair:      { kind: "chair",      label: "Chair",       size: [0.5, 1, 0.5], rotationY: 0, color: "#444",    material: "matte",    costPerUnit: 60 },
  sink:       { kind: "sink",       label: "Sink",        size: [0.6, 0.9, 0.5], rotationY: 0, color: "#f0f0f0", material: "glossy", costPerUnit: 120 },
  toilet:     { kind: "toilet",     label: "Toilet",      size: [0.5, 0.8, 0.7], rotationY: 0, color: "#ffffff", material: "glossy", costPerUnit: 200 },
  tv:         { kind: "tv",         label: "TV",          size: [1.6, 0.9, 0.08], rotationY: 0, color: "#0a0a0a", material: "glossy", costPerUnit: 500 },
  plant:      { kind: "plant",      label: "Plant",       size: [0.5, 1, 0.5], rotationY: 0, color: "#3d6b35", material: "matte",    costPerUnit: 25 },
  fountain:   { kind: "fountain",   label: "Fountain",    size: [2, 1, 2],     rotationY: 0, color: "#a0a8b0", material: "stone",    costPerUnit: 800 },
  statue:     { kind: "statue",     label: "Statue",      size: [0.8, 2.2, 0.8], rotationY: 0, color: "#d8d4c8", material: "stone",  costPerUnit: 600 },
  gate:       { kind: "gate",       label: "Gate",        size: [3, 2.5, 0.15], rotationY: 0, color: "#2a2a2a", material: "metal",   costPerUnit: 400 },
  sign:       { kind: "sign",       label: "Signboard",   size: [2, 1, 0.1],   rotationY: 0, color: "#f5b441", material: "matte",    costPerUnit: 120 },
  solar:      { kind: "solar",      label: "Solar Panel", size: [2, 0.05, 1],  rotationY: 0, color: "#1a2a5a", material: "glossy",   costPerUnit: 450 },
  kitchen:    { kind: "kitchen",    label: "Kitchen Unit",size: [2.5, 0.9, 0.6], rotationY: 0, color: "#d8d8d0", material: "glossy", costPerUnit: 700 },
  bathtub:    { kind: "bathtub",    label: "Bathtub",     size: [1.8, 0.6, 0.9], rotationY: 0, color: "#ffffff", material: "glossy", costPerUnit: 450 },
  sofa:       { kind: "sofa",       label: "Sofa",        size: [2.4, 0.9, 1],   rotationY: 0, color: "#5d4a8a", material: "matte",  costPerUnit: 600 },
};

const o = (kind: ObjectKind, position: [number, number, number], patch: Partial<SceneObject> = {}): SceneObject =>
  ({ id: uid(), ...defaults[kind], position, ...patch });

function makeHome(): SceneObject[] {
  return [
    o("floor", [0, 0, 0], { label: "Ground", size: [10, 0.1, 8] }),
    o("wall", [0, 1.5, -4], { label: "Back wall", size: [10, 3, 0.2] }),
    o("wall", [-5, 1.5, 0], { label: "Left wall", size: [0.2, 3, 8] }),
    o("wall", [5, 1.5, 0], { label: "Right wall", size: [0.2, 3, 8] }),
    o("wall", [-3.25, 1.5, 4], { size: [3.5, 3, 0.2] }),
    o("wall", [3.25, 1.5, 4], { size: [3.5, 3, 0.2] }),
    o("door", [0, 1.1, 4]),
    o("window", [-2.5, 1.8, -4]),
    o("window", [2.5, 1.8, -4]),
    o("roof", [0, 3.15, 0], { size: [10.4, 0.3, 8.4] }),
    o("sofa", [-2, 0.45, -2]),
    o("tv", [0, 1.5, -3.8], { size: [1.6, 0.9, 0.08] }),
    o("tree", [-6, 1.25, 3]),
    o("car", [7, 0.7, 4], { rotationY: Math.PI / 2 }),
  ];
}
function makeOffice(): SceneObject[] {
  const desks: SceneObject[] = [];
  for (let x = -4; x <= 4; x += 4) for (let z = -2; z <= 2; z += 4) desks.push(o("table", [x, 0.4, z], { label: "Desk", color: "#3a4a6a" }));
  return [
    o("floor", [0, 0, 0], { size: [14, 0.1, 10], color: "#cccccc" }),
    o("wall", [0, 2, -5], { size: [14, 4, 0.2], color: "#dfe5ec" }),
    o("wall", [-7, 2, 0], { size: [0.2, 4, 10], color: "#dfe5ec" }),
    o("wall", [7, 2, 0], { size: [0.2, 4, 10], color: "#dfe5ec" }),
    o("window", [0, 2.2, 5], { size: [12, 2.5, 0.1] }),
    o("column", [-3, 2, 0]), o("column", [3, 2, 0]),
    ...desks,
    o("roof", [0, 4.1, 0], { size: [14.4, 0.2, 10.4], color: "#888" }),
  ];
}
function makeRestaurant(): SceneObject[] {
  const t: SceneObject[] = [];
  for (let x = -4; x <= 4; x += 4) for (let z = -3; z <= 3; z += 3) t.push(o("table", [x, 0.4, z], { size: [1.2, 0.8, 1.2], color: "#7a4a2a" }));
  return [
    o("floor", [0, 0, 0], { size: [14, 0.1, 10], color: "#3a1f12" }),
    o("wall", [0, 1.75, -5], { size: [14, 3.5, 0.2], color: "#5a2418" }),
    o("wall", [-7, 1.75, 0], { size: [0.2, 3.5, 10], color: "#5a2418" }),
    o("wall", [7, 1.75, 0], { size: [0.2, 3.5, 10], color: "#5a2418" }),
    o("door", [0, 1.1, 5]),
    ...t,
    o("roof", [0, 3.65, 0], { size: [14.4, 0.3, 10.4], color: "#2a1208" }),
  ];
}
function makeTemple(): SceneObject[] {
  return [
    o("floor", [0, 0.2, 0], { size: [12, 0.4, 12], color: "#e8d9b8" }),
    o("floor", [0, 0.6, 0], { size: [10, 0.4, 10], color: "#f0e4c8" }),
    o("column", [-4, 2.8, -4], { size: [0.6, 4, 0.6], color: "#fff8e0" }),
    o("column", [4, 2.8, -4], { size: [0.6, 4, 0.6], color: "#fff8e0" }),
    o("column", [-4, 2.8, 4], { size: [0.6, 4, 0.6], color: "#fff8e0" }),
    o("column", [4, 2.8, 4], { size: [0.6, 4, 0.6], color: "#fff8e0" }),
    o("wall", [0, 2.6, -4], { size: [8, 3.5, 0.3], color: "#e8b34a" }),
    o("roof", [0, 5, 0], { size: [10, 0.4, 10], color: "#c87a2a" }),
    o("dome", [0, 6.5, 0], { size: [3, 3, 3] }),
    o("statue", [0, 1.7, -2], { color: "#d4af37" }),
  ];
}
function makeVilla(): SceneObject[] {
  return [
    o("floor", [0, 0, 0], { size: [18, 0.1, 14], color: "#f0e8d8" }),
    o("wall", [0, 1.5, -7], { size: [18, 3, 0.2] }),
    o("wall", [-9, 1.5, 0], { size: [0.2, 3, 14] }),
    o("wall", [9, 1.5, 0], { size: [0.2, 3, 14] }),
    o("wall", [-6, 1.5, 7], { size: [6, 3, 0.2] }),
    o("wall", [6, 1.5, 7], { size: [6, 3, 0.2] }),
    o("door", [0, 1.1, 7]),
    o("roof", [0, 3.15, 0], { size: [18.4, 0.3, 14.4], color: "#8a3a20" }),
    o("pool", [-5, 0.3, 11], { size: [6, 0.6, 4] }),
    o("tree", [-8, 1.25, 10]), o("tree", [8, 1.25, 10]),
    o("car", [7, 0.7, 12]),
    o("solar", [-3, 3.4, -2]), o("solar", [3, 3.4, -2]),
    o("fence", [0, 0.6, 14], { size: [18, 1.2, 0.1] }),
    o("gate", [0, 1.25, 14]),
  ];
}
function makeApartment(): SceneObject[] {
  const out: SceneObject[] = [o("floor", [0, 0, 0], { size: [12, 0.1, 20], color: "#bcb8b0" })];
  for (let f = 0; f < 4; f++) {
    const y = f * 3;
    out.push(o("wall", [0, y + 1.5, -10], { size: [12, 3, 0.2] }));
    out.push(o("wall", [-6, y + 1.5, 0], { size: [0.2, 3, 20] }));
    out.push(o("wall", [6, y + 1.5, 0], { size: [0.2, 3, 20] }));
    out.push(o("floor", [0, y + 3, 0], { size: [12, 0.15, 20], color: "#cccccc" }));
    for (let i = -8; i <= 8; i += 4) out.push(o("window", [-5.9, y + 1.8, i], { rotationY: Math.PI / 2, color: "#7ec8e3" }));
  }
  out.push(o("roof", [0, 12.2, 0], { size: [12.4, 0.3, 20.4] }));
  return out;
}
function makeSchool(): SceneObject[] {
  const out: SceneObject[] = [
    o("floor", [0, 0, 0], { size: [24, 0.1, 14], color: "#d8c8a0" }),
    o("wall", [0, 1.75, -7], { size: [24, 3.5, 0.2], color: "#f0d090" }),
    o("wall", [-12, 1.75, 0], { size: [0.2, 3.5, 14] }),
    o("wall", [12, 1.75, 0], { size: [0.2, 3.5, 14] }),
    o("roof", [0, 3.7, 0], { size: [24.4, 0.3, 14.4], color: "#7a3a20" }),
    o("sign", [0, 3.5, 7], { label: "School" }),
  ];
  for (let i = -10; i <= 10; i += 5) out.push(o("window", [i, 2, 7], { size: [2, 1.4, 0.1] }));
  return out;
}
function makeHospital(): SceneObject[] {
  return [
    o("floor", [0, 0, 0], { size: [20, 0.1, 14], color: "#e0ecef" }),
    o("wall", [0, 1.75, -7], { size: [20, 3.5, 0.2], color: "#ffffff" }),
    o("wall", [-10, 1.75, 0], { size: [0.2, 3.5, 14], color: "#ffffff" }),
    o("wall", [10, 1.75, 0], { size: [0.2, 3.5, 14], color: "#ffffff" }),
    o("roof", [0, 3.7, 0], { size: [20.4, 0.3, 14.4], color: "#cc2a2a" }),
    o("sign", [0, 3.4, 7], { label: "Hospital", color: "#cc2a2a" }),
    o("bed", [-5, 0.3, -3]), o("bed", [0, 0.3, -3]), o("bed", [5, 0.3, -3]),
  ];
}
function makeMall(): SceneObject[] {
  const out: SceneObject[] = [o("floor", [0, 0, 0], { size: [30, 0.1, 20], color: "#e8e8ec" })];
  for (let f = 0; f < 2; f++) {
    const y = f * 4;
    out.push(o("wall", [0, y + 2, -10], { size: [30, 4, 0.2], color: "#dcdce4" }));
    out.push(o("floor", [0, y + 4, 0], { size: [30, 0.2, 20], color: "#bcbcc4" }));
    out.push(o("column", [-10, y + 2, 0], { size: [0.6, 4, 0.6] }));
    out.push(o("column", [0, y + 2, 0], { size: [0.6, 4, 0.6] }));
    out.push(o("column", [10, y + 2, 0], { size: [0.6, 4, 0.6] }));
  }
  out.push(o("roof", [0, 8.2, 0], { size: [30.4, 0.3, 20.4] }));
  return out;
}
function makeMosque(): SceneObject[] {
  return [
    o("floor", [0, 0.2, 0], { size: [14, 0.4, 14], color: "#f0e8d0" }),
    o("wall", [0, 2, -7], { size: [14, 4, 0.3], color: "#e8d8b0" }),
    o("wall", [-7, 2, 0], { size: [0.3, 4, 14], color: "#e8d8b0" }),
    o("wall", [7, 2, 0], { size: [0.3, 4, 14], color: "#e8d8b0" }),
    o("dome", [0, 5, 0], { size: [5, 5, 5], color: "#2a8a6a" }),
    o("column", [-6, 6, -6], { size: [0.4, 12, 0.4], color: "#f0e8d0" }),
    o("column", [6, 6, -6], { size: [0.4, 12, 0.4], color: "#f0e8d0" }),
    o("dome", [-6, 12, -6], { size: [0.8, 0.8, 0.8], color: "#2a8a6a" }),
    o("dome", [6, 12, -6], { size: [0.8, 0.8, 0.8], color: "#2a8a6a" }),
  ];
}
function makeHotel(): SceneObject[] {
  const out: SceneObject[] = [o("floor", [0, 0, 0], { size: [18, 0.1, 12], color: "#cca870" })];
  for (let f = 0; f < 6; f++) {
    const y = f * 3;
    out.push(o("wall", [0, y + 1.5, -6], { size: [18, 3, 0.2], color: "#e8c890" }));
    out.push(o("floor", [0, y + 3, 0], { size: [18, 0.15, 12], color: "#a0825a" }));
    for (let i = -7; i <= 7; i += 3.5) out.push(o("window", [i, y + 1.7, 6], { size: [2, 1.4, 0.1] }));
  }
  out.push(o("roof", [0, 18.2, 0], { size: [18.4, 0.3, 12.4] }));
  out.push(o("sign", [0, 19, 6], { label: "HOTEL" }));
  return out;
}
function makeCafe(): SceneObject[] {
  const t: SceneObject[] = [];
  for (let x = -3; x <= 3; x += 3) for (let z = -2; z <= 2; z += 2.5) {
    t.push(o("table", [x, 0.4, z], { size: [0.9, 0.8, 0.9], color: "#5a3a1a" }));
    t.push(o("chair", [x + 0.7, 0.5, z]));
    t.push(o("chair", [x - 0.7, 0.5, z]));
  }
  return [
    o("floor", [0, 0, 0], { size: [10, 0.1, 8], color: "#a07a4a" }),
    o("wall", [0, 1.5, -4], { size: [10, 3, 0.2], color: "#3a2010" }),
    o("wall", [-5, 1.5, 0], { size: [0.2, 3, 8], color: "#3a2010" }),
    o("wall", [5, 1.5, 0], { size: [0.2, 3, 8], color: "#3a2010" }),
    o("kitchen", [0, 0.45, -3.5]),
    ...t,
    o("roof", [0, 3.15, 0], { size: [10.4, 0.3, 8.4], color: "#2a1208" }),
    o("sign", [0, 3.6, 4], { label: "CAFE" }),
  ];
}
function makeGym(): SceneObject[] {
  return [
    o("floor", [0, 0, 0], { size: [16, 0.1, 12], color: "#2a2a2a" }),
    o("wall", [0, 2, -6], { size: [16, 4, 0.2], color: "#404040" }),
    o("wall", [-8, 2, 0], { size: [0.2, 4, 12], color: "#404040" }),
    o("wall", [8, 2, 0], { size: [0.2, 4, 12], color: "#404040" }),
    o("furniture", [-4, 0.6, 0], { label: "Treadmill", size: [1, 1.2, 2], color: "#ff5722" }),
    o("furniture", [0, 0.6, 0], { label: "Treadmill", size: [1, 1.2, 2], color: "#ff5722" }),
    o("furniture", [4, 0.6, 0], { label: "Bench", size: [0.6, 0.5, 2], color: "#111" }),
    o("roof", [0, 4.15, 0], { size: [16.4, 0.3, 12.4] }),
  ];
}

const presetMakers: Record<PresetKey, () => SceneObject[]> = {
  empty: () => [],
  home: makeHome, office: makeOffice, restaurant: makeRestaurant, temple: makeTemple,
  villa: makeVilla, apartment: makeApartment, school: makeSchool, hospital: makeHospital,
  mall: makeMall, mosque: makeMosque, hotel: makeHotel, cafe: makeCafe, gym: makeGym,
};

const initialSettings: SceneSettings = {
  timeOfDay: 13, fog: 0.0, groundColor: "#2a3a2a",
  snapEnabled: true, snapSize: 0.5, showDimensions: true,
  showGrid: true, viewMode: "3d", screenshotTick: 0,
};

const snap = (v: number, s: number) => Math.round(v / s) * s;

export const useScene = create<SceneState>((set, get) => {
  const push = (next: SceneObject[]) => {
    const s = get();
    set({ history: { past: [...s.history.past.slice(-49), s.objects], future: [] }, objects: next });
  };
  return {
    objects: makeHome(),
    selectedId: null,
    preset: "home",
    settings: initialSettings,
    history: { past: [], future: [] },
    add: (kind) => {
      const def = defaults[kind];
      const obj: SceneObject = { id: uid(), ...def, position: [0, def.size[1] / 2, 0] };
      push([...get().objects, obj]);
      set({ selectedId: obj.id });
    },
    remove: (id) => { push(get().objects.filter((o) => o.id !== id)); set({ selectedId: null }); },
    duplicate: (id) => {
      const src = get().objects.find((o) => o.id === id); if (!src) return;
      const copy: SceneObject = { ...src, id: uid(), position: [src.position[0] + 1, src.position[1], src.position[2] + 1], label: src.label + " copy" };
      push([...get().objects, copy]); set({ selectedId: copy.id });
    },
    select: (id) => set({ selectedId: id }),
    update: (id, patch) => {
      const s = get(); const snapOn = s.settings.snapEnabled; const sz = s.settings.snapSize;
      const next = s.objects.map((o) => {
        if (o.id !== id) return o;
        const p = { ...patch };
        if (p.position && snapOn) p.position = [snap(p.position[0], sz), p.position[1], snap(p.position[2], sz)] as [number, number, number];
        return { ...o, ...p };
      });
      push(next);
    },
    toggleLock: (id) => push(get().objects.map((o) => o.id === id ? { ...o, locked: !o.locked } : o)),
    toggleHidden: (id) => push(get().objects.map((o) => o.id === id ? { ...o, hidden: !o.hidden } : o)),
    clear: () => { push([]); set({ selectedId: null, preset: "empty" }); },
    setAll: (objs) => { push(objs); set({ selectedId: null }); },
    loadPreset: (preset) => { push(presetMakers[preset]()); set({ preset, selectedId: null }); },
    undo: () => {
      const s = get(); if (!s.history.past.length) return;
      const prev = s.history.past[s.history.past.length - 1];
      set({ objects: prev, history: { past: s.history.past.slice(0, -1), future: [s.objects, ...s.history.future] }, selectedId: null });
    },
    redo: () => {
      const s = get(); if (!s.history.future.length) return;
      const next = s.history.future[0];
      set({ objects: next, history: { past: [...s.history.past, s.objects], future: s.history.future.slice(1) }, selectedId: null });
    },
    setSetting: (k, v) => set({ settings: { ...get().settings, [k]: v } }),
    saveLocal: (name = "default") => {
      try { localStorage.setItem("architectai:" + name, JSON.stringify({ objects: get().objects, settings: get().settings })); } catch {}
    },
    loadLocal: (name = "default") => {
      try {
        const raw = localStorage.getItem("architectai:" + name); if (!raw) return false;
        const data = JSON.parse(raw); push(data.objects || []); if (data.settings) set({ settings: { ...initialSettings, ...data.settings } });
        return true;
      } catch { return false; }
    },
    exportJSON: () => JSON.stringify({ objects: get().objects, settings: get().settings }, null, 2),
    importJSON: (text) => {
      try { const d = JSON.parse(text); if (!Array.isArray(d.objects)) return false; push(d.objects); if (d.settings) set({ settings: { ...initialSettings, ...d.settings } }); return true; } catch { return false; }
    },
    applyAIScene: (objs, merge = false) => {
      const cleaned: SceneObject[] = objs
        .filter((o) => o && o.kind && defaults[o.kind as ObjectKind])
        .map((o) => {
          const def = defaults[o.kind as ObjectKind];
          return {
            id: uid(),
            kind: o.kind as ObjectKind,
            label: o.label || def.label,
            position: (o.position as [number, number, number]) || [0, def.size[1] / 2, 0],
            size: (o.size as [number, number, number]) || def.size,
            rotationY: typeof o.rotationY === "number" ? o.rotationY : 0,
            color: o.color || def.color,
            material: o.material || def.material,
            costPerUnit: def.costPerUnit,
          };
        });
      push(merge ? [...get().objects, ...cleaned] : cleaned);
    },
    requestScreenshot: () => set({ settings: { ...get().settings, screenshotTick: get().settings.screenshotTick + 1 } }),
  };
});

export function totalArea(objs: SceneObject[]) {
  return objs.filter((o) => o.kind === "floor").reduce((s, o) => s + o.size[0] * o.size[2], 0);
}
export function totalCost(objs: SceneObject[]) {
  return objs.reduce((s, o) => {
    const c = o.costPerUnit ?? 0;
    const vol = Math.max(1, o.size[0] * Math.max(0.1, o.size[1]) * o.size[2]);
    return s + c * Math.max(1, Math.cbrt(vol));
  }, 0);
}
