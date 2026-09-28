const fs = require('fs');
const file = 'src/pages/Intro.jsx';
let code = fs.readFileSync(file, 'utf8');
let lines = code.split(/\r?\n/);
const startIdx = lines.findIndex(l => l.includes('function latLonToVector3(lat, lon, radius) {'));
const endIdx = lines.findIndex(l => l.includes('export default function PolarisIntro({ onEnter }) {'));
if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    lines.splice(startIdx, endIdx - startIdx);
}
code = lines.join('\n');
code = code.replace('import * as THREE from "three";\n', '');
code = code.replace('import * as THREE from "three";\r\n', '');
code = code.replace('import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";\n', '');
code = code.replace('import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";\r\n', '');
fs.writeFileSync(file, code);
