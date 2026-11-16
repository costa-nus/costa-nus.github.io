import * as T from './vendor/three.module.min.js';
import { buildCampusModels } from './campus-models.js';

export function createCampus(host, onFailure, onSelection) {
  const scene=new T.Scene(), fogColor=new T.Color(getComputedStyle(host).getPropertyValue('--paper').trim() || '#f5f1ea');
  scene.background=fogColor;
  const renderer=new T.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','group');
  canvas.setAttribute('aria-label','Interactive NUS campus. Click a building to zoom in; click open space to return. Keys 1, 2 and 3 select buildings. Drag or arrow keys rotate. Escape or Home returns to overview.');
  host.append(canvas);
  const camera=new T.OrthographicCamera(-24,24,12,-12,.1,200);
  scene.add(new T.HemisphereLight('#ecf5ff','#738282',1.7));
  const sun=new T.DirectionalLight('#fff0d7',2.6);sun.position.set(-18,34,22);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:24,bottom:-24,near:1,far:90});
  sun.shadow.normalBias=.025;sun.shadow.bias=-.00008;scene.add(sun);
  const fill=new T.DirectionalLight('#b4d2ed',.7);fill.position.set(20,10,-10);scene.add(fill);
  const models=buildCampusModels();const baseAngles=[.16,.12,-.78];
  // A shared parent makes the overview a single rigid arrangement.
  const campus=new T.Group();scene.add(campus);
  models.forEach((m,i)=>{m.rotation.y=baseAngles[i];campus.add(m);});
  const fogAmount={value:1};
  // Height fog blends lower architecture into the cloud layer. It is independent
  // of camera depth so nearby buildings also dissolve gently at their feet.
  const fogged=new Set();
  models.forEach(root=>root.traverse(o=>{
    if(!o.material?.isMeshStandardMaterial||o.material.userData.skipHeightFog||fogged.has(o.material))return;
    const material=o.material;fogged.add(material);
    material.onBeforeCompile=shader=>{
      shader.uniforms.campusFogColor={value:fogColor.clone().convertLinearToSRGB()};
      shader.uniforms.campusFogAmount=fogAmount;
      shader.vertexShader='varying float vCampusHeight;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
        vec4 campusWorld = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          campusWorld = instanceMatrix * campusWorld;
        #endif
        vCampusHeight = (modelMatrix * campusWorld).y;`);
      shader.fragmentShader='uniform vec3 campusFogColor; uniform float campusFogAmount; varying float vCampusHeight;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`#include <fog_fragment>
        float campusMist = (1.0 - smoothstep(-0.15, 1.15, vCampusHeight)) * campusFogAmount;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, campusFogColor, campusMist);`);
    };
    material.customProgramCacheKey=()=> 'campus-height-fog-v4';
  }));
  // Soft translucent billows: generated texture, with no external image request.
  const cloudCanvas=document.createElement('canvas');cloudCanvas.width=256;cloudCanvas.height=128;
  const ctx=cloudCanvas.getContext('2d');
  for(let i=0;i<22;i++) {
    const x=40+(i*53%173),y=34+(i*29%62),r=22+(i*13%30);
    const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(255,255,255,.3)');grad.addColorStop(.45,'rgba(255,255,255,.16)');grad.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,256,128);
  }
  const cloudTexture=new T.CanvasTexture(cloudCanvas);cloudTexture.colorSpace=T.SRGBColorSpace;
  const cloudMaterial=new T.SpriteMaterial({map:cloudTexture,color:'#ffffff',transparent:true,opacity:.7,depthWrite:false,fog:false,toneMapped:false});
  const cloudBanks=models.map(()=>new T.Group());
  cloudBanks.forEach((bank,index)=>{
    campus.add(bank);
    for(let i=0;i<26;i++) {
      const cloud=new T.Sprite(cloudMaterial);const a=i*2.399;
      const radius=3.8+(i%4)*.9;
      cloud.position.set(Math.cos(a)*radius,-.05+(i%3)*.16,Math.sin(a)*radius*.7);
      cloud.scale.set(6.4+(i%3),2.1+(i%4)*.28,1);
      cloud.userData.restPosition=cloud.position.clone();
      cloud.userData.restScale=cloud.scale.clone();bank.add(cloud);
    }
  });
  // Camera-facing name planes sit behind the architecture in world space.
  // Depth testing lets real roofs and facades occlude the lettering.
  const nameLines=[['UTown'],['CDE'],['Museum']];
  const namePlanes=nameLines.map(lines=>{
    const label=document.createElement('canvas');
    const context=label.getContext('2d');context.font='400 240px "Campus Display", "Arial Black", sans-serif';
    label.width=Math.ceil(context.measureText(lines[0]).width)+120;label.height=330;
    context.font='400 240px "Campus Display", "Arial Black", sans-serif';context.fillStyle='#9da4a6';context.textAlign='center';context.textBaseline='middle';
    context.fillText(lines[0],label.width/2,165);
    const texture=new T.CanvasTexture(label);texture.colorSpace=T.SRGBColorSpace;
    const material=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,depthTest:true,toneMapped:false});
    const plane=new T.Mesh(new T.PlaneGeometry(1,1),material);plane.userData.aspect=label.width/label.height;plane.visible=false;plane.renderOrder=2;scene.add(plane);return plane;
  });
  let activeName=-1;
  const titleOrigin=new T.Vector3(),cameraForward=new T.Vector3(),cameraUp=new T.Vector3(),titleCorner=new T.Vector3(),titleBounds=new T.Box3();
  let viewPitch=.48,targetPitch=.48,lastFrameTime=0;
  let groupAngle=0,targetGroupAngle=0,cloudClear=0,targetCloudClear=0;
  let selected=-1,frame=0,visible=true,disposed=false,lost=false,width=0,height=0;
  let span=25,targetSpan=25;const focus=new T.Vector3(0,2.7,0),targetFocus=focus.clone();
  const angles=[...baseAngles],targetAngles=[...baseAngles];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function arrange() {
    const mobile=width<650;
    const positions=mobile?[[0,0,-15],[-6.2,0,6],[6.2,0,9]]:[[-11.8,0,3],[0,0,-9],[11.2,0,3]];
    models.forEach((m,i)=>{m.position.set(...positions[i]);cloudBanks[i].position.copy(m.position);});
    setFraming();
  }
  function setFraming() {
    const aspect=width/height;
    targetPitch=selected===0?.2:(selected===1?.52:(selected<0?(width<650?.65:.48):.39));
    if(selected<0) {
      targetFocus.set(0,width<650?1.8:3.7,width<650?-1:-1.5);
      targetSpan=width<650?Math.max(17.8,22.8*aspect):Math.max(26.4,9.4*aspect);
    } else {
      campus.updateMatrixWorld(true);
      models[selected].getWorldPosition(targetFocus);targetFocus.add(new T.Vector3(0,selected===0?1.45:(selected===1?2.8:3.8),selected===0?1.0:0));
      targetSpan=Math.max(selected===0?8.7:(selected===1?11.8:6.4),(selected===0?3.4:(selected===1?8.5:6.3))*aspect);
    }
  }
  function requestDraw(){if(!frame&&!disposed&&!lost)frame=requestAnimationFrame(draw);}
  function draw(time) {
    frame=0;if(disposed||lost||!visible||document.hidden||!width||!height)return;
    const elapsed=Math.min(lastFrameTime?time-lastFrameTime:16,50);lastFrameTime=time;
    const t=reduced.matches?1:1-Math.exp(-elapsed/150);
    groupAngle+=(targetGroupAngle-groupAngle)*t;campus.rotation.y=groupAngle;
    const cloudStep=reduced.matches?1:1-Math.exp(-elapsed/260);
    cloudClear+=(targetCloudClear-cloudClear)*cloudStep;
    fogAmount.value=1-cloudClear;cloudMaterial.opacity=.7*(1-cloudClear)**2;
    cloudBanks.forEach(bank=>bank.children.forEach(cloud=>{
      const rest=cloud.userData.restPosition;
      cloud.position.set(rest.x*(1+cloudClear*1.65),rest.y+cloudClear*.85,rest.z*(1+cloudClear*1.65));
      cloud.scale.copy(cloud.userData.restScale).multiplyScalar(1+cloudClear*.35);
    }));
    if(selected>=0){campus.updateMatrixWorld(true);models[selected].getWorldPosition(targetFocus);targetFocus.add(new T.Vector3(0,selected===0?1.45:(selected===1?2.8:3.8),selected===0?1:0));}
    focus.lerp(targetFocus,t);span+=(targetSpan-span)*t;
    viewPitch+=(targetPitch-viewPitch)*t;
    let moving=Math.abs(targetGroupAngle-groupAngle)>.001||Math.abs(targetCloudClear-cloudClear)>.001||Math.abs(targetPitch-viewPitch)>.001||focus.distanceTo(targetFocus)>.002||Math.abs(span-targetSpan)>.002;
    models.forEach((m,i)=>{angles[i]+=(targetAngles[i]-angles[i])*t;m.rotation.y=angles[i];moving ||= Math.abs(targetAngles[i]-angles[i])>.001;});
    const halfHeight=span/(width/height);
    camera.left=-span;camera.right=span;camera.top=halfHeight;camera.bottom=-halfHeight;
    camera.position.copy(focus).add(new T.Vector3(0,Math.sin(viewPitch)*57,Math.cos(viewPitch)*57));camera.lookAt(focus);camera.updateProjectionMatrix();
    namePlanes.forEach((plane,index)=>{
      plane.visible=index===activeName&&cloudClear>.005;
      if(!plane.visible)return;
      titleBounds.setFromObject(models[index]);titleBounds.getCenter(titleOrigin);
      camera.getWorldDirection(cameraForward);cameraUp.set(0,1,0).applyQuaternion(camera.quaternion);
      let top=-Infinity;
      for(const x of [titleBounds.min.x,titleBounds.max.x])for(const y of [titleBounds.min.y,titleBounds.max.y])for(const z of [titleBounds.min.z,titleBounds.max.z]){
        top=Math.max(top,titleCorner.set(x,y,z).dot(cameraUp));
      }
      // Keep most of each short label above the roofline, with only its lower
      // edge entering the silhouette; world-space depth still supplies occlusion.
      const titleHeight=6.7,titleWidth=Math.min(titleHeight*plane.userData.aspect*1.16,span*1.92);
      const roofOverlap=index===0?1.7:(index===1?.55:1.4);
      const titleLevel=Math.min(top+roofOverlap,focus.dot(cameraUp)+span/(width/height)-titleHeight*.3)-(index===1?.55:0);
      if(index===1)titleOrigin.x+=3;
      plane.position.copy(titleOrigin).addScaledVector(cameraUp,titleLevel-titleOrigin.dot(cameraUp)).addScaledVector(cameraForward,40);
      plane.quaternion.copy(camera.quaternion);
      const nameScale=index===1?1.1:1;
      plane.scale.set(titleWidth*nameScale,titleHeight*nameScale,1);
      plane.material.opacity=Math.max(0,(cloudClear-.3)/.7)*.8;
    });
    renderer.render(scene,camera);if(moving)requestDraw();
  }
  function resize() {
    width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
    renderer.setSize(width,height,false);arrange();requestDraw();
  }
  function rotate(delta){
    if(selected<0)targetGroupAngle+=delta;
    else targetAngles[selected]+=delta;
    requestDraw();
  }
  function select(index){
    if(index===selected)return;
    selected=index;targetCloudClear=index<0?0:1;
    if(index>=0){activeName=index;canvas.setAttribute('aria-label',`Interactive NUS campus: ${nameLines[index].join(' ')}. Drag to rotate; Escape returns to overview.`);}
    else canvas.setAttribute('aria-label','Interactive NUS campus overview. Click a building or press 1, 2 or 3 to zoom in. Drag to rotate the entire campus.');
    // Freeze the overview orientation while approaching the chosen building.
    targetGroupAngle=groupAngle;
    // Only the selected landmark remains visible while the camera approaches.
    models.forEach((model,i)=>{model.visible=index<0||i===index;});
    targetAngles.forEach((a,i)=>targetAngles[i]=baseAngles[i]-(i===index?groupAngle:0));
    setFraming();onSelection?.(index);requestDraw();
  }
  const raycaster=new T.Raycaster(),mouse=new T.Vector2(),owners=new WeakMap(),pickMeshes=[];
  models.forEach((model,index)=>model.traverse(object=>{
    owners.set(object,index);
    if(object.isMesh&&object.geometry.type!=='IcosahedronGeometry'&&!object.material.transparent)pickMeshes.push(object);
  }));
  function pick(clientX,clientY) {
    const rect=canvas.getBoundingClientRect();
    mouse.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(mouse,camera);
    // Ignore cloud sprites, paving and lawns; only the above-ground model is clickable.
    const hit=raycaster.intersectObjects(pickMeshes.filter(mesh=>models[owners.get(mesh)].visible),false).find(hit=>hit.point.y>.5);
    return hit?owners.get(hit.object):-1;
  }
  function hover(e) {
    if(pointer)return;
    const index=pick(e.clientX,e.clientY);
    canvas.style.cursor=index<0?(selected<0?'default':'zoom-out'):index===selected?'grab':'zoom-in';
  }
  let pointer=null;
  function down(e){
    if(!e.isPrimary||e.button!==0)return;
    pointer={id:e.pointerId,x:e.clientX,startX:e.clientX,startY:e.clientY,dragged:false};
    canvas.setPointerCapture(e.pointerId);
  }
  function move(e){
    if(pointer?.id!==e.pointerId){if(e.pointerType!=='touch')hover(e);return;}
    if(Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>6)pointer.dragged=true;
    if(pointer.dragged){canvas.style.cursor='grabbing';rotate((e.clientX-pointer.x)*.007);}
    pointer.x=e.clientX;
  }
  function cancel(e){
    if(pointer?.id!==e.pointerId)return;
    pointer=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    canvas.style.cursor='default';
  }
  function up(e){
    if(pointer?.id!==e.pointerId)return;
    const clicked=!pointer.dragged;cancel(e);
    if(clicked){const index=pick(e.clientX,e.clientY);select(index===selected?-1:index);}
    if(e.pointerType!=='touch')hover(e);
  }
  function key(e){
    if(!['ArrowLeft','ArrowRight','Home','Escape','1','2','3','Enter',' '].includes(e.key))return;
    e.preventDefault();
    if(e.key==='Home'||e.key==='Escape')select(-1);
    else if(['1','2','3'].includes(e.key))select(Number(e.key)-1);
    else if(e.key==='Enter'||e.key===' ')select(selected<0?0:-1);
    else rotate(e.key==='ArrowLeft'?-.25:.25);
  }
  function contextLost(e){e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;onFailure();}
  const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['keydown',key],['webglcontextlost',contextLost]];
  listeners.forEach(([name,fn])=>canvas.addEventListener(name,fn));
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);
  const visibilityObserver=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)requestDraw();});visibilityObserver.observe(host);
  document.addEventListener('visibilitychange',requestDraw);resize();
  // An immediate frame avoids animating in from an uninitialized aspect ratio.
  span=targetSpan;focus.copy(targetFocus);
  return {select,rotate,dispose(){
    disposed=true;cancelAnimationFrame(frame);sizeObserver.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',requestDraw);
    listeners.forEach(([name,fn])=>canvas.removeEventListener(name,fn));
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);if(o.isInstancedMesh)o.dispose();});
    materials.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();});
    textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());sun.shadow.dispose();renderer.dispose();canvas.remove();
  }};
}
