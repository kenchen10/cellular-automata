let width = window.innerWidth;
let height = window.innerHeight;
//let rule = [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1];
let current_ca = "cyclic_ca";
let material;

// LIFE PARAMETERS
let life_on = false;
let survive = [2,3];
let surviveLength = 2;
let born = [3];
let bornLength = 1;
// RULE PARAMETERS

let camera = new THREE.OrthographicCamera();
let mouseposition = {
  x: 0,
  y: 0
};

var CyclicCA = function() {
  this.r = 2;
  this.t = 5;
  this.c = 8;
  this.on = true;
  this.moore = true;
}

var RuleCA = function() {
  this.rule = [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1];
  this.on = true;

  this.pause = function() {
    uniforms.u_paused.value *= -1;
  }

  this.generateRule = function() {
    ruleNum = 0;
    for (let i = 0; i < 16; i++) {
      let r = Math.random();
      if (r < 0.5) {
        this.rule[i] = 0;
      } else {
        this.rule[i] = 1;
        ruleNum += 2 ** i;
      }
    }
    if (this.rule[0] == 1 && this.rule[this.rule.length - 1] == 0) {
      this.generateRule();
    }
  }

  this.randomRule = function() {
    this.generateRule();
    uniforms.u_rule.value = this.rule;
    this.resetCA();
  }

  this.resetCA = function() {
    uniforms.u_frameCount.value = 0;

    let parameters = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    };

    rtFront = new THREE.WebGLRenderTarget(width, height, parameters);
    rtBack = new THREE.WebGLRenderTarget(width, height, parameters);
  }

}

// -----------------------------------------------------------------------------
// GUI

var g = new dat.GUI();
var ruleCA = new RuleCA();
var ruleFolder = g.addFolder("Rule");
ruleFolder.add(ruleCA, "randomRule");
ruleFolder.add(ruleCA, "pause");
var cyclicCA = new CyclicCA();
var cyclicFolder = g.addFolder("Cyclic");

// -----------------------------------------------------------------------------

init();
loop();


function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( width, height );
  document.body.appendChild(renderer.domElement);
  camera.position.z = 1;
  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry(2, 2);

  //setup renderTargets
  let parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false
  };

  rtFront = new THREE.WebGLRenderTarget(width, height, parameters);
  rtBack = new THREE.WebGLRenderTarget(width, height, parameters);


  //setup shaderMaterials
  uniforms = {
    u_rule: { value: ruleCA.rule },
    u_resolution: { type: "v2", value: new THREE.Vector2(width, height) },
    u_currentTexture: { type: "t", value: rtFront.texture},
    u_mouse: { type: "v3", value: new THREE.Vector3() },
    u_frameCount: { type: "i", value: -1. },
    // u_mouseSize: { type: "f", value: ControlPanel.cursorSize},
    // u_newLifeColor: {type: "v3", value: ControlPanel.NewLifeColor},
    // u_survivorColor: {type: "v3", value: ControlPanel.SurvivorColor},
    // u_born: { value: born },
    // u_bornLength: { value: bornLength },
    // u_survive: { value: survive },
    // u_surviveLength: { value: surviveLength },
    u_r: { value: cyclicCA.r },
    u_t: { value: cyclicCA.t },
    u_c: { value: cyclicCA.c },
    u_moore: { value: cyclicCA.moore },
    u_time: { value: performance.now() },
    u_paused: {type: 'i', value: 1}
  };

  material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    // fragmentShader: document.getElementById( 'rule_ca' ).textContent
    fragmentShader: document.getElementById( current_ca ).textContent
  } );

  material.fragmentShader.needsUpdate = true;

  let mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'pointermove', onPointerMove, false );
}

function onPointerMove(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let ratio = height / width;
  if(height > width) {
    mouseposition.x = (event.pageX - width / 2) / width;
    mouseposition.y = (event.pageY - height / 2) / height * -1 * ratio;
  } else {
    mouseposition.x = (event.pageX - width / 2) / width / ratio;
    mouseposition.y = (event.pageY - height / 2) / height * -1;
  }
  window.addEventListener('pointerdown', ()=> {
    uniforms.u_mouse.value.z = 1;
  });
  window.addEventListener('pointerup', ()=> {
    uniforms.u_mouse.value.z = 0;
  });

  event.preventDefault();
}

function onWindowResize( event ) {

  let width = window.innerWidth;
  let height = window.innerHeight;

  renderer.setSize( width, height );
  uniforms.u_resolution.value.x = width;
  uniforms.u_resolution.value.y = height;
  uniforms.u_mouse.value = new THREE.Vector3();
  // gui.width = window.innerWidth/4;

  let parameters = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false
  };

  rtFront = new THREE.WebGLRenderTarget(width, height, parameters);
  rtBack = new THREE.WebGLRenderTarget(width, height, parameters);

  // ControlPanel.RuleString = rule.join("");
}

function loop() {
  requestAnimationFrame( loop );
  render();
}


function stepBuffer() {

  uniforms.u_currentTexture.value = rtBack.texture;

  renderer.render( scene, camera, rtFront, true );

  let buffer = rtFront
  rtFront = rtBack;
  rtBack = buffer;

  uniforms.u_currentTexture.value = rtFront.texture;
}

function render() {
  //update uniforms
  uniforms.u_frameCount.value++;
  uniforms.u_mouse.value.x += ( mouseposition.x - uniforms.u_mouse.value.x );
  uniforms.u_mouse.value.y += ( mouseposition.y - uniforms.u_mouse.value.y );
  uniforms.u_time.value = performance.now();
  // uniforms.u_mouseSize.value = ControlPanel.Size;
  //update colors
  // uniforms.u_newLifeColor.value = ControlPanel.NewLifeColor;
  // uniforms.u_survivorColor.value = ControlPanel.SurvivorColor;
  renderer.render( scene, camera );
  stepBuffer();
}

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS

function generateRule() {
  ruleNum = 0;
  for (let i = 0; i < 16; i++) {
    let r = Math.random();
    if (r < 0.5) {
      rule[i] = 0;
    } else {
      rule[i] = 1;
      ruleNum += 2 ** i;
    }
  }
  if (rule[0] == 1 && rule[rule.length - 1] == 0) {
    generateRule();
  }
}

function generateLifeRule() {
  let numBorn = Math.floor(Math.random() * 9) + 1;
  let numSurvive = Math.floor(Math.random() * 9) + 1;
  born = [];
  survive = [];
  console.log(numBorn, numSurvive);
  let eight = [0,1,2,3,4,5,6,7,8];
  for (let i = 0; i < numBorn; i++) {
    var rand = eight[Math.floor(Math.random() * 2)];
    if (rand == 1) {
      born.push(i);
    }
  }
  for (let i = 0; i < numSurvive; i++) {
    var rand = eight[Math.floor(Math.random() * 2)];
    if (rand == 1) {
      survive.push(i);
    }
  }
  if (survive.length == 0 || born.length == 0) {
    generateLifeRule();
  }
}

function randomRule() {
  if (rule_on) {
    generateRule();
    uniforms.u_rule.value = rule;
  } else if (life_on) {
    generateLifeRule();
    console.log(born, survive, born.length, survive.length);
    uniforms.u_born.value = born;
    uniforms.u_survive.value = survive;
    uniforms.u_bornLength = born.length;
    uniforms.u_surviveLength = survive.length;
  }

  resetCA();
  reInit();
}

function reInit() {
  if (life_on) {
    current_ca = "life_ca";
  } else if (rule_on) {
    current_ca = "rule_ca";
  }
  material.fragmentShader = document.getElementById( current_ca ).textContent;
  material.needsUpdate = true;
}

function resetCA() {
  uniforms.u_frameCount.value = 0;

  let parameters = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false
  };

  rtFront = new THREE.WebGLRenderTarget(width, height, parameters);
  rtBack = new THREE.WebGLRenderTarget(width, height, parameters);
}

function getRuleFromBinary(idx) {
  // let neighborSize = Math.log2(rule.length);
  let binaryCode = (idx >>> 0).toString(2);
  while (binaryCode.length < rule.length) {
    binaryCode = '0' + binaryCode;
  }

  rule = binaryCode.split('').map(Number);
  uniforms.u_rule.value = rule.reverse();
  resetCA();
}
