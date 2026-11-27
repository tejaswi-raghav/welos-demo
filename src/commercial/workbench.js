import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildModel, MOVES } from '../twin/model.js';
import { GROUPS } from './data.js';
import { prepareConceptModel, fleetVisibleCount } from './concept.js';

// A new scene owns its camera, materials and lifecycle. Original scene code is never edited.
export function createWorkbench(canvas,{mode='lab',onPick=()=>{}}={}) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,500);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=75;controls.maxPolarAngle=Math.PI*.48;
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(new RoomEnvironment(),.08);scene.environment=environment.texture;scene.environmentIntensity=.65;pmrem.dispose();
 scene.add(new THREE.HemisphereLight('#fff5e6','#2c150d',2));const key=new THREE.DirectionalLight('#ffc65a',3);key.position.set(5,9,6);scene.add(key);const fill=new THREE.DirectionalLight('#8ccdf3',1);fill.position.set(-8,4,-3);scene.add(fill);
 const model=buildModel(),fleet=new THREE.Group();scene.add(mode==='lab'?model.root:fleet);
 prepareConceptModel(model,{lab:mode==='lab'});
 const home=new Map();for(const [k,objs]of Object.entries(model.KEY))for(const obj of objs)home.set(obj,obj.position.clone());
 model.meshes.forEach(m=>{m.material=m.material.clone();m.userData.originalColor=m.material.color.clone();});
 const buildingGeo=new THREE.BoxGeometry(7,3,7),buildingMat=new THREE.MeshStandardMaterial({color:'#5f4434',roughness:.8}),roofGeo=new THREE.BoxGeometry(7.3,.12,7.3),roofMat=new THREE.MeshStandardMaterial({color:'#b29a7d',roughness:.6});
 const pvTemplate=model.KEY['pv-array'][0];
 let lastRender=0;
 let state={exploded:false,selected:'solar',cleaning:true,buildings:4,scale:'neighborhood'},disposed=false,raf,explode=0,poseT=0,poseStart=performance.now(),cameraFrom=new THREE.Vector3(),cameraTo=new THREE.Vector3();
 const target=new THREE.Vector3(0,-.5,0);camera.position.set(mode==='lab'?13:22,mode==='lab'?8:18,mode==='lab'?18:26);controls.target.copy(target);controls.update();
 function buildFleet(){
  fleet.clear();const count=fleetVisibleCount(state.buildings,state.scale),cols=Math.ceil(Math.sqrt(count));
  for(let i=0;i<count;i++){const g=new THREE.Group(),body=new THREE.Mesh(buildingGeo,buildingMat),roof=new THREE.Mesh(roofGeo,roofMat),pv=pvTemplate.clone(true);body.position.y=0;roof.position.y=1.55;const box=new THREE.Box3().setFromObject(pv),size=box.getSize(new THREE.Vector3());pv.scale.setScalar(5/Math.max(size.x,size.z));pv.updateMatrixWorld(true);pv.position.sub(new THREE.Box3().setFromObject(pv).getCenter(new THREE.Vector3()));pv.position.y+=2.15;g.add(body,roof,pv);g.position.set((i%cols-(cols-1)/2)*10,0,(Math.floor(i/cols)-(Math.ceil(count/cols)-1)/2)*10);fleet.add(g);}
 }
 function update(next){const prior=state;state={...state,...next};if(mode==='fleet'&&(prior.buildings!==state.buildings||prior.scale!==state.scale)){buildFleet();cameraFrom.copy(camera.position);const d=state.scale==='single'?17:state.scale==='neighborhood'?29:47;cameraTo.set(d*.8,d*.65,d);poseStart=performance.now();poseT=1;} }
 if(mode==='fleet')buildFleet();
 const resize=()=>{const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);resize();
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 const pd=e=>{down=[e.clientX,e.clientY];};
 const pu=e=>{if(mode!=='lab'||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(model.root,true).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});if(hit){const group=GROUPS.find(g=>g.parts.includes(hit.object.userData.dimKey));if(group)onPick(group.id);}};
 canvas.addEventListener('pointerdown',pd);canvas.addEventListener('pointerup',pu);
 const rm=window.matchMedia('(prefers-reduced-motion: reduce)');const visible=()=>canvas.getBoundingClientRect().bottom>=0&&canvas.getBoundingClientRect().top<=window.innerHeight;
 function render(now){if(disposed)return;raf=requestAnimationFrame(render);if(document.hidden||!visible()||now-lastRender<1000/30)return;lastRender=now;
  if(mode==='lab'){
   explode+=(Number(state.exploded)-explode)*(rm.matches?1:.085);
   for(const[k,off,order]of MOVES){const t=THREE.MathUtils.smoothstep(explode,order*.35,.6+order*.35);for(const obj of model.KEY[k]||[]){const p=home.get(obj);obj.position.set(p.x+off[0]*t*1.8,p.y+off[1]*t*1.8,p.z+off[2]*t*1.8);}}
   ['water-pump','water-tank','cleaning-manifold','water-sensors'].forEach(k=>(model.KEY[k]||[]).forEach(o=>o.visible=state.cleaning));
   for(const m of model.meshes){const group=GROUPS.find(g=>g.id===state.selected),active=group?.parts.includes(m.userData.dimKey);m.material.color.copy(m.userData.originalColor);m.material.emissive.set(active?'#f47616':'#000000');m.material.emissiveIntensity=active?.35:0;}
  }else if(poseT){const t=rm.matches?1:Math.min(1,(now-poseStart)/900),ease=t*t*(3-2*t);camera.position.lerpVectors(cameraFrom,cameraTo,ease);if(t===1)poseT=0;}
  controls.update();renderer.render(scene,camera);
 }
 raf=requestAnimationFrame(render);
 return {update,reset(){controls.target.copy(target);const d=state.scale==='single'?17:state.scale==='neighborhood'?29:47;camera.position.set(mode==='lab'?13:d*.8,mode==='lab'?8:d*.65,mode==='lab'?18:d);poseT=0;controls.update();},dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();canvas.removeEventListener('pointerdown',pd);canvas.removeEventListener('pointerup',pu);controls.dispose();const geometries=new Set(),materials=new Set();for(const root of [scene,model.root])root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});environment.dispose();renderer.dispose();}};
}
