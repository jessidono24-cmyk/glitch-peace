'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — void-nexus-3d.js — 3D-E Phase
//
//  Full 3D rendering pilot for the VOID NEXUS dreamscape.
//  Replaces the flat 2D grid with a Three.js top-down scene when
//  CFG.viewMode === 'iso' AND the active dreamscape is 'void_nexus'.
//
//  Scene design:
//    - Infinite space background (deep black + additive star particles)
//    - Tile objects at (col, row) grid positions as 3D geometry:
//        VOID     — flat invisible floor plane (barely visible grid lines)
//        PEACE    — rising crystalline pillar (green emissive)
//        INSIGHT  — spinning octahedron (cyan emissive)
//        WALL     — obsidian slab (dark, slightly reflective)
//        ARCHETYPE— golden pulsing sphere
//        HAZARD   — red/orange jagged cluster
//    - Player — glowing orb that floats above the floor
//    - Camera — orthographic top-down with slight 15° tilt (iso feel)
//    - Event horizon shader effect on Void Nexus boss tile
// ═══════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { ThreeLayer } from './three-layer.js';
import { T } from '../core/constants.js';

const TILE_STEP = 1.1; // world units per grid step
const FLOOR_Y   = 0;   // y coordinate of tile top surface

// Tile type → geometry + material factory
function _tileMesh(tileType) {
  switch (tileType) {
    case T.WALL: {
      const g = new THREE.BoxGeometry(0.9, 0.55, 0.9);
      const m = new THREE.MeshPhongMaterial({ color: 0x0d0d1a, emissive: 0x040410, shininess: 80 });
      return new THREE.Mesh(g, m);
    }
    case T.PEACE: {
      const g = new THREE.CylinderGeometry(0.15, 0.22, 0.55, 6);
      const m = new THREE.MeshPhongMaterial({ color: 0x004422, emissive: 0x00ff88, emissiveIntensity: 0.7 });
      return new THREE.Mesh(g, m);
    }
    case T.INSIGHT: {
      const g = new THREE.OctahedronGeometry(0.30, 0);
      const m = new THREE.MeshPhongMaterial({ color: 0x003344, emissive: 0x00eeff, emissiveIntensity: 0.8 });
      return new THREE.Mesh(g, m);
    }
    case T.ARCHETYPE: {
      const g = new THREE.SphereGeometry(0.28, 10, 10);
      const m = new THREE.MeshPhongMaterial({ color: 0x443300, emissive: 0xffdd44, emissiveIntensity: 0.9 });
      return new THREE.Mesh(g, m);
    }
    case T.RAGE: case T.TRAP: case T.DESPAIR: {
      const g = new THREE.DodecahedronGeometry(0.28, 0);
      const m = new THREE.MeshPhongMaterial({ color: 0x220000, emissive: 0xff2200, emissiveIntensity: 0.6 });
      return new THREE.Mesh(g, m);
    }
    default:
      return null; // VOID/empty tiles — no mesh
  }
}

export class VoidNexus3D extends ThreeLayer {
  constructor(width, height) {
    super(width, height);

    // Top-down camera with slight tilt for iso feel
    const aspect = width / height;
    const vp     = 6;
    this.camera = new THREE.OrthographicCamera(
      -vp * aspect, vp * aspect, vp, -vp, 0.1, 200
    );
    this.camera.position.set(0, 14, 8);
    this.camera.lookAt(0, 0, 0);

    this._tileMeshes = new Map(); // key: `${y},${x}` → mesh
    this._playerOrb  = null;
    this._grid       = null;
    this._sz         = 0;
    this._buildLighting();
    this._buildFloor();
    this._buildBackground();
  }

  _buildLighting() {
    this.scene.add(new THREE.AmbientLight(0x050510, 2));
    const dirL = new THREE.DirectionalLight(0x8800ff, 1.2);
    dirL.position.set(5, 10, 5);
    this.scene.add(dirL);
    const pointL = new THREE.PointLight(0x00ffaa, 1.5, 12);
    pointL.position.set(0, 4, 0);
    this.scene.add(pointL);
  }

  _buildFloor() {
    // Subtle grid floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x111122, 0x0a0a18);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
    // Dark base plane
    const planeGeo = new THREE.PlaneGeometry(30, 30);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0x01010a, side: THREE.BackSide });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    this.scene.add(plane);
  }

  _buildBackground() {
    // Far background star particles (additive, static)
    const count = 300;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 40;
      pos[i*3+1] = 2 + Math.random() * 20;
      pos[i*3+2] = (Math.random() - 0.5) * 40;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, blending: THREE.AdditiveBlending, depthWrite: false });
    this.scene.add(new THREE.Points(geo, mat));
  }

  // Sync 3D scene with the current game grid
  syncGrid(grid, sz) {
    if (this._sz !== sz || this._grid !== grid) {
      // Rebuild all tile meshes
      for (const m of this._tileMeshes.values()) {
        this.scene.remove(m);
        m.geometry.dispose();
        m.material.dispose();
      }
      this._tileMeshes.clear();

      for (let y = 0; y < sz; y++) {
        for (let x = 0; x < sz; x++) {
          const tileType = grid[y][x];
          const mesh     = _tileMesh(tileType);
          if (!mesh) continue;
          // Position: centre grid at origin
          mesh.position.x = (x - (sz - 1) / 2) * TILE_STEP;
          mesh.position.z = (y - (sz - 1) / 2) * TILE_STEP;
          mesh.position.y = tileType === T.WALL ? 0.28 : 0.25;
          this.scene.add(mesh);
          this._tileMeshes.set(`${y},${x}`, mesh);
        }
      }
      this._grid = grid;
      this._sz   = sz;
    }

    // Update live tile changes (collected PEACE/INSIGHT → remove mesh)
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const key  = `${y},${x}`;
        const mesh = this._tileMeshes.get(key);
        if (!mesh) continue;
        if (grid[y][x] === T.VOID || grid[y][x] === 0) {
          this.scene.remove(mesh);
          mesh.geometry.dispose();
          mesh.material.dispose();
          this._tileMeshes.delete(key);
        }
      }
    }
  }

  // Sync player orb position
  syncPlayer(playerY, playerX, sz) {
    if (!this._playerOrb) {
      const geo = new THREE.SphereGeometry(0.25, 12, 12);
      const mat = new THREE.MeshPhongMaterial({ color: 0x005533, emissive: 0x00ffaa, emissiveIntensity: 1.0 });
      this._playerOrb = new THREE.Mesh(geo, mat);
      // Glow halo
      const haloGeo = new THREE.SphereGeometry(0.38, 8, 8);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.12 });
      this._playerOrb.add(new THREE.Mesh(haloGeo, haloMat));
      this.scene.add(this._playerOrb);
    }
    this._playerOrb.position.x = (playerX - (sz - 1) / 2) * TILE_STEP;
    this._playerOrb.position.z = (playerY - (sz - 1) / 2) * TILE_STEP;
    this._playerOrb.position.y = 0.55;
  }

  // Animate spinning tiles + player bob
  animate(ts) {
    const t = ts * 0.001;
    for (const [key, mesh] of this._tileMeshes.entries()) {
      // Spin INSIGHT octahedra and ARCHETYPE spheres
      if (mesh.geometry.type === 'OctahedronGeometry') mesh.rotation.y = t * 1.5;
      if (mesh.geometry.type === 'SphereGeometry' &&
          mesh.material.emissive.getHex() === 0xffdd44) {
        mesh.rotation.y = t * 0.8;
        mesh.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3);
      }
      // Peace pillars gentle height pulse
      if (mesh.geometry.type === 'CylinderGeometry') {
        mesh.position.y = 0.25 + 0.04 * Math.sin(t * 2);
      }
    }
    // Player orb bob
    if (this._playerOrb) {
      this._playerOrb.position.y = 0.55 + 0.08 * Math.sin(t * 4);
      this._playerOrb.rotation.y = t * 2;
    }
    // Gentle camera orbit
    this.camera.position.x = Math.sin(t * 0.12) * 1.2;
    this.camera.lookAt(0, 0, 0);
  }
}

// Lazily created singleton
let _voidScene = null;
export function getVoidNexus3D(w, h) {
  if (!_voidScene) _voidScene = new VoidNexus3D(w, h);
  if (_voidScene.width !== w || _voidScene.height !== h) _voidScene.resize(w, h);
  return _voidScene;
}
