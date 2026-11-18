import * as T from './vendor/three.module.min.js';

// Architectural studies from the user's approved EA, natural-history museum,
// and UTown photographs (16 Nov 2026). Dimensions are proportional, not surveyed.
export function buildCampusModels() {
  const boxGeometry = new T.BoxGeometry(1, 1, 1);
  const cylinderGeometry = new T.CylinderGeometry(1, 1, 1, 12);
  const leafGeometry = new T.IcosahedronGeometry(1, 0);
  const materials = new Map();
  const mat = (name, color, options = {}) => {
    if (!materials.has(name)) materials.set(name, new T.MeshStandardMaterial({ color, roughness: .78, ...options }));
    return materials.get(name);
  };
  const white = mat('white', '#deddd4'), pale = mat('pale', '#c9cec9');
  const concrete = mat('concrete', '#9eaaa8'), dark = mat('dark', '#253e44');
  const glass = mat('glass', '#698f91', { metalness: .22, roughness: .3 });
  const glassLight = mat('glassLight', '#a3c2c5', { metalness: .2, roughness: .32 });
  const glassDark = mat('glassDark', '#365c64', { metalness: .18, roughness: .34 });
  const green = mat('grass', '#6d8a48'), soil = mat('soil', '#6e674e');
  green.userData.skipHeightFog=true;
  const bark = mat('bark', '#635c49');
  const leaves = ['#2f5337','#41663b','#588047','#7b9253'].map((c,i)=>mat('leaf'+i,c));
  let seed = 731;
  const rand = () => {seed = (Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function mesh(g, geo, material, x=0,y=0,z=0,sx=1,sy=1,sz=1) {
    const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);
    m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
  }
  const box=(g,m,x,y,z,w,h,d)=>mesh(g,boxGeometry,m,x,y,z,w,h,d);
  const cylinder=(g,m,x,y,z,r,h)=>mesh(g,cylinderGeometry,m,x,y,z,r,h,r);
  function beam(g,m,a,b,r=.035) {
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const o=mesh(g,cylinderGeometry,m,...start.add(end).multiplyScalar(.5).toArray(),r,delta.length(),r);
    o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;
  }
  function rounded(w,d,r) {
    const s=new T.Shape(),x=-w/2,z=-d/2;
    s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);
    s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);
    s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;
  }
  function horizontal(g,m,s,y,h,x=0,z=0) {
    const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:20});geo.rotateX(-Math.PI/2);
    return mesh(g,geo,m,x,y,z);
  }
  const slab=(g,m,x,y,z,w,h,d,r=.4)=>horizontal(g,m,rounded(w,d,r),y,h,x,z);
  function face(g,m,points,depth,z=0) {
    const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    return mesh(g,new T.ExtrudeGeometry(s,{depth,bevelEnabled:false}),m,0,0,z);
  }
  function sign(g,text,x,y,z,w,color='#294149') {
    const c=document.createElement('canvas');c.width=1024;c.height=128;
    const ctx=c.getContext('2d');ctx.font='500 62px Arial';ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,64);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const m=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});
    const o=mesh(g,new T.PlaneGeometry(w,w/8),m,x,y,z);o.castShadow=false;return o;
  }
  function foliage(g,x,y,z,r=1,count=65) {
    for(let i=0;i<count;i++) {
      const a=rand()*Math.PI*2, v=rand()*2-1,rad=r*Math.cbrt(rand()),s=(.07+rand()*.12)*Math.min(r,1.2);
      const o=mesh(g,leafGeometry,leaves[i%4],x+Math.cos(a)*Math.sqrt(1-v*v)*rad,y+v*rad*.55,z+Math.sin(a)*Math.sqrt(1-v*v)*rad,s*1.8,s*.65,s);
      o.rotation.set(rand()*3,rand()*3,rand()*3);
    }
  }
  function tree(g,x,z,h=2.6,r=1.4,y=0) {
    beam(g,bark,[x,y,z],[x+.08,y+h*.8,z],.07);
    for(let i=0;i<5;i++) {
      const a=i*1.256,end=[x+Math.cos(a)*r*.5,y+h*(.7+rand()*.2),z+Math.sin(a)*r*.5];
      beam(g,bark,[x,y+h*.45,z],end,.025);foliage(g,...end,r*.72,180);
    }
  }
  function terraceRail(g,x,y,z,w) {
    box(g,pale,x,y+.28,z,w,.025,.025);
    for(let q=x-w/2;q<x+w/2;q+=.19)box(g,pale,q,y+.14,z,.018,.28,.018);
  }

  // World X/Z footprints. Shape Y is negated before extrusion so the drawing's
  // front/back orientation survives the rotation into Three.js's horizontal plane.
  function footprint(points, smooth=false) {
    const shape=new T.Shape();
    const path=smooth?new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z)),true,'centripetal').getPoints(points.length*8).map(p=>[p.x,p.z]):points;
    path.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();return shape;
  }
  function floor(g,material,outline,y,h,holes=[],smooth=false) {
    const shape=footprint(outline,smooth);
    holes.forEach(p=>{const s=footprint(p,true);shape.holes.push(s);});
    return horizontal(g,material,shape,y,h);
  }
  const steel=mat('steel','#b2bdbb',{metalness:.4,roughness:.4});
  const joint=mat('joint','#b1b3ae');
  const panes=['#486b70','#789497','#547c80','#90a9aa','#3d626a'].map((c,i)=>mat('pane'+i,c,{metalness:.12,roughness:.32}));
  function outlinePoints(outline,smooth=false) {
    return smooth?new T.CatmullRomCurve3(outline.map(([x,z])=>new T.Vector3(x,0,z)),true,'centripetal').getPoints(outline.length*8).map(p=>[p.x,p.z]):[...outline,outline[0]];
  }
  function edgeBeam(g,m,a,b,y,r) {return beam(g,m,[a[0],y,a[1]],[b[0],y,b[1]],r);}
  // Faceted curtain wall follows each actual room footprint, including its returns.
  function curtain(g,outline,y,h,smooth=true,spacing=.34,transparent=false,palette=panes) {
    const pts=outlinePoints(outline,smooth);let phase=0;
    for(let i=0;i<pts.length-1;i++) {
      const a=pts[i],b=pts[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(len<.005)continue;
      const angle=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
      const pane=box(g,transparent?mat('clearGlass','#8aacae',{transparent:true,opacity:.27,depthWrite:false,metalness:.08,roughness:.25}):palette[Math.floor(phase*2)%palette.length],(a[0]+b[0])/2,y+h/2,(a[1]+b[1])/2,len+.006,h,.025);pane.rotation.y=angle;
      const n=Math.max(1,Math.ceil(len/spacing));
      for(let j=0;j<n;j++) {
        if(smooth&&phase%3!==0){phase++;continue;}phase++;
        const f=j/n;box(g,steel,a[0]+(b[0]-a[0])*f,y+h/2,a[1]+(b[1]-a[1])*f,.027,h,.027);
      }
      edgeBeam(g,steel,a,b,y,.018);edgeBeam(g,steel,a,b,y+h,.018);
    }
  }
  function railing(g,outline,y,smooth=true) {
    const pts=outlinePoints(outline,smooth);let distance=0;
    for(let i=0;i<pts.length-1;i++) {
      const a=pts[i],b=pts[i+1];edgeBeam(g,steel,a,b,y+.29,.015);
      distance+=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(distance>.19){cylinder(g,steel,a[0],y+.145,a[1],.01,.29);distance=0;}
    }
  }
  function centroidScaled(points,k) {
    const cx=points.reduce((s,p)=>s+p[0],0)/points.length,cz=points.reduce((s,p)=>s+p[1],0)/points.length;
    return points.map(([x,z])=>[cx+(x-cx)*k,cz+(z-cz)*k]);
  }
  function ribbon(curve) {
    const n=160,k=10,frames=curve.computeFrenetFrames(n,false),verts=[],indices=[];
    for(let i=0;i<=n;i++)for(let j=0;j<=k;j++) {
      const a=j/k*Math.PI*2,p=curve.getPointAt(i/n);
      p.addScaledVector(frames.normals[i],Math.cos(a)*.17).addScaledVector(frames.binormals[i],Math.sin(a)*.075);verts.push(p.x,p.y,p.z);
      if(i<n&&j<k){const q=i*(k+1)+j;indices.push(q,q+k+1,q+1,q+1,q+k+1,q+k+2);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  }

  // Stephen Riady Centre, in metres. Two sources fix the geometry:
  //  - a photograph across Town Green. A level camera 18 m above the plaza was
  //    fitted to it, then each facade, pool and paving outline was back-projected
  //    onto its storey plane. Everything that photograph shows comes from it.
  //  - satellite imagery, mapped into the same frame through landmarks shared with
  //    the photograph (pool, roof disc, hall and wing corners). It supplies the
  //    roofscape and the halls the photograph cannot see.
  // Local frame: +X is right and +Z points at the photograph's camera, (0, 18, 90).
  const utown=new T.Group();utown.name='University Town';
  const src=new T.Group();src.name='SRC frame';utown.add(src);
  const paving=mat('paving','#c4bca7'),court=mat('srcCourt','#a8977b');
  const srcWhite=mat('srcWhite','#e5e4dc'),srcTrim=mat('srcTrim','#f3f1e9');
  const srcShade=mat('srcShade','#777e78'),srcFrame=mat('srcFrame','#89918c',{metalness:.35,roughness:.4});
  const srcDark=mat('srcDark','#222e30');
  const srcPanes=['#354340','#303f40','#3a4744'].map((c,i)=>mat('srcPane'+i,c,{metalness:.15,roughness:.27}));
  const srcTiles=['#27467f','#2f5290','#223c70'].map((c,i)=>mat('srcTile'+i,c,{roughness:.45}));
  const balconyGlass=mat('srcBalconyGlass','#b8c9c4',{transparent:true,opacity:.18,depthWrite:false,roughness:.2});
  const srcDeck=mat('srcDeck','#cfc5ae'),srcBronze=mat('srcBronze','#706d58',{metalness:.25,roughness:.65});
  const srcRoof=mat('srcRoof','#8d8468',{metalness:.3,roughness:.6}),srcTimber=mat('srcTimber','#8a6a48');
  const silver=mat('srcCanopy','#989b93',{metalness:.3,roughness:.5}),soffit=mat('srcSoffit','#4b5150');
  const water=mat('srcWater','#1f9fd6',{metalness:.1,roughness:.18}),shallows=mat('srcShallows','#36b3e2',{metalness:.1,roughness:.2});
  const bush=mat('srcBush','#3f5f34');
  // Photovoltaic arrays share one tile: a dark panel with a pale frame.
  const cell=document.createElement('canvas');cell.width=cell.height=64;
  const ink=cell.getContext('2d');ink.fillStyle='#1a2740';ink.fillRect(0,0,64,64);
  ink.strokeStyle='#4a5f86';ink.lineWidth=4;ink.strokeRect(0,0,64,64);
  ink.strokeStyle='#263759';ink.lineWidth=1.5;ink.beginPath();ink.moveTo(32,0);ink.lineTo(32,64);ink.stroke();
  const solarMap=new T.CanvasTexture(cell);solarMap.colorSpace=T.SRGBColorSpace;solarMap.wrapS=solarMap.wrapT=T.RepeatWrapping;solarMap.anisotropy=4;
  const solar=mat('srcSolar','#ffffff',{map:solarMap,metalness:.35,roughness:.4,side:T.DoubleSide});
  // Round only corners, preserving long straight sides instead of using a
  // closed Catmull-Rom curve that balloons the entire building into a capsule.
  function softCorners(vertices,r=1.8) {
    const points=[];
    vertices.forEach((v,i)=>{
      const prev=vertices[(i+vertices.length-1)%vertices.length],next=vertices[(i+1)%vertices.length];
      const la=Math.hypot(prev[0]-v[0],prev[1]-v[1]),lb=Math.hypot(next[0]-v[0],next[1]-v[1]);
      const d=Math.min(r,la*.28,lb*.28);
      const a=[v[0]+(prev[0]-v[0])*d/la,v[1]+(prev[1]-v[1])*d/la];
      const b=[v[0]+(next[0]-v[0])*d/lb,v[1]+(next[1]-v[1])*d/lb];
      for(let k=0;k<=8;k++){const t=k/8;points.push([(1-t)**2*a[0]+2*t*(1-t)*v[0]+t*t*b[0],(1-t)**2*a[1]+2*t*(1-t)*v[1]+t*t*b[1]]);}
    });return points;
  }
  // A smooth curve through traced points, for edges that are curved in reality.
  function spline(points,closed,count) {
    const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z)),closed,'centripetal');
    const out=curve.getPoints(count).map(p=>[p.x,p.z]);return closed?out.slice(0,-1):out;
  }
  // Mitred offset; positive distances shrink a polygon of either winding.
  function inset(points,d) {
    let area=0;points.forEach((p,i)=>{const q=points[(i+1)%points.length];area+=p[0]*q[1]-q[0]*p[1];});
    const s=area>0?1:-1,n=points.length;
    return points.map((p,i)=>{
      const a=points[(i+n-1)%n],b=points[(i+1)%n];
      const e1=[p[0]-a[0],p[1]-a[1]],e2=[b[0]-p[0],b[1]-p[1]],l1=Math.hypot(...e1)||1,l2=Math.hypot(...e2)||1;
      const n1=[-e1[1]/l1*s,e1[0]/l1*s],n2=[-e2[1]/l2*s,e2[0]/l2*s];
      const k=d/Math.max(.35,1+n1[0]*n2[0]+n1[1]*n2[1]);
      return [p[0]+(n1[0]+n2[0])*k,p[1]+(n1[1]+n2[1])*k];
    });
  }
  // Members too thin to resolve from the overview are flagged, so the scene can
  // leave them out until the camera comes close.
  const fine=part=>{part.userData.fine=true;return part;};
  const run=(points,open)=>open?points:[...points,points[0]];
  const along=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const yaw=(a,b)=>Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
  const span=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
  function trim(points,y,material=srcTrim,r=.08,open=false) {
    const p=run(points,open);for(let i=0;i<p.length-1;i++)fine(edgeBeam(src,material,p[i],p[i+1],y,r));
  }
  // Panels with regular posts along a plan line: curtain wall, tiling, cladding.
  function glazed(points,y,h,spacing=1.6,open=false,palette=srcPanes) {
    const p=run(points,open);let distance=0,nextPost=0;
    for(let i=0;i<p.length-1;i++) {
      const a=p[i],b=p[i+1],len=span(a,b);if(len<.01)continue;
      const panel=box(src,palette[Math.floor(distance/7)%palette.length],(a[0]+b[0])/2,y+h/2,(a[1]+b[1])/2,len+.02,h,.12);
      panel.rotation.y=yaw(a,b);
      while(nextPost<=distance+len){const q=along(a,b,(nextPost-distance)/len);fine(box(src,srcFrame,q[0],y+h/2,q[1],.1,h,.16));nextPost+=spacing;}
      distance+=len;
    }
    trim(points,y,srcFrame,.05,open);trim(points,y+h,srcFrame,.05,open);
  }
  function guard(points,y,open=false) {
    const p=run(points,open);let distance=0,nextPost=0;
    for(let i=0;i<p.length-1;i++) {
      const a=p[i],b=p[i+1],len=span(a,b);if(len<.01)continue;
      const panel=box(src,balconyGlass,(a[0]+b[0])/2,y+.52,(a[1]+b[1])/2,len,1,.04);panel.rotation.y=yaw(a,b);panel.castShadow=false;
      fine(edgeBeam(src,steel,a,b,y+1.08,.045));
      while(nextPost<=distance+len){const q=along(a,b,(nextPost-distance)/len);fine(cylinder(src,steel,q[0],y+.54,q[1],.035,1.08));nextPost+=2;}
      distance+=len;
    }
  }
  function band(points,y,h,material=srcWhite) {floor(src,material,points,y,h);trim(points,y+h,srcTrim,.1);trim(points,y,srcShade,.05);}
  // A planted roof inside a white kerb, as every green roof here is finished.
  function lawnRoof(points,y,kerb=.9) {floor(src,srcTrim,points,y,.12);floor(src,green,inset(points,kerb),y+.12,.06);}
  const column=(p,y0,y1,r=.4)=>cylinder(src,srcWhite,p[0],(y0+y1)/2,p[1],r,y1-y0);
  // One textured quad per photovoltaic array, a texture cell per panel.
  function panels(corners,y,across,down) {
    const [a,b,c,d]=corners.map(p=>[p[0],y,p[1]]),geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,across,0,across,down,0,0,across,down,0,down],2));
    geo.computeVertexNormals();const array=mesh(src,geo,solar);array.castShadow=false;return array;
  }
  // Sports hall, corners listed from the Town Green side: bronze cladding under a
  // shallow metal roof that carries the arrays, given as fractions of the roof.
  function shed(corners,top,arrays) {
    const [a,b,,d]=corners,at=(u,v)=>[a[0]+(b[0]-a[0])*u+(d[0]-a[0])*v,a[1]+(b[1]-a[1])*u+(d[1]-a[1])*v];
    floor(src,srcBronze,corners,0,top);floor(src,srcShade,inset(corners,-.15),0,2.4);floor(src,srcRoof,inset(corners,-.7),top,.3);
    for(const [u0,u1,v0,v1] of arrays)panels([at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1)],top+.36,Math.round(span(a,b)*(u1-u0)/2.1),Math.round(span(a,d)*(v1-v0)/1.15));
    corners.forEach((p,i)=>{
      const q=corners[(i+1)%4],length=span(p,q),turn=yaw(p,q);
      for(let s=.8;s<length;s+=1.6){const r=along(p,q,s/length),rib=fine(box(src,srcShade,r[0],(top+2.4)/2,r[1],.3,top-2.4,.1));rib.rotation.y=turn;}
    });
  }
  // Planting helpers use the shared foliage scale, four metres to the unit.
  const veg=new T.Group();veg.scale.setScalar(4);src.add(veg);
  function sapling(x,z,h,r,y=0,count=110) {
    const X=x/4,Z=z/4,Y=y/4,top=h/4,R=r/4;
    beam(veg,bark,[X,Y,Z],[X+.02,Y+top*.6,Z],.035);
    for(let i=0;i<4;i++){const a=i*1.7+x;foliage(veg,X+Math.cos(a)*R*.4,Y+top*(.46+i*.13),Z+Math.sin(a)*R*.4,R*.85,count);}
  }
  const shrub=(x,z,r=1.2,y=0,count=26)=>foliage(veg,x/4,(y+r*.45)/4,z/4,r/4,count);
  function planter(a,b,w=1.6,trees=0) {
    const len=span(a,b),tub=box(src,srcWhite,(a[0]+b[0])/2,.3,(a[1]+b[1])/2,len,.6,w);tub.rotation.y=yaw(a,b);
    for(let d=.8;d<len;d+=1.5){const q=along(a,b,d/len);shrub(q[0],q[1],.9,.6);}
    for(let i=0;i<trees;i++){const q=along(a,b,(i+.5)/trees);sapling(q[0],q[1],6.5,1.5,.6,70);}
  }

  // Glazed hall. Its 27 m front and the return into the forum meet at a tight
  // rounded corner; the ground floor is recessed behind round columns. The block
  // runs back to the sports halls under one planted roof.
  const hall=softCorners([[-43.4,2.5],[-17,9.7],[-10,-7.7],[-3,-16],[1.1,-29.5],[-22.6,-37],[-27.5,-38.6],[-37.9,-33],[-40.5,-33.6],[-42.2,1]],1.6);
  floor(src,srcDark,inset(hall,2.9),0,3.2);
  glazed(inset(hall,2.7),.2,3,3);
  for(const p of [[-41,2.4],[-32.4,4.3],[-24.6,6.5],[-17.3,8.6],[-14.1,2.4],[-11.6,-4]])column(p,0,3.2);
  band(hall,3.2,.8);
  glazed(hall,4,8.9,1.6);
  for(const y of [6.2,8.4,10.6])trim(hall,y,srcFrame,.06);
  box(src,srcTimber,-10.15,8.45,-7.45,.55,8.9,.55);
  band(inset(hall,-1.1),12.9,2.8);
  lawnRoof(inset(hall,-.5),15.7);
  mesh(src,new T.SphereGeometry(1,24,12),green,-23.7,15.82,-10,6.5,1.8,5);
  const slit=box(src,srcTrim,-27.8,15.95,-18.6,11.7,.14,.7);slit.rotation.y=yaw([-22,-17.8],[-33.6,-19.5]);
  // Solid wall with scattered timber-framed windows, between hall and forum.
  const wallA=[-10,-7.7],wallB=[-3.8,-12.4];
  floor(src,srcWhite,[wallA,wallB,[-3.2,-16],[-9.4,-12.2]],4,9.75);
  for(const [t,y,w,h] of [[.14,10.9,1.5,1.2],[.36,11.2,1.1,1.9],[.56,9.7,.9,1.1],[.78,10.6,1.6,.9],[.18,6.2,1.2,1.5],[.4,6.6,1,1.2],[.6,6.1,.9,2.2],[.82,6.5,1.3,1.4]]) {
    const q=along(wallA,wallB,t);
    for(const [m,grow,out] of [[srcTimber,.24,.1],[srcDark,0,.16]]){const pane=box(src,m,q[0]+.6*out,y,q[1]+.8*out,w+grow,h+grow,.12);pane.rotation.y=yaw(wallA,wallB);}
  }

  // Forum: an open court under the disc. Its concave back wall carries two
  // open galleries between three white ribbon slabs.
  const forumBack=[[-10,-7.7],[-3.8,-12.4],[2.5,-13.3],[9.2,-11.6],[12.5,-9.5],[19.6,-13.1],[9.1,-22.6],[1.1,-30.6],[-3,-16]];
  floor(src,srcDark,inset(forumBack,1.1),0,13.6);
  const gallery=[[-10,-7.7],[-3.8,-12.4],[2.5,-13.3],[9.2,-11.6],[11.6,-8.2],[13,-9.4],[10.4,-14.4],[2.5,-16.2],[-4.6,-15.2],[-11.4,-10]];
  band(gallery,2.9,1.1);band(gallery,7.4,1.4);band(gallery,11.5,2.25);
  for(const y of [4,8.8])guard([[-3.8,-12.4],[2.5,-13.3],[9.2,-11.6],[11.6,-8.2]],y,true);
  for(const p of [[-.8,-13.2],[5.8,-12.8]])column(p,0,11.5,.32);
  lawnRoof(forumBack,13.6);
  // Roof disc: 38 m across, edge-on from the camera's height, on slender columns.
  // A bevelled metal rim surrounds photovoltaics laid on the diagonal.
  const disc=new T.Group();disc.position.set(1.7,0,-2.5);src.add(disc);
  mesh(disc,new T.CylinderGeometry(19,18.5,.9,72),silver,0,18.05,0);
  mesh(disc,new T.CylinderGeometry(16.4,19,1.4,72,1,true),silver,0,19.2,0);
  mesh(disc,new T.CylinderGeometry(18.4,18.4,.1,72),soffit,0,17.58,0);
  const array=new T.BufferGeometry(),arrayAt=[],arrayUv=[],arrayFaces=[];
  for(let ring=0;ring<=2;ring++)for(let spoke=0;spoke<=64;spoke++) {
    const r=16.4*ring/2,a=spoke/64*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r;
    arrayAt.push(x,0,z);arrayUv.push((x+z)/2.9,(x-z)/1.6);
    if(ring<2&&spoke<64){const q=ring*65+spoke;arrayFaces.push(q,q+1,q+65,q+1,q+66,q+65);}
  }
  array.setAttribute('position',new T.Float32BufferAttribute(arrayAt,3));array.setAttribute('uv',new T.Float32BufferAttribute(arrayUv,2));
  array.setIndex(arrayFaces);array.computeVertexNormals();mesh(disc,array,solar,0,19.82,0);
  for(const [deg,base] of [[9,15.8],[55,0],[150,15.7],[200,13.7],[250,13.7],[300,13.7],[345,15.8]]) {
    const a=deg*Math.PI/180;column([1.7+Math.cos(a)*17.2,-2.5+Math.sin(a)*17.2],base,17.6,base?.4:.55);
  }

  // A white stair court separates the hall from the south wing; its flat front
  // carries a grid of small windows.
  const slot=[[-43,1.6],[-47.9,-.8],[-47,-34.1],[-40.9,-34.5]];
  floor(src,srcWhite,slot,0,11.4);
  for(const t of [.2,.5,.8])for(const y of [6.2,8.6]){const q=along(slot[0],slot[1],t),pane=box(src,srcDark,q[0]+.06,y,q[1]+.1,.75,1.5,.1);pane.rotation.y=yaw(slot[0],slot[1]);}
  for(let i=0;i<5;i++){const q=along([-45,-10],[-44.3,-27],i/4),flight=box(src,srcTrim,q[0],11.5,q[1],4.6,.16,1.1);flight.rotation.y=.03;}
  // South wing: an upper storey behind a deep white portal. Its ribbon slabs
  // sweep round a 10 m radius end that the spiral ramp wraps.
  const wingA=[-48.1,0],wingB=[-78.3,-13.9],hub=[-84,-23.9],sweep=9.7;
  const turnAt=deg=>[hub[0]+Math.cos(deg*Math.PI/180)*sweep,hub[1]+Math.sin(deg*Math.PI/180)*sweep];
  const wing=[wingA,wingB,...[72,86,100,114,128,142,156,170,184].map(turnAt),[-92.1,-40.4],[-87.7,-44.5],[-46.5,-35.4],[-46.9,-12]];
  floor(src,srcDark,inset(wing,2.4),0,3.2);
  glazed([along(wingA,wingB,.04),along(wingA,wingB,.98)].map(p=>[p[0]+.9,p[1]-1.9]),.2,3,2.6,true);
  for(const t of [.08,.24,.4,.56,.72,.88])column(along(wingA,wingB,t),0,3,.34);
  band(wing,3,1);
  floor(src,srcDark,inset(wing,1.5),4,6.3);
  const portal=[along(wingA,wingB,.02),along(wingA,wingB,.98)].map(p=>[p[0]+.6,p[1]-1.25]);
  glazed(portal,4,6.3,1.5,true);
  for(const t of [.2,.4,.6,.8]){const q=along(wingA,wingB,t);column([q[0]+.2,q[1]-.45],4,10.3,.24);}
  band(inset(wing,-.5),10.3,.9);
  lawnRoof(wing,11.2);
  guard([along(wingA,wingB,.02),along(wingA,wingB,.98)],11.32,true);
  const hedge=box(src,leaves[1],-62,12.5,-19.5,22,2.3,2.2);hedge.rotation.y=yaw(wingA,wingB);
  for(let i=0;i<9;i++){const q=along(wingA,wingB,.14+i*.09);shrub(q[0]+3.6,q[1]-8.2,1.7,12,22);}
  // The rounded end rises a parapet above the roof; the ramp shows as two
  // descending slots with pale lips.
  const cap=[66,78,90,102,114,126,138,150,162,174,186].map(turnAt);
  floor(src,srcWhite,[...cap,...[...cap].reverse().map(p=>along(p,hub,.14))],0,12.8);
  for(const top of [9.8,6.2])for(let i=0;i<34;i++) {
    const deg=74+i*3.3,a=deg*Math.PI/180,y=top-i/33*3.2,turn=Math.PI/2-a;
    const opening=box(src,srcDark,hub[0]+Math.cos(a)*(sweep+.04),y,hub[1]+Math.sin(a)*(sweep+.04),.62,1.5,.12);opening.rotation.y=turn;
    const lip=fine(box(src,srcTrim,hub[0]+Math.cos(a)*(sweep+.16),y-.95,hub[1]+Math.sin(a)*(sweep+.16),.62,.42,.3));lip.rotation.y=turn;
  }
  // Service spine behind both wings. The five sports halls behind UTown are left
  // out so the skyline stays clear behind the title.
  floor(src,srcWhite,[[-37.5,-39.4],[-38.8,-33.4],[-88.1,-44.3],[-91.7,-48.5],[-88.3,-51.6]],0,14.6);
  shed([[35.3,6.6],[44.7,31.8],[53,28.7],[44.1,4.6]],15,[[.08,.92,.14,.4],[.08,.92,.6,.86]]);
  floor(src,srcDeck,[[86.4,38.2],[51.8,51],[44.9,32.3],[53.2,29.2],[62.5,41],[84.4,32.9]],0,9.4);
  for(const [x,z,w,d] of [[56,43.5,6,4],[66,43,4,3],[73,40,5,3],[80,37.5,4,3]])box(src,srcTrim,x,10,z,w,1.2,d).rotation.y=.35;
  floor(src,srcDeck,softCorners([[7.2,-32.9],[.8,-34.1],[3.4,-61.9],[11.7,-63.7],[21.1,-59.9],[26.5,-53.4],[24.5,-45.4],[17.8,-39.2]],3),0,9);
  const walkway=[[44,7.1],[30.1,-6.1],[18,-17.4],[8.7,-23.7],[-1,-25.5]];
  walkway.slice(0,-1).forEach((a,i)=>{const b=walkway[i+1],cover=box(src,srcTrim,(a[0]+b[0])/2,14.5,(a[1]+b[1])/2,span(a,b)+.4,.22,2.6);cover.rotation.y=yaw(a,b);});

  // Pool wing, running toward the camera. From the ground: a white base, the
  // gym's ribbon window, a deep fascia, then the tiled infinity edge.
  const poolEast=spline([[8,21],[12.8,27.5],[15.8,36],[18.8,42.5],[20.3,48],[21.3,53.5],[22.4,57.5],[24,62.5]],false,28);
  const poolEnd=spline([[11.4,-13],[10.6,-4],[8.5,8],[7.2,16],[8,21]],false,14).slice(0,-1);
  const poolFace=[...poolEnd,...poolEast];
  const poolBody=[...poolFace,[26.5,65],[30,65],[51,51.4],[34.5,6.9],[27.9,-4],[19.6,-13.1]];
  floor(src,srcWhite,inset(poolBody,.45),0,5.3);
  glazed(poolFace.slice(5,24).map(p=>[p[0]+.4,p[1]]),.2,3,2.4,true);
  const poolNorth=[[24,62.5],[26.5,65],[30,65],[51,51.4]];
  glazed([...poolFace,...poolNorth.slice(1)],5.3,1.8,1.5,true);
  floor(src,srcWhite,poolBody,7.1,1.9);trim(poolFace,7.1,srcShade,.06,true);
  floor(src,srcDeck,poolBody,9,1.3);
  glazed(poolFace.slice(4),9,1.3,.5,true,srcTiles);
  // The water runs to the tiled edge on the green side and is coped elsewhere.
  const pool=spline([[11.2,19.5],[14.3,25.8],[16.8,33.2],[19.4,38.7],[20.5,45.9],[22.3,50.2],[23.7,53.7],[25.7,53.4],[27.2,50],[27.7,45.5],[27.2,39.6],[25.6,34.6],[24.7,30.3],[22.5,24],[19.1,20.3],[15.6,17.3],[12.5,16.9]],true,96);
  const overflow=poolEast.slice(1,26);
  floor(src,srcTiles[2],[...overflow,...[...overflow].reverse().map(p=>[p[0]+2.4,p[1]-.5])],10.26,.07);
  floor(src,srcTrim,inset(pool,-.4),10.26,.06);
  floor(src,shallows,pool,10.3,.05);
  floor(src,water,inset(pool,1.1),10.3,.08);
  guard([...poolEast.slice(24),...poolNorth.slice(1,3),[38,58.2]],10.3,true);
  sign(src,'STEPHEN RIADY CENTRE',14.16,8.05,31.75,11,'#1c282c').rotation.y=-1.231;
  // Shaded lounge behind the water: columns, a painted wall and one long roof,
  // white over the lounge and planted beyond it.
  const lounge=[[43.6,52.7],[32.6,23.5],[28.1,16.6],[22,12.2],[17.5,5],[15,-5],[13.4,-9.4],[19,-12.4],[27.3,-3.6],[33.8,7.1],[50,50.3]];
  floor(src,srcShade,lounge,10.3,4.1);
  const muralA=[32.4,23],muralB=[36.4,33.6];
  ['#d9772f','#2d6fa3','#e2b33a','#c2482f','#3f8f8a'].forEach((c,i)=>{
    for(let j=0;j<2;j++){const q=along(muralA,muralB,(i*2+j*5)%10/10+.05),tile=box(src,mat('srcMural'+i,c),q[0]-.16,11.8+(i+j)%2*.35,q[1]+.06,1.05,1.7,.1);tile.rotation.y=yaw(muralA,muralB);}
  });
  for(const [x,z] of [[18.5,13.5],[20,14.6],[29.4,33],[30.2,36],[31,39],[31.8,42]])box(src,srcTrim,x,10.55,z,1.9,.3,.7);
  const poolRoof=softCorners([[38.7,55.9],[33.5,42],[29,30],[27.4,25.4],[24.5,20.4],[19.7,16.7],[17,8],[14.5,-2],[12.5,-9.5],[19.6,-13.1],[27.9,-4],[34.5,6.9],[51,51.4]],1.4);
  band(poolRoof,14.4,1.4);
  floor(src,green,inset(lounge,.6),15.8,.07);
  for(const p of [[21.6,17.6],[25.4,22.2],[28.7,30],[31.6,37.6],[34.6,45.5],[37.6,53.6]])column(p,10.3,14.4,.36);
  const strip=box(src,bush,39.6,16.5,33.5,1.3,1.3,30);strip.rotation.y=yaw([44.5,47],[34.5,20])+Math.PI/2;
  box(src,srcWhite,23,16.9,13,4,2.2,3);
  box(src,srcWhite,25.4,10.8,58,4.2,1,2.6);sapling(25.4,58,4.2,1.7,11.3,80);
  // First-floor terrace sweeping out around the pool's far end, over a lower canopy.
  const terrace=spline([[16.5,36.5],[14.4,34],[11.4,31.2],[8,28.4],[5.2,25.6],[3.5,22],[3.1,18],[4,12.2],[7,7.1],[9.4,8.2],[8.2,16],[9,21.5],[13.4,28.4]],true,64);
  floor(src,silver,inset(terrace,-1.3),2.85,.4);
  band(terrace,3.3,.7);
  guard(spline([[15.1,35],[12.3,32.2],[8.9,29.1],[5.7,26.7],[3.8,23.3],[3.1,18.8],[4,12.2],[7,7.1]],false,24),4,true);
  const tableRed=mat('srcTable','#b5482f');
  for(const [x,z] of [[5.4,19.6],[6.4,22.4],[8.4,25.4]])box(src,tableRed,x,.75,z,1.7,.12,1.7);

  // Ground: one paved court under every wing, the lawn it meets, the path
  // toward the camera, and the planted bank that climbs to the pool walkway.
  const lawnEdge=[[-100,1],[-80,6.5],[-67.5,11],[-54.7,16.4],[-40.9,21.6],[-31.7,24.9],[-22.3,27],[-15.4,28.2],[-11,31.1],[-6.5,36.4],[-1,42.6],[0,47],[-.1,52.9],[-.9,57.4],[-1.3,59.8],[-2.6,70]];
  floor(src,court,[[-100,-50],[-97,-86],[-62,-86],[-20,-76],[6,-67],[30,-60],[64,-26],[90,-10],[90,42],[54,56],[31,70],[-2.6,72],...[...lawnEdge].reverse()],-.4,.4);
  const lawnOuter=[[-2.6,70],[-40,68],[-80,54],[-100,34],[-100,1]];
  const grass=mat('srcLawn','#527027',{transparent:true,depthWrite:false});grass.userData.skipHeightFog=true;
  // Fade only the lawn's open sides into the cloud sea; the paved edge stays crisp.
  grass.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 turfPoint;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n turfPoint=position.xz;');
    shader.fragmentShader='varying vec2 turfPoint;\n'+shader.fragmentShader;
    const edges=lawnOuter.slice(0,-1).map((a,i)=>{
      const b=lawnOuter[i+1];
      return `{vec2 a=vec2(${a.map(n=>n.toFixed(3)).join(',')}),b=vec2(${b.map(n=>n.toFixed(3)).join(',')});vec2 e=b-a;float t=clamp(dot(turfPoint-a,e)/dot(e,e),0.0,1.0);edgeDistance=min(edgeDistance,length(turfPoint-a-e*t));}`;
    }).join('\n');
    shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
float edgeDistance=1000.0;
${edges}
gl_FragColor.a*=smoothstep(0.0,9.0,edgeDistance)*0.92;`);
  };
  grass.customProgramCacheKey=()=> 'src-turf-boundary-v3';
  floor(src,grass,[...lawnEdge,...lawnOuter.slice(1,-1)],-.3,.26);
  trim(lawnEdge.slice(7),.04,srcTrim,.13,true);
  for(let i=1;i<7;i++){
    const a=lawnEdge[i],b=lawnEdge[i+1],len=span(a,b);
    for(let d=1;d<len-1;d+=2.7){const q=along(a,b,d/len),drain=fine(box(src,srcDark,q[0]+.5,.02,q[1]-1.5,1.5,.05,.32));drain.rotation.y=yaw(a,b);}
  }
  floor(src,green,[[7.4,37.2],[6.2,41.9],[5.8,50.2],[5.3,56],[4.4,59.8],[3.2,72],[5.6,72],[6.2,59.8],[6.8,57.4],[7.8,52.9],[8.2,47.6],[9,41.2],[8.3,37.6]],0,.05);
  const bank=[[9.6,40],[13,36.5],[16.5,42],[19,49],[21,56],[23.6,66],[23.6,72],[9.2,72],[9.8,56]];
  floor(src,bush,bank,0,.9);floor(src,bush,inset(bank,1.5),.9,.9);floor(src,bush,inset(bank,3),1.8,.5);
  for(let i=0;i<60;i++){const z=38.5+(i*7%33),t=(i*5%11)/10,x=10.4+t*(2.6+(z-38.5)*.3);shrub(x,z,1.7,.7+t*1.4,20);}
  const walk=[[16.4,42.6],[19,49.4],[21,56.2],[23.6,69]];
  floor(src,court,[...walk,...[...walk].reverse().map(p=>[p[0]-2.2,p[1]+.8])],2,.3);
  walk.slice(0,-1).forEach((a,i)=>{const b=walk[i+1];for(let t=0;t<1;t+=.34){const q=along(a,b,t);cylinder(src,steel,q[0]-2.1,2.8,q[1]+.8,.04,1.1);}edgeBeam(src,steel,[a[0]-2.1,a[1]+.8],[b[0]-2.1,b[1]+.8],3.34,.04);});
  planter([-61.9,0],[-53.3,3.4]);planter([-36.7,10.2],[-30.3,11.7]);planter([-25.8,11],[-19.1,13.2]);
  planter([-11.6,8.6],[-5.1,3.4],2,3);
  for(const [x,z,h,r] of [[-13.4,29.3,5.2,1.9],[-10.1,32.6,5.6,2],[-6.9,37.2,5,1.8],[-4.4,39.7,4.6,1.7],[-6.4,46.5,5.4,2],[-10.5,39,5.8,2.1]])sapling(x,z,h,r,0,110);
  sapling(11.3,52.4,8.6,3.6,1,190);sapling(15.5,61,5,2,1.8,90);sapling(19.5,52.5,4.6,1.5,2.3,60);
  // A few trees from the wooded edge, where they stand by a remaining building.
  for(const [x,z,h,r] of [[-98,-66,9,4],[22,-64,8.5,3.8],[88,44,8.5,3.8]])sapling(x,z,h,r,0,70);
  // The group origin sits at the forum mouth so close-up rotation pivots there.
  // The photo view below is in these units too, so the close-up keeps its framing.
  const metre=.112;src.position.set(2,0,-2);utown.scale.setScalar(metre);
  // Vantage of the reference dusk photograph (1920 x 1080, f = 1146 px, horizon
  // 93 px above centre) for the scene's close-up, in world units from the group origin.
  const eye=[0,18,90],reach=60,dip=Math.atan2(93,1146);
  utown.userData.photoView={
    target:[eye[0]+src.position.x,eye[1]-reach*Math.sin(dip),eye[2]-reach*Math.cos(dip)+src.position.z].map(n=>n*metre),
    distance:reach*metre,pitch:dip,fov:2*Math.atan2(960,1146)
  };

  // EA is a deep U-shaped block: the entrance bar closes its northern end,
  // while two long wings frame an open court behind it. The map is axonometric,
  // so this footprint preserves topology without treating its pixels as survey dimensions.
  const cde=new T.Group();cde.name='CDE · Engineering EA';
  const eaOutline=[[0,5.6],[5.2,2.3],[5.2,-7.8],[2.2,-7.8],[2.2,-.2],[0,1.25],[-2.2,-.2],[-2.2,-7.8],[-5.2,-7.8],[-5.2,2.3]];
  const eaCore=centroidScaled(eaOutline,.99);
  floor(cde,concrete,eaCore,.15,2.12);
  for(let f=0;f<6;f++) {
    const y=2.25+f*.86;
    floor(cde,white,eaOutline,y,.51);
    curtain(cde,eaOutline,y+.52,.27,false,.24);
    floor(cde,pale,eaOutline,y+.8,.045);
  }
  floor(cde,white,eaOutline,7.43,.16);
  floor(cde,concrete,centroidScaled(eaOutline,.985),7.6,.035);
  // Panel seams follow every edge, rather than being confined to one facade.
  for(let f=0;f<6;f++)for(let i=0;i<eaOutline.length;i++) {
    const a=eaOutline[i],b=eaOutline[(i+1)%eaOutline.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.7);
    for(let j=0;j<n;j++){const t=j/n;box(cde,joint,a[0]+(b[0]-a[0])*t,2.5+f*.86,a[1]+(b[1]-a[1])*t,.009,.48,.009);}
  }
  // Grey stair towers stand proud of the entrance bar at both ends, each with
  // two columns of portholes, as in the entrance photograph.
  const towerGrey=mat('eaCore','#a7aaa5');
  for(const x of [-5.95,5.95]) {
    box(cde,towerGrey,x,3.45,.55,1.5,6.9,3.3);box(cde,pale,x,6.95,.55,1.64,.1,3.44);
    for(const dx of [-.36,.36])for(let y=2.5;y<6.6;y+=.86){const port=cylinder(cde,dark,x+dx,y,2.215,.1,.03);port.rotation.x=Math.PI/2;}
  }
  for(const x of [-2.9,3.1])box(cde,concrete,x,7.84,-3,1,.48,1.4);
  for(let i=0;i<4;i++)beam(cde,steel,[-1+i*.35,7.6,1.8],[-1+i*.35,8.15+(i%2)*.25,1.8],.02);
  // Entry opening between long single-storey walls, which frame the space-frame
  // canopy and carry on past the towers.
  const eaPodium=mat('eaPodium','#b4b7b1');
  for(const side of [-1,1]) {
    box(cde,eaPodium,side*5.9,1.15,4.55,5.6,2.3,2.5);
    for(const x of [4.6,6.4,8])box(cde,concrete,side*x,.78,5.81,.62,1.56,.04);
    for(let x=3.5;x<8.7;x+=.62)foliage(cde,side*x,.3,6.3,.36,24);
  }
  // Dark entrance glazing follows the two faces of the prow under the canopy.
  for(const side of [-1,1]) {
    const lobby=box(cde,glassDark,side*1.56,1.2,4.67,3.6,2.1,.05);lobby.rotation.y=side*.566;
    for(let d=.25;d<3.6;d+=.42){const post=box(cde,steel,side*d*.845,1.2,5.66-d*.536,.03,2.1,.03);post.rotation.y=side*.566;}
  }
  sign(cde,'FACULTY OF ENGINEERING',-1.3,1.9,4.88,2.6,'#d6d9ca').rotation.y=-.566;
  const eaSign=sign(cde,'ENGINEERING EA',1.55,2.48,4.63,2.35);eaSign.rotation.y=.565;
  const gold=mat('gold','#e6b020',{metalness:.3,roughness:.42}),blue=mat('blue','#1c5363');
  for(const x of [-2.65,2.65])for(const z of [3.9,6.15])cylinder(cde,blue,x,1.63,z,.08,3.26);
  for(let x=-3;x<2.99;x+=.6)for(let z=3.8;z<6.2;z+=.6) {
    const v=[x+.3,2.92,z+.3];
    for(const [dx,dz] of [[0,0],[.6,0],[.6,.6],[0,.6]])beam(cde,gold,[x+dx,3.5,z+dz],v,.023);
    beam(cde,gold,[x,3.5,z],[x+.6,3.5,z],.026);beam(cde,gold,[x,3.5,z],[x,3.5,z+.6],.026);
    beam(cde,gold,v,[x+.9,2.92,z+.3],.023);
  }
  for(const z of [3.8,6.2])beam(cde,gold,[-3,3.5,z],[3,3.5,z],.04);
  for(let i=0;i<4;i++)box(cde,pale,0,.02+i*.07,6.6-i*.17,5.9,.07,.65);
  // The bronze helix stands on the entrance axis, straight in front of EA, on
  // the planted island of the drop-off loop.
  const bronze=mat('bronze','#5b6753',{metalness:.25,roughness:.55});
  const island=[0,11.6],loop=(r,n=36)=>Array.from({length:n},(_,i)=>[island[0]+Math.cos(i/n*Math.PI*2)*r,island[1]+Math.sin(i/n*Math.PI*2)*r]);
  floor(cde,paving,[[-8.7,5.8],[8.7,5.8],[8.7,8.2],[4.6,13.4],[2.2,15.6],[-2.2,15.6],[-4.6,13.4],[-8.7,8.2]],-.06,.08);
  floor(cde,mat('eaDrive','#8f9591'),loop(3.5),.02,.03,[loop(2.1)]);
  floor(cde,green,loop(2.1),.02,.12);
  for(let i=0;i<10;i++){const a=i*.63;foliage(cde,island[0]+Math.cos(a)*1.55,.36,island[1]+Math.sin(a)*1.55,.4,30);}
  const sculpture=new T.Group();sculpture.position.set(island[0],.14,island[1]);sculpture.scale.setScalar(.6);cde.add(sculpture);
  cylinder(sculpture,paving,0,.3,0,1.2,.6);
  for(const phase of [0,Math.PI]) {
    const p=[];
    for(let i=0;i<=100;i++){const t=i/100,a=phase+Math.pow(t,.8)*Math.PI*5.6,r=.66*(1-t*.7);p.push(new T.Vector3(Math.cos(a)*r,.6+4*t,Math.sin(a)*r*.7));}
    p.push(new T.Vector3(-.4,5,phase*.04),new T.Vector3(-.9,5.6,phase*.04),new T.Vector3(-.7,6.1,phase*.04),new T.Vector3(.25,6.7,phase*.04),new T.Vector3(1.2,6.85,phase*.04));
    mesh(sculpture,ribbon(new T.CatmullRomCurve3(p)),bronze);
  }
  // Courtyard is open to the rear, with the two bridges shown on the campus map.
  floor(cde,green,[[0,1.05],[2,-.3],[2,-7.7],[-2,-7.7],[-2,-.3]],.06,.025);
  for(const z of [-4.8,-7.5]){box(cde,pale,0,1.1,z,4.5,.13,.7);terraceRail(cde,0,1.24,z+.35,4.5);}
  tree(cde,0,-1.5,3.7,1.15);
  for(const [x,z] of [[-9.8,7],[9.8,7],[6,-5],[-5.7,-7.8]])tree(cde,x,z,2.3,1.1);
  // Neighbouring blocks follow the topology of the supplied CDE axonometric:
  // E3A beside EA, LT7 between them, E1A beyond EA's court, and E3 around E2.
  // These are proportional massing models; the map is not a measured floor plan.
  const campusConcrete=mat('cdeNeighbourConcrete','#d4d2c7');
  const campusBand=mat('cdeNeighbourBand','#b8bdb6');
  const campusGlass=mat('cdeNeighbourGlass','#52777a',{metalness:.15,roughness:.4});
  function teachingBlock(outline,storeys,storeyHeight=.83) {
    const group=new T.Group();cde.add(group);
    floor(group,campusConcrete,outline,.1,.65);
    for(let f=0;f<storeys;f++){
      const y=.75+f*storeyHeight;
      floor(group,campusConcrete,outline,y,.38);
      curtain(group,outline,y+.39,storeyHeight-.44,false,.45,false,[campusGlass]);
      floor(group,campusBand,outline,y+storeyHeight-.04,.05);
    }
    const top=.75+storeys*storeyHeight;
    floor(group,pale,centroidScaled(outline,1.015),top,.14);
    floor(group,campusConcrete,centroidScaled(outline,.94),top+.14,.04);
    return {group,top};
  }
  // E3A: broad east-west bar with projecting end cores and a central rear arm.
  const e3aOutline=[[6.7,1.5],[14.4,1.5],[14.4,-2.2],[13.7,-2.2],[13.7,-3.1],[10.5,-3.1],[10.5,-4.8],[8.9,-4.8],[8.9,-2.7],[6.7,-2.7]];
  const e3a=teachingBlock(e3aOutline,5,.8);e3a.group.name='E3A';
  box(e3a.group,concrete,13.65,2.5,-1.2,.65,5,2.9);
  box(e3a.group,pale,10.4,e3a.top+.31,-.4,1.9,.28,1.1);
  // LT7: the small faceted lecture theatre in the gap, with a raised polygonal roof.
  const lt7=new T.Group();lt7.name='LT7';cde.add(lt7);
  const theatre=[[5.9,-4.6],[7.5,-4.1],[9,-5.3],[8.5,-7.2],[6.7,-7.8],[5.5,-6.4]];
  floor(lt7,campusConcrete,theatre,.15,2.35);
  floor(lt7,pale,centroidScaled(theatre,1.07),2.5,.18);
  floor(lt7,campusBand,centroidScaled(theatre,.73),2.68,.58);
  floor(lt7,pale,centroidScaled(theatre,.77),3.26,.12);
  box(lt7,campusGlass,7.1,1.2,-4.35,1.6,1.5,.025);
  // E1A: long narrow wing extending beyond the open end of EA.
  const e1a=teachingBlock([[-5.1,-10.1],[-.8,-10.1],[-.8,-18.6],[-5.1,-18.6]],5,.8);e1a.group.name='E1A';
  box(e1a.group,concrete,-.85,2.8,-13.3,.55,5.6,2.1);
  for(let y=.9;y<4.9;y+=.72)box(e1a.group,glassLight,-.55,y,-13.3,.025,.48,.48);
  // E3: two long wings and their far connecting bar surround a visible courtyard.
  const e3Outline=[[10,-8.9],[12.4,-8.9],[12.4,-17.7],[15.1,-17.7],[15.1,-8.9],[17.4,-8.9],[17.4,-21.2],[10,-21.2]];
  const e3=teachingBlock(e3Outline,6,.8);e3.group.name='E3';
  floor(cde,green,[[12.5,-9],[15,-9],[15,-17.6],[12.5,-17.6]],.06,.025);
  // E2 is the slim covered spine between the two ranges, with a teal barrel roof.
  box(cde,campusConcrete,4.15,1.22,-14.5,2.3,2.4,11.8);
  const e2Roof=mat('e2Roof','#43868b');
  const roofPoints=[];
  for(let i=0;i<=24;i++){const a=i/24*Math.PI;roofPoints.push([4.15+Math.cos(a)*1.24,2.4+Math.sin(a)*.44]);}
  roofPoints.push([2.91,2.35],[5.39,2.35]);
  face(cde,e2Roof,roofPoints,12.1,-20.5);
  // Covered pedestrian bridges preserve the campus relationships in the map.
  function link(a,b,y=1.4,w=.65) {
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),angle=Math.atan2(-dz,dx);
    const deck=box(cde,pale,(a[0]+b[0])/2,y,(a[1]+b[1])/2,length,.14,w);deck.rotation.y=angle;
    const cover=box(cde,campusBand,(a[0]+b[0])/2,y+1.03,(a[1]+b[1])/2,length,.1,w+.12);cover.rotation.y=angle;
    for(let t=.15;t<1;t+=.35)cylinder(cde,white,a[0]+dx*t,y+.52,a[1]+dz*t,.035,1.04);
  }
  link([4.9,-2],[6.7,-2]);link([4.9,-5.7],[5.9,-5.7]);
  link([-3.5,-7.8],[-3.5,-10.1]);link([-.8,-12],[3.0,-12]);
  link([5.3,-13],[10,-13]);link([8,-7.1],[10.5,-9.2]);
  link([-.8,-17.3],[3,-17.3]);link([5.3,-18.6],[10,-18.6]);
  for(const [x,z] of [[7.5,-10.5],[7.2,-17.5],[-5.8,-12.2],[14,-13]])tree(cde,x,z,1.8,.7);
  // Centre the whole precinct so group rotation and zoom include every block.
  const precinct=new T.Group();precinct.name='CDE precinct';
  for(const child of [...cde.children])precinct.add(child);
  precinct.position.set(-4,0,5.5);cde.add(precinct);
  cde.scale.setScalar(.65);


  // Lee Kong Chian Natural History Museum, in metres. Three sources fix it:
  //  - a near-vertical aerial photograph gives the plan: the roof polygon, the fold
  //    in the north-east face, and where each corner facet meets the roof edge;
  //  - four photographs (the two references, two more from the east) were fitted
  //    together, one camera each plus the shared heights of the roof and of the
  //    corner facets. The fitted vertices land within 2 to 8 px of the photographs;
  //  - the plaza-level reference, back-projected onto the two cut walls, gives the
  //    profile of the scoop that holds the cliff garden.
  // Plan points are metres east and north of the aerial's datum. Local frame: +Z
  // points at the plaza-level photograph's camera and Y = 0 is the plaza.
  const museum=new T.Group();museum.name='Natural History Museum';
  {
    const rock=new T.Group();rock.name='Museum frame';museum.add(rock);
    const bearing=68.9*Math.PI/180,datum=[19,3];
    const at=(e,n)=>[(e-datum[0])*Math.cos(bearing)-(n-datum[1])*Math.sin(bearing),-((e-datum[0])*Math.sin(bearing)+(n-datum[1])*Math.cos(bearing))];
    const lay=(...points)=>points.map(p=>at(...p));
    // Wall corners W, S, E, N and the fold B; the rest are roof vertices.
    const plan={W:[-5.08,3.22],S:[35,-18.5],E:[42.97,5.52],B:[29.3,14.4],N:[-1.15,25.1],A:[-1.7,22],A2:[5.1,22.9],C:[35.7,10.2],D:[41.7,1.7],Er:[37.6,-10.7],F:[30.1,-15.8],G:[20.1,-10.4],Hh:[-3.9,9.8]};
    const corner=Object.fromEntries(Object.entries(plan).map(([name,p])=>[name,at(...p)]));
    // The north-east and south-east faces stand on a terrace 3.5 m below the plaza.
    const roofY=20.3,lowY=-3.5,groundY=-6.5,apex={N:12.1,E:11.6,S:13.6},toe={E:3.8,S:2.2};
    const P=(k,y)=>{const p=typeof k==='string'?corner[k]:k;return [p[0],y,p[1]];};
    const on=(a,b,d)=>along(corner[a],corner[b],d/span(corner[a],corner[b]));
    const inward=(a,b)=>{const p=corner[a],q=corner[b],l=span(p,q),n=[-(q[1]-p[1])/l,(q[0]-p[0])/l];return n[0]*(p[0]+q[0])+n[1]*(p[1]+q[1])<0?n:[-n[0],-n[1]];};

    // Board-marked concrete: courses of dark planks of uneven length.
    const boards=document.createElement('canvas');boards.width=boards.height=512;
    const pen=boards.getContext('2d');pen.fillStyle='#4b4845';pen.fillRect(0,0,512,512);
    for(let row=0;row<32;row++){let x=-rand()*90;while(x<512){const w=40+rand()*150,tone=100+Math.floor(rand()*42);pen.fillStyle=`rgb(${tone},${tone-3},${tone-8})`;pen.fillRect(x,row*16+1,w-2,14);x+=w;}}
    const boardMap=new T.CanvasTexture(boards);boardMap.colorSpace=T.SRGBColorSpace;boardMap.wrapS=boardMap.wrapT=T.RepeatWrapping;boardMap.anisotropy=4;
    const stone=mat('stone','#ffffff',{map:boardMap,bumpMap:boardMap,bumpScale:.6,roughness:.95,side:T.DoubleSide});
    const smooth=mat('lkcFacet','#7d776d',{roughness:.9,side:T.DoubleSide}),plate=mat('lkcPlate','#2f2d2b',{metalness:.3,roughness:.6,side:T.DoubleSide});
    const clays=['#a2553a','#b46a48','#8c452e'].map((c,i)=>mat('lkcClay'+i,c,{side:T.DoubleSide}));
    const recess=mat('lkcRecess','#4d2a20',{side:T.DoubleSide}),loam=mat('lkcLoam','#4a4435',{side:T.DoubleSide});
    const roofing=mat('lkcRoof','#a3a199',{side:T.DoubleSide}),well=mat('lkcWell','#70756c',{side:T.DoubleSide});
    const slope=mat('lkcLawn','#6d8a48',{side:T.DoubleSide}),deck=mat('lkcDeck','#b9b6ac',{side:T.DoubleSide});
    const annexWall=mat('lkcAnnex','#9a9c98'),earth=mat('lkcEarth','#ad9b7c'),opening=mat('lkcPane','#1c2529',{metalness:.2,roughness:.3});
    // Plaza paving: 2.5 m squares in four greys.
    const squares=document.createElement('canvas');squares.width=squares.height=256;
    const brush=squares.getContext('2d');
    for(let i=0;i<8;i++)for(let j=0;j<8;j++){brush.fillStyle=['#cfcdc5','#b9b8b0','#a3a39c','#8c8d88'][Math.floor(rand()*4)];brush.fillRect(i*32,j*32,32,32);}
    const squareMap=new T.CanvasTexture(squares);squareMap.colorSpace=T.SRGBColorSpace;squareMap.wrapS=squareMap.wrapT=T.RepeatWrapping;squareMap.repeat.set(.05,.05);
    const tiles=mat('lkcTiles','#dcdcd6',{map:squareMap,roughness:.85});

    // Planar polygons collect into one mesh per material. The cladding's board
    // marks run along each wall, or at `lean` radians where the wall is cast so.
    const soups=new Map();
    function facet(material,points,lean=0,grain=8) {
      const p=points.map(q=>new T.Vector3(...q)),normal=new T.Vector3();
      p.forEach((a,i)=>{const b=p[(i+1)%p.length];normal.x+=(a.y-b.y)*(a.z+b.z);normal.y+=(a.z-b.z)*(a.x+b.x);normal.z+=(a.x-b.x)*(a.y+b.y);});
      normal.normalize();
      const u=new T.Vector3(0,1,0).cross(normal);if(u.lengthSq()<1e-6)u.set(1,0,0);u.normalize();
      const v=normal.clone().cross(u),flat=p.map(q=>new T.Vector2(q.dot(u),q.dot(v)));
      if(!soups.has(material))soups.set(material,{position:[],uv:[]});
      const soup=soups.get(material),c=Math.cos(lean)/grain,s=Math.sin(lean)/grain;
      for(const tri of T.ShapeUtils.triangulateShape(flat,[]))for(const i of tri){soup.position.push(p[i].x,p[i].y,p[i].z);soup.uv.push(flat[i].x*c+flat[i].y*s,flat[i].y*c-flat[i].x*s);}
    }

    // The rock. Each corner is cut by a triangular facet from the roof edge down to
    // a point on the corner; two base corners carry dark steel plates.
    const eN=on('E','B',4),eS=on('E','S',3.5),sE=on('S','E',3.5),sW=on('S','W',4.5),sStep=on('S','W',6);
    facet(stone,[P('N',lowY),P('B',lowY),P('B',roofY),P('A2',roofY),P('N',apex.N)]);
    facet(stone,[P('B',lowY),P(eN,lowY),P('E',toe.E),P('E',apex.E),P('C',roofY),P('B',roofY)]);
    facet(stone,[P('E',apex.E),P('D',roofY),P('Er',roofY),P('S',apex.S),P('S',toe.S),P(sE,lowY),P(eS,lowY),P('E',toe.E)],.5);
    for(const [a,b,k] of [['A','A2','N'],['C','D','E'],['Er','F','S']])facet(smooth,[P(a,roofY),P(b,roofY),P(k,apex[k])]);
    facet(plate,[P('E',toe.E),P(eN,lowY),P(eS,lowY)]);facet(plate,[P('S',toe.S),P(sE,lowY),P(sW,lowY)]);
    // Top edges of the two walls the garden is scooped from, as [distance from the
    // west corner, height]: both start at a 4 m parapet and climb to the roof.
    const swCut=spline([[0,4],[1.7,3.7],[4.3,3.5],[7.5,3.4],[11.9,3.5],[14.6,3.8],[17.9,4.8],[21.2,6.4],[23.8,9.2],[25.9,13.7],[27.7,18.6],[span(corner.W,corner.G),roofY]],false,44);
    const nwCut=spline([[0,4],[.5,5],[1.5,6.5],[3,10.1],[4.5,15.3],[span(corner.W,corner.Hh),roofY]],false,20);
    const swEdge=swCut.map(([d,y])=>P(on('W','S',d),y)),nwEdge=nwCut.map(([d,y])=>P(on('W','N',d),y));
    facet(stone,[P('W',0),...swEdge,P('F',roofY),P('S',apex.S),P('S',toe.S),P(sW,lowY),P(sStep,lowY),P(sStep,0)]);
    facet(stone,[P('W',0),...nwEdge,P('A',roofY),P('N',apex.N),P('N',0)],.5);
    // The cut shows the walls' thickness, and their inner faces where they stand free.
    const thick=.9;
    for(const [edge,n] of [[swEdge,inward('W','S')],[nwEdge,inward('W','N')]]) {
      const behind=q=>[q[0]+n[0]*thick,q[1],q[2]+n[1]*thick],first=edge[0],last=edge[edge.length-1];
      for(let i=1;i<edge.length;i++)facet(stone,[edge[i-1],edge[i],behind(edge[i]),behind(edge[i-1])]);
      facet(stone,[behind([first[0],0,first[2]]),...edge.map(behind),behind([last[0],0,last[2]])]);
    }

    // Cliff garden. At any height the scoop's face runs from the point where one
    // wall's cut passes that height to the same point on the other wall, bowed
    // slightly into the building as the roof edge is in the aerial.
    const reach=(cut,y)=>{for(let i=1;i<cut.length;i++){const a=cut[i-1],b=cut[i];if(b[1]>a[1]&&a[1]<=y&&b[1]>=y)return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return cut[cut.length-1][0];};
    function shelf(y,back,count=16) {
      const a=on('W','N',reach(nwCut,Math.max(y,4))),b=on('W','S',reach(swCut,Math.max(y,4))),l=span(a,b);
      let n=[-(b[1]-a[1])/l,(b[0]-a[0])/l];if(n[0]*(a[0]+b[0])+n[1]*(a[1]+b[1])>0)n=[-n[0],-n[1]];
      const bow=.3+1.3*y/roofY;
      return Array.from({length:count+1},(_,i)=>{const t=i/count,k=back+bow*Math.sin(Math.PI*t),q=along(a,b,t);return [q[0]+n[0]*k,q[1]+n[1]*k];});
    }
    const setback=y=>2.5*Math.min(1,(roofY-y)/2.5),courses=14;
    for(let j=0;j<courses;j++) {
      const y0=4+(roofY-4)*j/courses,y1=4+(roofY-4)*(j+1)/courses,lower=shelf(y0,setback(y0)),upper=shelf(y1,setback(y1));
      for(let i=1;i<lower.length;i++)facet(recess,[P(lower[i-1],y0),P(lower[i],y0),P(upper[i],y1),P(upper[i-1],y1)]);
    }
    const bedFront=shelf(4,thick),bedBack=shelf(4,2.5);
    facet(loam,[...bedFront.map(q=>P(q,3.3)),...[...bedBack].reverse().map(q=>P(q,3.3))]);
    for(let i=1;i<bedBack.length;i++)facet(recess,[P(bedBack[i-1],3.3),P(bedBack[i],3.3),P(bedBack[i],4),P(bedBack[i-1],4)]);
    const brow=shelf(roofY,0,20);
    for(let i=1;i<brow.length;i++)facet(stone,[P(brow[i-1],roofY),P(brow[i],roofY),P(brow[i],roofY-1),P(brow[i-1],roofY-1)]);
    // Planting in sunlit greens: a clump of leaves, and a slender tree.
    const greens=['#35602f','#4f7d36','#6f9a3f','#8fb04f'].map((c,i)=>mat('lkcLeaf'+i,c));
    function clump(q,y,r,count) {
      for(let i=0;i<count;i++) {
        const a=rand()*Math.PI*2,v=rand()*2-1,d=r*Math.cbrt(rand())*Math.sqrt(1-v*v),s=.12+rand()*.15;
        mesh(rock,leafGeometry,greens[Math.floor(rand()*4)],q[0]+Math.cos(a)*d,y+v*r*.6,q[1]+Math.sin(a)*d,s*1.8,s*.7,s).rotation.set(rand()*3,rand()*3,rand()*3);
      }
    }
    function sprig(q,y,h,r,count=60) {
      beam(rock,bark,[q[0],y,q[1]],[q[0]+.1,y+h*.72,q[1]],Math.max(.06,r*.045));
      for(let i=0;i<3;i++){const a=i*2.1+q[0];clump([q[0]+Math.cos(a)*r*.35,q[1]+Math.sin(a)*r*.35],y+h*(.62+i*.15),r*.8,count);}
    }
    // Six tiers of terracotta planters, staggered from tier to tier.
    for(let tier=0;tier<6;tier++) {
      const lip=6+tier*2.6,front=shelf(lip,1.05,48),back=shelf(lip,2.45,48),sill=shelf(lip-2,1.8,48);
      const count=Math.max(2,Math.round(span(front[0],front[48])/3.7)),step=48/count,shift=(tier%2)*.4;
      for(let i=0;i<count;i++) {
        const i0=Math.max(1,Math.round((i+.08+shift)*step)),i1=Math.min(47,Math.round((i+.92+shift)*step));if(i1-i0<3)continue;
        const hi=lip-rand()*.4,lo=lip-2+rand()*.5,clay=clays[(i+tier*2)%3];
        const a=P(front[i0],hi),b=P(front[i1],hi),c=P(along(sill[i0],sill[i1],.84),lo),d=P(along(sill[i0],sill[i1],.16),lo);
        facet(clay,[a,b,c,d]);facet(clay,[a,d,P(back[i0],lo),P(back[i0],hi)]);facet(clay,[b,P(back[i1],hi),P(back[i1],lo),c]);
        facet(loam,[P(front[i0],hi-.15),P(front[i1],hi-.15),P(back[i1],hi-.15),P(back[i0],hi-.15)]);
        for(const t of [.16,.5,.84])if(rand()>.3)clump(along(along(front[i0],front[i1],t),along(back[i0],back[i1],t),.35),hi+.3+rand()*.35,.95+rand()*.45,46);
        if(rand()>.55)clump(along(front[i0],front[i1],.2+rand()*.6),hi-.7-rand()*.5,.7,24);
        if((i+tier)%3===1)sprig(along(along(front[i0],front[i1],.5),along(back[i0],back[i1],.5),.5),hi,2.8+rand()*1.6,1.1,40);
      }
    }
    // Planting fills the bed behind the parapet and spills over both cut edges.
    for(let i=3;i<bedFront.length;i++)clump(along(bedFront[i],bedBack[i],.5),3.7,1.1,34);
    for(const [edge,n] of [[swEdge,inward('W','S')],[nwEdge,inward('W','N')]])
      for(let i=2;i<edge.length-1;i+=2)if(edge[i][1]>(edge===nwEdge?7:4.6)&&edge[i][1]<roofY-2)clump([edge[i][0]+n[0]*1.8,edge[i][2]+n[1]*1.8],edge[i][1]+.2,.9,30);
    // Roof with its two sunken plant wells.
    facet(roofing,[P('A',roofY),P('A2',roofY),P('B',roofY),P('C',roofY),P('D',roofY),P('Er',roofY),P('F',roofY),...[...brow].reverse().map(q=>P(q,roofY))]);
    facet(well,lay([5.9,21.1],[11.3,19.1],[9.3,12.3],[4.3,16.7]).map(q=>P(q,roofY+.06)));
    facet(well,lay([29,12.9],[35.1,9.1],[39.8,1.8],[36.8,-6.2],[23.7,-1.5]).map(q=>P(q,roofY+.06)));

    // Openings: small, and set in scattered groups rather than in rows of floors.
    function pane(a,b,d,y,w,h,material,tilt=0) {
      const q=on(a,b,d),n=inward(a,b),o=fine(box(rock,material,q[0]-n[0]*.06,y,q[1]-n[1]*.06,w,h,.14));
      o.rotation.set(0,yaw(corner[a],corner[b]),tilt);o.castShadow=false;return o;
    }
    [18,16.3,13.2,11.6,8.5,6.5,3.1,1.2].forEach((y,i)=>pane('S','E',8.6+(i%2)*.8,y,.45,1.5,opening,.6));
    [2.2,4.6,6,8.4,10.2,12.9,14.6,17,19.3,21.2,23.6,25.2].forEach((d,i)=>pane('B','N',d,12.9-(i%3)*.25,.75,.5,opening));
    [17,15.2,13,11.2,9,7.2,5,3].forEach((y,i)=>pane('W','N',12.4+y*.09+(i%2)*.9,y,.7,.9,opening));
    for(const [d,y] of [[41.5,17.2],[40.6,15.4],[41.8,13.6],[39.8,12],[40.9,10.2],[38.9,8.6],[40,6.8],[38,5.2],[39.2,3.6],[37.2,2.2]])pane('W','S',d,y,.8,.8,opening);

    // Podium: the plaza wraps the south-west and north-west sides; a lower terrace
    // carries the annex and a planted edge on the other two.
    const plaza=[...lay([31.5,-21.6],[-20.4,-4.3],[-10.9,32.2],[.3,31.6]),corner.N,sStep];
    const terrace=lay([-20.4,-4.3],[31.5,-21.6],[44.8,-26],[61,24.3],[2,43.5],[-8.5,41.5],[-10.9,32.2]);
    floor(rock,white,terrace,groundY,lowY-groundY-.2);floor(rock,deck,terrace,lowY-.2,.2);
    floor(rock,white,plaza,lowY,-lowY-.3);floor(rock,tiles,plaza,-.3,.3);
    // Steps from the plaza down to the terrace at the south corner.
    const downhill=along(corner.W,corner.S,1+7/span(corner.W,corner.S)),fall=[downhill[0]-corner.S[0],downhill[1]-corner.S[1]];
    facet(deck,[P(sStep,0),P(plaza[0],0),[plaza[0][0]+fall[0],lowY,plaza[0][1]+fall[1]],[sStep[0]+fall[0],lowY,sStep[1]+fall[1]]]);
    // South-west face: white band over dark louvres, then a lawn falling away.
    const sw0=plaza[1],sw1=terrace[2],swLength=span(sw0,sw1),out=[-(sw1[1]-sw0[1])/swLength,(sw1[0]-sw0[0])/swLength];
    const louvre=box(rock,dark,(sw0[0]+sw1[0])/2+out[0]*.1,-2.5,(sw0[1]+sw1[1])/2+out[1]*.1,swLength-1.5,2.2,.3);louvre.rotation.y=yaw(sw0,sw1);
    facet(slope,[P(sw0,-3.6),P(sw1,-3.6),[sw1[0]+out[0]*7,groundY+.05,sw1[1]+out[1]*7],[sw0[0]+out[0]*7,groundY+.05,sw0[1]+out[1]*7]]);
    const rail=fine(box(rock,dark,(sw0[0]+plaza[0][0])/2,1.05,(sw0[1]+plaza[0][1])/2,span(sw0,plaza[0]),.07,.07));rail.rotation.y=yaw(sw0,plaza[0]);
    for(let d=0;d<=span(sw0,plaza[0]);d+=2.4){const q=along(sw0,plaza[0],d/span(sw0,plaza[0]));fine(box(rock,dark,q[0],.52,q[1],.05,1.05,.05));}
    // Entrance canopy along the north-west side.
    floor(rock,white,lay([-20.4,-4.3],[-10.9,32.2],[-7.5,45.5],[-16.5,47.8],[-29.5,-2]),-3.8,.8);
    for(const q of lay([-27.4,2],[-24.1,16],[-20.8,30],[-17.5,44]))cylinder(rock,white,q[0],(groundY-3.8)/2,q[1],.35,-3.8-groundY);
    // Annex across the terrace court, white toward the service road.
    const annex=lay([3,41.2],[49.4,24.8],[46.2,15.3],[.3,31.6]),annexTurn=yaw(annex[0],annex[1]),annexLength=span(annex[0],annex[1]);
    floor(rock,annexWall,annex,lowY,5.2);floor(rock,pale,inset(annex,-.25),lowY+5.2,.25);
    const annexOut=[(annex[0][0]-annex[3][0])/span(annex[0],annex[3]),(annex[0][1]-annex[3][1])/span(annex[0],annex[3])],annexMid=along(annex[0],annex[1],.5);
    box(rock,white,annexMid[0]+annexOut[0]*.1,lowY+2.6,annexMid[1]+annexOut[1]*.1,annexLength,5.2,.3).rotation.y=annexTurn;
    const band=along(annex[0],annex[1],.42);box(rock,glassDark,band[0]+annexOut[0]*.22,-.7,band[1]+annexOut[1]*.22,annexLength*.62,1.1,.2).rotation.y=annexTurn;
    // Rammed-earth planter along the terrace edge, with young trees.
    const bed0=at(5,41.4),bed1=at(59.6,23.7),bedLength=span(bed0,bed1);
    box(rock,earth,(bed0[0]+bed1[0])/2,-4.1,(bed0[1]+bed1[1])/2,bedLength,2.2,2.6).rotation.y=yaw(bed0,bed1);
    for(let d=1.2;d<bedLength;d+=2.3)clump(along(bed0,bed1,d/bedLength),-2.6,1.1,28);
    for(let i=0;i<9;i++)sprig(along(bed0,bed1,(i+.5)/9),-3,4.4+(i%3)*.7,1.05,30);
    for(const [e,n,h] of [[13,24.5,6],[22,21,5.4],[33,16.5,6.4],[41,13.5,5.2]])sprig(at(e,n),lowY,h,1.8,70);
    const hedge0=at(47.5,-19),hedge1=at(58.6,19.5);
    for(let d=0;d<1;d+=.07)clump(along(hedge0,hedge1,d),lowY+.5,1.3,30);
    // Rain trees on the lawn south of the plaza.
    for(const [e,n,h,r] of [[2,-22,11,4.6],[30,-32,10,4.4]])sprig(at(e,n),groundY+.6,h,r,220);

    for(const [material,soup] of soups) {
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(soup.position,3));geo.setAttribute('uv',new T.Float32BufferAttribute(soup.uv,2));
      geo.computeVertexNormals();mesh(rock,geo,material);
    }
    // Ground level is the service road, 6.5 m below the plaza.
    const scale=.17;rock.position.y=-groundY;museum.scale.setScalar(scale);
    // Vantage of the plaza-level reference (476 x 344, f = 190 px), 6.3 m above the
    // plaza: the ray through the image centre, in world units from the group origin.
    const lens=at(-13.3,-3.3),rise=5.4*Math.PI/180,far=31;
    // `span` and `rise` are the half-width and half-height the framing must keep.
    museum.userData.photoView={
      target:[lens[0],6.3-groundY+far*Math.sin(rise),lens[1]-far*Math.cos(rise)].map(n=>n*scale),
      distance:far*scale,pitch:-rise,fov:2*Math.atan2(238,190),maxFov:70,span:29*scale,rise:22.5*scale
    };
  }

  // Batch repeated members after child transforms; top-level scale remains live.
  const shared=new Set([boxGeometry,cylinderGeometry,leafGeometry]);
  for(const root of [utown,cde,museum]) {
    root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),batches=new Map();
    root.traverse(o=>{if(!o.isMesh||!shared.has(o.geometry))return;const key=o.geometry.uuid+o.material.uuid+o.castShadow+o.receiveShadow+!!o.userData.fine;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
    for(const objects of batches.values()) {
      const batch=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);
      objects.forEach((o,i)=>{batch.setMatrixAt(i,inverse.clone().multiply(o.matrixWorld));o.removeFromParent();});batch.castShadow=objects[0].castShadow;batch.receiveShadow=objects[0].receiveShadow;batch.userData.fine=!!objects[0].userData.fine;root.add(batch);
    }
  }
  return [utown,cde,museum];
}
