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

  // SRC from the user-supplied Town Green photograph. Long straight elevations
  // meet at rounded corners; the west wing projects ahead of the glazed hall,
  // and the long pool is set behind an open forum. Proportions are photo estimates.
  const utown=new T.Group();utown.name='University Town';
  const src=new T.Group();utown.add(src);
  const paving=mat('paving','#c4bca7');
  const srcWhite=mat('srcWhite','#e5e4dc'),srcTrim=mat('srcTrim','#f3f1e9');
  const srcShade=mat('srcShade','#777e78'),srcFrame=mat('srcFrame','#89918c',{metalness:.35,roughness:.4});
  const srcDark=mat('srcDark','#222e30');
  const srcPanes=['#354340','#303f40','#3a4744'].map((c,i)=>mat('srcPane'+i,c,{metalness:.15,roughness:.27}));
  const balconyGlass=mat('srcBalconyGlass','#b8c9c4',{transparent:true,opacity:.18,depthWrite:false,roughness:.2});
  // Round only corners, preserving long straight sides instead of using a
  // closed Catmull-Rom curve that balloons the entire building into a capsule.
  function softCorners(vertices,r=.45) {
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
  const close=p=>[...p,p[0]];
  function trim(points,y,material=srcTrim,r=.018) {
    const p=close(points);for(let i=0;i<p.length-1;i++)edgeBeam(src,material,p[i],p[i+1],y,r);
  }
  function glazed(points,y,h,spacing=.38) {
    const p=close(points);let distance=0,nextPost=0;
    for(let i=0;i<p.length-1;i++) {
      const a=p[i],b=p[i+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
      if(len<.001)continue;
      const panel=box(src,srcPanes[Math.floor(distance/1.8)%3],(a[0]+b[0])/2,y+h/2,(a[1]+b[1])/2,len+.005,h,.025);
      panel.rotation.y=Math.atan2(-dz,dx);
      while(nextPost<=distance+len){const t=(nextPost-distance)/len;box(src,srcFrame,a[0]+dx*t,y+h/2,a[1]+dz*t,.024,h,.032);nextPost+=spacing;}
      distance+=len;
    }
    trim(points,y,srcFrame,.012);trim(points,y+h,srcFrame,.012);
  }
  function guard(points,y) {
    const p=close(points);let distance=0,nextPost=0;
    for(let i=0;i<p.length-1;i++) {
      const a=p[i],b=p[i+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.001)continue;
      const panel=box(src,balconyGlass,(a[0]+b[0])/2,y+.16,(a[1]+b[1])/2,len,.28,.009);panel.rotation.y=Math.atan2(-dz,dx);panel.castShadow=false;
      edgeBeam(src,steel,a,b,y+.32,.012);
      while(nextPost<=distance+len){const t=(nextPost-distance)/len;cylinder(src,steel,a[0]+dx*t,y+.16,a[1]+dz*t,.009,.32);nextPost+=.5;}distance+=len;
    }
  }
  function ribbonFloor(points,y,h=.18) {floor(src,srcWhite,points,y,h);trim(points,y+h,srcTrim,.025);trim(points,y-.015,srcShade,.013);}
  const west=softCorners([[-14,-1],[-2.2,-1],[-1.55,5.5],[-2.1,6.45],[-10.5,7.0],[-14,3.0]],.65);
  const westRoof=centroidScaled(west,1.02);
  const hall=softCorners([[-2.1,-1.45],[5.45,-1.45],[5.65,5.25],[-.75,5.72],[-2.1,4.55]],.48);
  const hallRoof=centroidScaled(hall,1.045);
  const pool=softCorners([[8.0,-3.6],[20,-3.6],[20,1.0],[9.0,2.1],[7.45,1.15]],.9);
  // Ground floor is recessed, exposing the structural columns and deep soffits.
  const westGround=centroidScaled(west,.89);
  glazed(westGround,.17,1.17,.55);ribbonFloor(west,1.38,.2);
  for(let x=-10.9;x<-1.9;x+=1.55)cylinder(src,srcWhite,x,.77,6.58-(x+10.9)*.06,.09,1.52);
  // Upper left wing has a single tall ventilated hall, not a stack of glass rings.
  floor(src,srcDark,centroidScaled(west,.84),1.62,2.05);
  ribbonFloor(westRoof,3.88,.18);
  floor(src,green,centroidScaled(west,.94),4.065,.035);
  guard(centroidScaled(west,.98),4.1);
  // Large rectangular bays and tilted opening windows between white piers.
  for(let bay=0;bay<6;bay++) {
    const x=-10.55+bay*1.45,z=6.96-(x+10.55)*.065;
    box(src,srcWhite,x-.66,2.73,z,.11,2.3,.17);
    for(let col=0;col<3;col++)for(let row=0;row<4;row++) {
      const px=x-.43+col*.43,py=2.02+row*.4;
      const pane=box(src,srcPanes[(row+col)%3],px,py,z+.02,.39,.32,.04);pane.rotation.x=-.27;
      box(src,srcFrame,px,py-.17,z+.055,.4,.027,.08);
    }
    box(src,srcShade,x,1.8,z,.025,.35,.025);
  }
  // West side wall is continuous with diagonal ramp parapets wrapping the wing.
  const sideWall=softCorners([[-14,-.9],[-13.65,-.9],[-13.65,3],[-10.5,6.65],[-10.5,7],[-14,3]],.15);
  floor(src,srcWhite,sideWall,.15,3.7);
  for(const top of [3.8,2.25]) {
    const curve=new T.CatmullRomCurve3([new T.Vector3(-14.15,top,-1),new T.Vector3(-14.25,top-.24,1.9),new T.Vector3(-13,top-.72,4.4),new T.Vector3(-10.6,top-1.42,7.12)]);
    const pts=curve.getPoints(48);
    for(let i=0;i<pts.length-1;i++) {
      const a=pts[i],b=pts[i+1],delta=b.clone().sub(a);
      const wall=box(src,srcWhite,(a.x+b.x)/2,(a.y+b.y)/2+.16,(a.z+b.z)/2,delta.length()+.015,.34,.08);
      wall.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),delta.normalize());
    }
  }
  // Central curtain wall starts above a recessed entrance floor. Its long front
  // and visible left return form a shallow pentagon with small-radius corners.
  glazed(centroidScaled(hall,.87),.12,1.18,.6);
  ribbonFloor(hall,1.34,.18);
  glazed(hall,1.53,3.38,.34);
  trim(hall,3.18,srcFrame,.014);
  ribbonFloor(hallRoof,4.96,.23);
  floor(src,srcWhite,centroidScaled(hallRoof,.99),5.18,.14,[centroidScaled(hallRoof,.94)]);
  floor(src,green,centroidScaled(hallRoof,.93),5.19,.025);
  for(const x of [-.5,1.2,3,4.9])cylinder(src,srcWhite,x,.75,5.12,.095,1.5);
  // Roof garden rises locally at the rear, as in the photo, rather than making
  // the whole roof a thick rounded green lid.
  mesh(src,new T.SphereGeometry(1,20,10),green,.3,5.19,.0,1.5,.28,.9);
  // Pool wing: long narrow water surface, blue tiled vertical edge and broad
  // white fascia. The pool and its two storeys sit behind the main hall.
  glazed(centroidScaled(pool,.94),.15,1.3,.6);
  ribbonFloor(centroidScaled(pool,1.02),1.5,.15);
  glazed(centroidScaled(pool,.96),1.68,1.53,.55);
  ribbonFloor(pool,3.25,.36);
  const waterEdge=softCorners([[8.25,-2.52],[19.15,-2.52],[19.4,.52],[9.2,1.38],[7.95,.7]],.65);
  const blueTile=mat('srcPoolTile','#285b75',{roughness:.48});
  floor(src,blueTile,waterEdge,3.61,.26);
  const water=mat('srcWater','#3e9caa',{metalness:.12,roughness:.2});
  floor(src,water,centroidScaled(waterEdge,.975),3.88,.012);
  trim(waterEdge,3.88,steel,.015);
  for(let x=8.45;x<19.2;x+=.14)box(src,glassLight,x,3.74,1.38-(x-9.2)*.078,.006,.24,.009);
  sign(src,'STEPHEN RIADY CENTRE',13.5,3.45,1.9,4.6);
  guard(centroidScaled(pool,1.015),1.66);
  // The rear pool pavilion is one continuous roof/white wall; this closes the
  // composition behind the pool without turning it into a detached round tower.
  const backRibbon=softCorners([[5.4,-4.5],[20.6,-4.5],[20.6,-2.55],[6.7,-2.55],[5.4,-.4]],.28);
  ribbonFloor(backRibbon,5.1,.2);
  box(src,srcWhite,13.2,4.55,-4.1,14.5,1.05,.15);
  for(let x=8;x<20.2;x+=2.1)cylinder(src,srcWhite,x,4.42,-2.75,.07,1.36);
  for(let x=9;x<18;x+=2.2)box(src,srcDark,x,4.43,-4,.85,.64,.04);
  // Recessed forum connects all wings; full-height white walls with irregular
  // square windows and bridges are visible through the gap beside the hall.
  box(src,srcWhite,6.7,2.65,-1.4,1.25,5.3,.2);
  for(const [x,y,w,h] of [[6.3,1.9,.24,.32],[6.9,2.45,.18,.34],[6.3,3.1,.35,.22],[7,3.65,.23,.45],[6.5,4.5,.24,.24]])box(src,srcDark,x,y,-1.28,w,h,.025);
  const bridge=softCorners([[4.7,-1.8],[9,-2.3],[9,-.7],[7.7,-.2],[7.3,1.3],[5.5,1.6]],.2);
  for(const y of [1.48,3.24]){ribbonFloor(bridge,y,.13);guard(bridge,y+.14);}
  for(const base of [.12,1.66])for(let i=0;i<13;i++)box(src,srcWhite,6.65,base+i*.115,3.8-i*.18,.85,.08,.2);
  // A low bronze sports-hall clerestory lies behind the west wing. It is a
  // continuous long facade, with sloping panels, not a freestanding pitched shed.
  const srcBronze=mat('srcBronze','#706d58',{metalness:.25,roughness:.65});
  box(src,srcWhite,-7.5,2.25,-3.15,15.6,4.5,3.8);
  const bronzeFace=box(src,srcBronze,-7.5,5.1,-1.35,15.9,1.08,.14);bronzeFace.rotation.x=-.12;
  box(src,srcBronze,-7.5,5.59,-3.15,16,.12,3.85);
  for(let x=-15.3;x<.4;x+=.15){const rib=box(src,srcShade,x,5.1,-1.25,.015,1.06,.025);rib.rotation.x=-.12;}
  for(const [x,w] of [[-12.2,2.5],[-8,3.1],[-3.55,3.7]]){box(src,srcDark,x,5.13,-1.16,w,.62,.035);for(let q=x-w/2;q<x+w/2;q+=.55)box(src,srcFrame,q,5.13,-1.12,.018,.62,.02);}
  // Silver canopy is a broad clipped rectangle with a shallow hip, not an oval.
  const canopy=softCorners([[.15,-4.2],[9,-4.2],[9.4,-.9],[.0,-.9]],.32);
  const canopyInner=centroidScaled(canopy,.86),silver=mat('srcCanopy','#989b93',{metalness:.3,roughness:.5});
  floor(src,srcDark,canopy,5.94,.09);
  const roofVerts=[],outer=close(canopy),inner=close(canopyInner);
  for(let i=0;i<outer.length-1;i++){
    const a=outer[i],b=outer[i+1],c=inner[i+1],d=inner[i];
    roofVerts.push(a[0],6.04,a[1],c[0],6.27,c[1],b[0],6.04,b[1],a[0],6.04,a[1],d[0],6.27,d[1],c[0],6.27,c[1]);
  }
  const roofGeo=new T.BufferGeometry();roofGeo.setAttribute('position',new T.Float32BufferAttribute(roofVerts,3));roofGeo.computeVertexNormals();mesh(src,roofGeo,silver);
  floor(src,silver,canopyInner,6.26,.02);
  for(const x of [.6,3,6,8.8])cylinder(src,srcWhite,x,5.55,-1.45,.085,.9);
  // Sparse planting leaves the facade and structural bays visible.
  for(const [x,z,w,y] of [[-9,-.2,6.5,4.1],[-3.5,.1,2,4.1],[15,-3.95,7,5.31]]) {
    box(src,srcWhite,x,y+.08,z,w,.16,.6);box(src,soil,x,y+.17,z,w-.1,.02,.5);
    for(let q=-w/2+.2;q<w/2;q+=.36)foliage(src,x+q,y+.33,z,.3,30);
  }
  // Forecourt follows the building; the lawn meets its front edge in one broad
  // surface. Avoid a detached pill-shaped lawn that exaggerates the toy effect.
  const court=softCorners([[-15.2,-4.8],[21,-4.8],[21,4.2],[8,6.4],[4.8,7.7],[-11.5,9.2],[-15.6,3.4]],.6);
  floor(src,paving,court,-.1,.12);
  const lawn=softCorners([[-14.9,9.3],[-4,8.7],[4.8,7.8],[8.8,6.5],[20.7,4.5],[21.5,11.5],[10,14.6],[-7,14.6],[-16.6,12.6]],1.4);
  const grass=mat('srcLawn','#718448',{transparent:true,depthWrite:false});grass.userData.skipHeightFog=true;
  // Fade just the turf boundary into the cloud sea, keeping the broad lawn legible.
  const lawnBoundary=[[-14.9,9.3],[-4,8.7],[4.8,7.8],[8.8,6.5],[20.7,4.5],[21.5,11.5],[10,14.6],[-7,14.6],[-16.6,12.6]];
  grass.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 turfPoint;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n turfPoint=position.xz;');
    shader.fragmentShader='varying vec2 turfPoint;\n'+shader.fragmentShader;
    const edges=lawnBoundary.map((a,i)=>{
      const b=lawnBoundary[(i+1)%lawnBoundary.length];
      return `{vec2 a=vec2(${a.map(n=>n.toFixed(3)).join(',')}),b=vec2(${b.map(n=>n.toFixed(3)).join(',')});vec2 e=b-a;float t=clamp(dot(turfPoint-a,e)/dot(e,e),0.0,1.0);edgeDistance=min(edgeDistance,length(turfPoint-a-e*t));}`;
    }).join('\n');
    shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
float edgeDistance=100.0;
${edges}
gl_FragColor.a*=smoothstep(0.0,1.3,edgeDistance)*0.88;`);
  };
  grass.customProgramCacheKey=()=> 'src-turf-boundary';
  floor(src,grass,lawn,-.14,.06);
  for(const [x,z,h,r] of [[-11.8,7.5,2.2,1],[-7,8.1,2.2,.95],[10,4.3,2.45,1],[13,3.9,2.65,1.2],[17,3.5,2.5,1.1]])tree(src,x,z,h,r);
  for(const [x,z,w] of [[-5.5,7.1,3.1],[2.4,6.1,2.8],[15,3.0,3]]) {
    box(src,srcWhite,x,.12,z,w,.24,.45);
    for(let q=-w/2+.2;q<w/2;q+=.35)foliage(src,x+q,.38,z,.32,28);
  }
  src.position.set(-2.8,0,-1.5);utown.scale.setScalar(.43);

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
  // Stair cores are recessed beside the entrance bar, not freestanding towers.
  for(const x of [-5.2,5.2]) {
    box(cde,mat('eaCore','#a7aaa5'),x,3.5,.5,.8,7,3.3);
    for(let y=2.8;y<6.8;y+=.86){const circle=cylinder(cde,dark,x,y,2.17,.09,.025);circle.rotation.x=Math.PI/2;}
  }
  for(const x of [-2.9,3.1])box(cde,concrete,x,7.84,-3,1,.48,1.4);
  for(let i=0;i<4;i++)beam(cde,steel,[-1+i*.35,7.6,1.8],[-1+i*.35,8.15+(i%2)*.25,1.8],.02);
  // Entry opening and low side walls frame the space-frame canopy.
  for(const x of [-4.4,4.4])box(cde,concrete,x,1.3,4.4,2.8,2.6,2.9);
  box(cde,glassDark,0,1.2,3.73,5.7,2.25,.035);
  for(let x=-2.65;x<2.8;x+=.44)box(cde,steel,x,1.2,3.76,.03,2.25,.025);
  sign(cde,'FACULTY OF ENGINEERING',0,1.95,3.78,3.8,'#d6d9ca');
  const eaSign=sign(cde,'ENGINEERING EA',1.55,2.48,4.63,2.35);eaSign.rotation.y=.565;
  const gold=mat('gold','#dbaa24',{metalness:.45,roughness:.38}),blue=mat('blue','#1c5363');
  for(const x of [-2.65,2.65])for(const z of [3.9,6.15])cylinder(cde,blue,x,1.63,z,.08,3.26);
  for(let x=-3;x<2.99;x+=.6)for(let z=3.8;z<6.2;z+=.6) {
    const v=[x+.3,2.92,z+.3];
    for(const [dx,dz] of [[0,0],[.6,0],[.6,.6],[0,.6]])beam(cde,gold,[x+dx,3.5,z+dz],v,.023);
    beam(cde,gold,[x,3.5,z],[x+.6,3.5,z],.026);beam(cde,gold,[x,3.5,z],[x,3.5,z+.6],.026);
    beam(cde,gold,v,[x+.9,2.92,z+.3],.023);
  }
  for(const z of [3.8,6.2])beam(cde,gold,[-3,3.5,z],[3,3.5,z],.04);
  for(let i=0;i<4;i++)box(cde,pale,0,.02+i*.07,6.6-i*.17,5.9,.07,.65);
  const bronze=mat('bronze','#4d4939',{metalness:.75,roughness:.4});
  const sculpture=new T.Group();sculpture.position.set(4.25,0,8.2);cde.add(sculpture);
  cylinder(sculpture,paving,0,.3,0,.92,.6);
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
  for(const [x,z] of [[-6,4.5],[6,-5],[-5.7,-7.8]])tree(cde,x,z,2.3,1.1);
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


  // Museum: the planted surface is a cut THROUGH A CORNER of the block.
  // At each level the diagonal clipping plane recedes into the rectangular shell.
  // This produces two perpendicular stone faces with curved edges, rather than a
  // green recess pasted onto one flat facade. Width/depth remain photo estimates.
  const museum=new T.Group();museum.name='Natural History Museum';
  const tex=document.createElement('canvas');tex.width=1024;tex.height=1024;
  const ctx=tex.getContext('2d');ctx.fillStyle='#55534e';ctx.fillRect(0,0,1024,1024);
  for(let row=0;row<100;row++){let x=-rand()*120;while(x<1024){const w=35+rand()*140,tone=102+Math.floor(rand()*35);ctx.fillStyle=`rgb(${tone},${tone},${tone-5})`;ctx.fillRect(x,row*10,w-2,8.5);x+=w;}}
  const stoneMap=new T.CanvasTexture(tex);stoneMap.colorSpace=T.SRGBColorSpace;stoneMap.wrapS=stoneMap.wrapT=T.RepeatWrapping;stoneMap.repeat.set(.25,.25);
  const stone=mat('stone','#c2bfb7',{map:stoneMap,bumpMap:stoneMap,bumpScale:.05,roughness:.94,side:T.DoubleSide});
  const clay=mat('clay','#ac6041',{side:T.DoubleSide}),clayLight=mat('clayLight','#c47c55',{side:T.DoubleSide});
  const cut=y=>6.7-3.6*Math.pow(Math.max(0,Math.min(1,(y-1)/5.65)),.55);
  const ends=y=>[[5,cut(y)-5],[cut(y)-4,4]];
  function quad(g,m,a,b,c,d) {
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    const uv=[];for(const p of [a,b,c,a,c,d])uv.push((p[0]+p[2])*.75,p[1]);geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return mesh(g,geo,m);
  }
  // Full rear walls and clipped roof shoulders.
  quad(museum,stone,[-5,0,-4],[5,0,-4],[5,6.6,-4],[-5,6.6,-4]);
  quad(museum,stone,[-5,0,4],[-5,0,-4],[-5,6.6,-4],[-5,6.6,4]);
  const steps=65;
  for(let i=0;i<steps;i++) {
    const y0=1+i/steps*5.65,y1=1+(i+1)/steps*5.65,a=ends(y0),b=ends(y1);
    quad(museum,stone,[5,y0,-4],[5,y0,a[0][1]],[5,y1,b[0][1]],[5,y1,-4]);
    quad(museum,stone,[-5,y0,4],[a[1][0],y0,4],[b[1][0],y1,4],[-5,y1,4]);
    // The ochre cut face inclines back into the corner as it rises.
    if(y0>.75)quad(museum,clay,[a[0][0]-.025,y0,a[0][1]-.025],[a[1][0]-.025,y0,a[1][1]-.025],[b[1][0]-.025,y1,b[1][1]-.025],[b[0][0]-.025,y1,b[0][1]-.025]);
  }
  quad(museum,stone,[5,0,-4],[5,0,4],[5,1,4],[5,1,-4]);
  quad(museum,stone,[-5,0,4],[5,0,4],[5,1,4],[-5,1,4]);
  const bottom=ends(1);floor(museum,stone,[bottom[0],[5,4],bottom[1]],.98,.02);
  const crown=ends(6.65);
  floor(museum,stone,[[-5,-4],[5,-4],crown[0],crown[1],[-5,4]],6.65,.12);
  // Folded planter bands lie across the diagonal cut, increasing in width up
  // the block. Their exposed geometry is visible from either original facade.
  for(let row=0;row<6;row++) {
    const y=1.05+row*.89,low=ends(y),high=ends(y+.64),n=2+Math.floor(row/2);
    for(let col=0;col<n;col++) {
      const t0=(col+.045)/n,t1=(col+.955)/n;
      const along=(e,t,yy,offset=.14)=>[e[0][0]+(e[1][0]-e[0][0])*t+offset,yy,e[0][1]+(e[1][1]-e[0][1])*t+offset];
      const a=along(low,t0+.035,y),b=along(low,t1-.035,y+.03),c=along(high,t1,y+.64),d=along(high,t0,y+.64);
      quad(museum,(row+col)%2?clay:clayLight,a,b,c,d);
      const soilOutline=[[c[0],c[2]],[d[0],d[2]],[d[0]-.38,d[2]-.38],[c[0]-.38,c[2]-.38]];
      floor(museum,soil,soilOutline,y+.65,.025);
      const count=5+row;
      for(let j=0;j<count;j++) {
        const t=(j+.5)/count,xx=d[0]+(c[0]-d[0])*t,zz=d[2]+(c[2]-d[2])*t;
        foliage(museum,xx,y+.77,zz,.23,40);
        if(j%3===0)for(let k=0;k<4;k++)foliage(museum,xx+.05,y+.58-k*.12,zz+.05,.14,20);
      }
      if((row+col)%3===0){const x=(c[0]+d[0])/2-.1,z=(c[2]+d[2])/2-.1;tree(museum,x,z,.8,.4,y+.66);}
    }
  }
  // The low stone corner remains below the beginning of the planted cut.
  for(let i=0;i<18;i++) {
    const x=-4.3+(i%6)*.5,y=2+Math.floor(i/6)*.6+(i%2)*.1;
    box(museum,dark,x,y,4.015,.16+(i%3)*.035,.13,.02);
  }
  for(let i=0;i<12;i++)box(museum,dark,-3.8+(i%6)*1.1,2.6+Math.floor(i/6)*.55,-4.015,.2,.16,.025);
  floor(museum,paving,[[-5.5,-4.5],[5.5,-4.5],[5.5,4.5],[-5.5,4.5]],-.13,.15);
  tree(museum,-5.4,-2,2.2,1);tree(museum,5.3,-2.8,2,1);
  museum.scale.setScalar(.95);

  // Batch repeated members after child transforms; top-level scale remains live.
  const shared=new Set([boxGeometry,cylinderGeometry,leafGeometry]);
  for(const root of [utown,cde,museum]) {
    root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),batches=new Map();
    root.traverse(o=>{if(!o.isMesh||!shared.has(o.geometry))return;const key=o.geometry.uuid+o.material.uuid+o.castShadow+o.receiveShadow;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
    for(const objects of batches.values()) {
      const batch=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);
      objects.forEach((o,i)=>{batch.setMatrixAt(i,inverse.clone().multiply(o.matrixWorld));o.removeFromParent();});batch.castShadow=objects[0].castShadow;batch.receiveShadow=objects[0].receiveShadow;root.add(batch);
    }
  }
  return [utown,cde,museum];
}
