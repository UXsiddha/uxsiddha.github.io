(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,97678,e=>{"use strict";var t=e.i(43476),r=e.i(71645),i=e.i(90775),n=e.i(36298);let a=`#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,u=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution, uMouse, uTrack;
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
`,o=`${u}
uniform float uRadius, uFalloff, uSkew, uAngle;
uniform vec3 uShade, uClear;
uniform vec2 uPos;
void main() {
  vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 sk = vec2(uSkew, 1.0 - uSkew);
  float hr = uRadius * 0.5;
  mat2 r = rot(uAngle * 6.28318530718);
  vec2 pos = uPos + (uMouse - 0.5) * 0.15 * uTrack;
  float d = distance(vUv * ar * r * sk, pos * ar * r * sk);
  fragColor = mix(vec4(uClear, 0.0), vec4(uShade, 1.0), smoothstep(hr - uFalloff * hr * 0.5, hr + uFalloff * hr * 0.5, d));
}`,l=`${u}
uniform sampler2D tInput;
uniform float uFrequency, uAmplitude, uRotation, uTime, uMix;
void main() {
  vec2 wc = vUv * 2.0 - 1.0;
  float t = uTime * 0.25;
  float freq = 20.0 * uFrequency;
  float amp = uAmplitude * 0.2;
  vec2 wave = vec2(0.5) + (uMouse - 0.5) * 0.3 * uTrack;
  float wX = sin((wc.y + wave.y) * freq + t * 1.04709283144) * amp;
  float wY = sin((wc.x - wave.x) * freq + t * 1.04709283144) * amp;
  wc += vec2(mix(wX, 0.0, uRotation), mix(0.0, wY, uRotation));
  float ar = uResolution.x / uResolution.y;
  vec2 m = vec2(0.5) + (uMouse - 0.5) * uTrack;
  float d = max(0.0, 1.0 - distance(vUv * vec2(ar, 1.0), m * vec2(ar, 1.0)) * 4.0 * (1.0 - uMix));
  fragColor = texture(tInput, mix(vUv, wc * 0.5 + 0.5, d));
}`,f=`${u}
uniform sampler2D tInput;
uniform float uAmount, uSpread, uAngle, uTime, uSkew, uMix;
vec2 rand2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
void main() {
  float ar = uResolution.x / uResolution.y;
  vec2 sk = mix(vec2(1.0), vec2(1.0, 0.0), uSkew);
  vec2 st = (vUv - 0.5) * vec2(ar, 1.0) * 50.0 * uAmount;
  st = st * rot(uAngle * 6.28318530718) * sk;
  vec2 cell = floor(st), f = fract(st);
  float best = 15.0; vec2 pick = vec2(0.0);
  for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 nb = vec2(float(i), float(j));
      vec2 pt = 0.5 + 0.5 * sin(5.0 + uTime * 0.2 + 6.2831 * rand2(cell + nb));
      float d = length(nb + pt - f);
      if (d < best) { best = d; pick = pt; }
    }
  vec2 offset = pick * 0.4 * uSpread - uSpread * 0.2;
  vec2 m = vec2(0.5) + (uMouse - 0.5) * uTrack;
  float d = max(0.0, 1.0 - distance(vUv * vec2(ar, 1.0), m * vec2(ar, 1.0)) * 4.0 * (1.0 - uMix));
  fragColor = texture(tInput, vUv + offset * d);
}`,c=`${u}
uniform sampler2D tInput, tNoise;
uniform float uAmount, uTilt;
uniform vec2 uNoiseRes;
vec2 spiral(float theta, inout float r) { r += 1.0 / r; return (r - 1.0) * vec2(cos(theta), sin(theta)); }
void main() {
  float ar = uResolution.x / uResolution.y;
  // 64 taps reach further out along the spiral than the reference's 24; scaled back to the same blur radius (6.17 / 10.48)
  vec2 px = vec2(1.0 / ar, 1.0) * 0.006 * 0.588 * uAmount;
  float ang = 0.0;
  mat2 turn = rot(ang);
  float r = 1.0;
  vec3 accC = vec3(0.0), accW = vec3(0.0); float accA = 0.0;
  for (float j = 0.0; j < 2.39996323 * 64.0; j += 2.39996323) {
    vec2 off = spiral(j, r) * px;
    off *= 1.0 + 0.05 * (sin(j * 0.1) * 0.5 + 0.5) * sin(j * 0.7 + ang);
    vec4 c = texture(tInput, vUv + turn * off);
    vec3 w = vec3(5.0) + pow(c.rgb, vec3(9.0)) * 150.0;
    accA += c.a; accC += c.rgb * w; accW += w;
  }
  fragColor = vec4(accC / accW, accA / 64.0);
}`,s=`${u}
uniform sampler2D tInput;
uniform vec3 uBg, uLight;
uniform float uBlendLight, uBlendDark, uLift;
void main() {
  vec4 fx = texture(tInput, vUv);
  vec3 effect = mix(uLight, fx.rgb, fx.a);
  vec3 lit = mix(uBg, uBg * effect, mix(uBlendLight, uBlendDark, fx.a));
  // on a dark ground a multiply alone cannot show light: add a faint glow where the light falls
  fragColor = vec4(lit + uLight * (1.0 - fx.a) * uLift, 1.0);
}`,d=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)/255),m=()=>{let e=i.field[n.themeStore.get()];return{ground:d(e.ground),shade:d(e.shade),light:d(e.light),blendLight:e.blendLight,blendDark:e.blendDark,lift:e.lift,speed:e.speed,wander:e.wander}};e.s(["LightField",0,function(){let e=(0,r.useRef)(null);(0,r.useEffect)(()=>{let e=()=>{},t=window.setTimeout(()=>e=i()??e,1600);return()=>{window.clearTimeout(t),e()}},[]);let i=()=>{let t=e.current;if(!t)return;let r=t.getContext("webgl2",{antialias:!1,alpha:!1});if(!r)return;let i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,u=!!r.getExtension("EXT_color_buffer_float");r.getExtension("OES_texture_float_linear");let d=r.createVertexArray();r.bindVertexArray(d),r.bindBuffer(r.ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),r.STATIC_DRAW),r.enableVertexAttribArray(0),r.vertexAttribPointer(0,2,r.FLOAT,!1,0,0);let v=e=>{let t=r.createProgram();for(let[i,n]of[[r.VERTEX_SHADER,a],[r.FRAGMENT_SHADER,e]]){let e=r.createShader(i);r.shaderSource(e,n),r.compileShader(e),r.attachShader(t,e)}r.linkProgram(t);let i=new Proxy({},{get:(e,i)=>i in e?e[i]:e[i]=r.getUniformLocation(t,i)});return{p:t,u:i}},h=v(o),T=v(l),E=v(f),g=v(c),R=v(s);if(!r.getProgramParameter(R.p,r.LINK_STATUS))return;let A=new Uint8Array(262144).map((e,t)=>t%4==3?255:255*Math.random()|0),w=r.createTexture();for(let[e,t]of(r.bindTexture(r.TEXTURE_2D,w),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,256,256,0,r.RGBA,r.UNSIGNED_BYTE,A),[[r.TEXTURE_MIN_FILTER,r.NEAREST],[r.TEXTURE_MAG_FILTER,r.NEAREST],[r.TEXTURE_WRAP_S,r.REPEAT],[r.TEXTURE_WRAP_T,r.REPEAT]]))r.texParameteri(r.TEXTURE_2D,e,t);let x=0,p=0,b=null,F=null,_=()=>{let e=r.createTexture();for(let[t,i]of(r.bindTexture(r.TEXTURE_2D,e),u?r.texImage2D(r.TEXTURE_2D,0,r.RGBA16F,x,p,0,r.RGBA,r.HALF_FLOAT,null):r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,x,p,0,r.RGBA,r.UNSIGNED_BYTE,null),[[r.TEXTURE_MIN_FILTER,r.LINEAR],[r.TEXTURE_MAG_FILTER,r.LINEAR],[r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE],[r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE]]))r.texParameteri(r.TEXTURE_2D,t,i);let t=r.createFramebuffer();return r.bindFramebuffer(r.FRAMEBUFFER,t),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,e,0),r.bindFramebuffer(r.FRAMEBUFFER,null),{fbo:t,tex:e}},U=()=>{for(let e of(x=Math.floor(window.innerWidth),p=Math.floor(window.innerHeight),t.width=x,t.height=p,[b,F]))e&&(r.deleteFramebuffer(e.fbo),r.deleteTexture(e.tex));b=_(),F=_(),B=!0},D={x:.5,y:.5,here:!1},L={x:0,y:0,lastX:.5,lastY:.5},S=1e4*Math.random(),y=m(),k=[...y.ground],B=!0,M=0,I=n.themeStore.subscribe(()=>B=!0),X=S,P=0,C=e=>{M=requestAnimationFrame(C);let n=m(),a=!1,u=(e,t)=>i||5e-4>Math.abs(t-e)?t:(a=!0,e+(t-e)*.03);for(let e of["shade","light"])for(let t=0;t<3;t++)y[e][t]=u(y[e][t],n[e][t]);y.blendLight=u(y.blendLight,n.blendLight),y.blendDark=u(y.blendDark,n.blendDark),y.lift=u(y.lift,n.lift),y.speed=u(y.speed,n.speed),y.wander=u(y.wander,n.wander);for(let e=0;e<3;e++)k[e]=u(k[e],n.ground[e]);if(i&&!B)return;B=a;let o=P?Math.min(.1,(e-P)*.001):0;P=e,i||(X+=o*y.speed),L.x=.89*L.x+(D.x-L.lastX)*.2,L.y=.89*L.y+(D.y-L.lastY)*.2,L.lastX=D.x,L.lastY=D.y,D.here||(D.x+=(.5-D.x)*.02,D.y+=(.5-D.y)*.02);let l=i?.5:D.x+L.x,f=i?.5:D.y+L.y,c=b,s=F,v=(e,t,i=!1)=>{r.bindFramebuffer(r.FRAMEBUFFER,i?null:s.fbo),r.viewport(0,0,x,p),i||(r.clearColor(k[0],k[1],k[2],0),r.clear(r.COLOR_BUFFER_BIT)),r.useProgram(e.p),r.uniform2f(e.u.uResolution,x,p),r.uniform2f(e.u.uMouse,l,f),r.uniform2f(e.u.uTrack,.56,.46),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,c.tex),r.uniform1i(e.u.tInput,0),t(e.u),r.bindVertexArray(d),r.drawArrays(r.TRIANGLES,0,6),[c,s]=[s,c]};v(h,e=>{r.uniform1f(e.uRadius,.28),r.uniform1f(e.uFalloff,1.26),r.uniform1f(e.uSkew,1),r.uniform1f(e.uAngle,0),r.uniform3fv(e.uShade,y.shade),r.uniform3fv(e.uClear,k),r.uniform2f(e.uPos,.603+.1*y.wander*Math.sin(.11*X),.38+.07*y.wander*Math.cos(.083*X))}),v(T,e=>{r.uniform1f(e.uFrequency,.22),r.uniform1f(e.uAmplitude,1.18),r.uniform1f(e.uRotation,0),r.uniform1f(e.uTime,X),r.uniform1f(e.uMix,1)}),v(E,e=>{r.uniform1f(e.uAmount,.52),r.uniform1f(e.uSpread,1.06),r.uniform1f(e.uAngle,44/360),r.uniform1f(e.uTime,X),r.uniform1f(e.uSkew,.84),r.uniform1f(e.uMix,1)}),v(g,e=>{r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,w),r.uniform1i(e.tNoise,1),r.uniform1f(e.uAmount,.6),r.uniform1f(e.uTilt,.5),r.uniform2f(e.uNoiseRes,256,256)}),v(R,e=>{r.uniform3fv(e.uBg,k),r.uniform3fv(e.uLight,y.light),r.uniform1f(e.uBlendLight,y.blendLight),r.uniform1f(e.uBlendDark,y.blendDark),r.uniform1f(e.uLift,y.lift)},!0),t.dataset.ready||(t.dataset.ready="1")},N=e=>{D.x=e.clientX/window.innerWidth,D.y=e.clientY/window.innerHeight,D.here=!0},j=()=>D.here=!1,G=()=>{cancelAnimationFrame(M),document.hidden||(M=requestAnimationFrame(C))};return U(),M=requestAnimationFrame(C),window.addEventListener("resize",U),window.addEventListener("mousemove",N,{passive:!0}),document.addEventListener("mouseleave",j),document.addEventListener("visibilitychange",G),()=>{cancelAnimationFrame(M),I(),window.removeEventListener("resize",U),window.removeEventListener("mousemove",N),document.removeEventListener("mouseleave",j),document.removeEventListener("visibilitychange",G)}};return(0,t.jsx)("canvas",{ref:e,"aria-hidden":!0,className:"lf-light"})}])},64349,e=>{"use strict";e.s(["LAND",0,15,"TARGETS",0,["windmill","farm","duck","houseA","houseB","houseC","fountain","cafe","fire","cat","chest","block","car","me"],"cityCentre",0,e=>11*(e<700),"cityScale",0,e=>e<700?e/30:e/53])},67468,e=>{e.v(t=>Promise.all(["static/chunks/3u53s97ov54c6.js","static/chunks/32y-w3jxbmwii.js"].map(t=>e.l(t))).then(()=>t(49867)))},36298,90775,e=>{"use strict";let t="siddha-theme";function r(e=new Date){let t=new Date(e);t.setMinutes(0,0,0);let i=e.getHours();return i<6?t.setHours(6):i<18?t.setHours(18):(t.setDate(t.getDate()+1),t.setHours(6)),t.getTime()}function i(e,t=new Date){let[r,n]=(e??"").split("|");return("dark"===r||"light"===r)&&Number(n)>t.getTime()?r:function(e=new Date){let t=e.getHours();return t>=18||t<6?"dark":"light"}(t)}JSON.stringify(t),e.s(["THEME_KEY",0,t,"field",0,{light:{ground:"#FFFFFF",shade:"#B4B2B0",light:"#FFFDF8",blendLight:.05,blendDark:.24,lift:0,speed:2.4,wander:1},dark:{ground:"#66718F",shade:"#080811",light:"#A9B0C7",blendLight:.87,blendDark:.87,lift:0,speed:.95,wander:0}},"nextSwitch",0,r,"resolveTheme",0,i],90775);let n="light",a=new Set,u=!1;function o(e){let t=e!==n;n=e;let r=document.documentElement;r.dataset.theme=e,r.style.colorScheme=e,t&&a.forEach(e=>e())}function l(){if(u)return;u=!0;let e=()=>o(i(function(){try{return localStorage.getItem(t)}catch{return null}}()));e(),window.setInterval(e,6e4),document.addEventListener("visibilitychange",()=>!document.hidden&&e())}e.s(["themeStore",0,{subscribe:e=>(l(),a.add(e),()=>a.delete(e)),get:()=>n,getServer:()=>"light",set(e){l();try{localStorage.setItem(t,`${e}|${r()}`)}catch{}o(e)}}],36298)}]);