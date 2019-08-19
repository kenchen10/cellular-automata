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

var SymmCA = function() {
  this.zeros = [];
  this.ones = [];
  this.udSymmOn = false;
  this.lrSymmOn = true;
  this.dSymmOn = false;
  this.d = {};
  this.neighborhood = [[1,1,1],
                  [1,0,1],
                  [1,1,1]];
  this.rule = [];

  this.generateRule = function(symm) {
    // symm is 0 (LR), 1 (UD), 2 (D)
    this.rule = new Array(2 ** 8 - 1).fill(2);;
    let num_ones = 15;
    let num_single = parseInt(Math.random() * 8);
    let num_zeros = 15;
    for (let i = 0; i < num_ones; i++) {
      let idx = parseInt(Math.random() * this.rule.length);
      while (this.rule[idx] != 2) {
        idx = parseInt(Math.random() * this.rule.length);
      }
      this.rule[idx] = 1;
      this.rule[this.d[idx][symm]] = 1;
      if (this.d[idx][symm] != idx) {
        let pair = [idx, this.d[idx][symm]];
        if (!this.containsSame(this.ones,pair)) {
          this.ones.push(idx);
          this.ones.push(this.d[idx][symm]);
        }
      } else {
        if (!this.containsSame(this.ones,[idx])) {
          this.ones.push(idx);
        }
      }
    }
    for (let i = 0; i < num_single; i++) {
      idx = 2 ** (9 - num_single - 1);
      this.rule[idx] = 1;
      this.rule[this.d[idx][symm]] = 1;
      if (this.d[idx][symm] != idx) {
        let pair = [idx, this.d[idx][symm]];
        if (!this.containsSame(this.ones,pair)) {
          this.ones.push(idx);
          this.ones.push(this.d[idx][symm]);
        }
      } else {
        if (!this.containsSame(this.ones,[idx])) {
          this.ones.push(idx)
        }
      }
    }
    for (let i = 0; i < num_zeros; i++) {
      let idx = parseInt(Math.random() * this.rule.length);
      while (this.rule[idx] != 2) {
        idx = parseInt(Math.random() * this.rule.length);
      }
      this.rule[idx] = 0;
      this.rule[this.d[idx][symm]] = 0;
      if (this.d[idx][symm] != idx) {
        this.zeros.push(idx);
        this.zeros.push(this.d[idx][symm]);
      } else {
        this.zeros.push(idx);
      }
    }
  }

  this.containsSame = function(arr, v) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == v[i]) {
        return true;
      }
    }
    return false;
  }

  this.arraysEqual = function(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
  }

  this.getSymms = function() {
    this.d = {}
    let neighborSize = 8;
    for (let i = 0; i < 256; i++) {
      let binaryCode = (i >>> 0).toString(2);
      while (binaryCode.length < neighborSize) {
        binaryCode = '0' + binaryCode;
      }
      let matrix = [[0,0,0],[0,0,0],[0,0,0]];
      let counter = 0
      for (let nc = 0; nc < this.neighborhood.length; nc++) {
        let r = [];
        for (let nr = 0; nr < this.neighborhood[0].length; nr++) {
          if (this.neighborhood[nc][nr] == 1) {
            matrix[nr][nc] = parseInt(binaryCode[neighborSize - counter - 1]);
            counter += 1;
          }
          else {
            matrix[nr][nc] = 0;
          }
        }
      }
      let new_m_lr = this.countPatternIndex(this.makeLR(matrix));
      let new_m_ud = this.countPatternIndex(this.makeUD(matrix));
      let new_m_diag = this.countPatternIndex(this.makeDiag(matrix));
      let symm_arr = [new_m_lr, new_m_ud, new_m_diag];
      this.d[i] = symm_arr;
    }
    return this.d;
  };

  this.countPatternIndex = function(matrix) {
  let cellNeighbors = [];
  let new_neighborhood = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < this.neighborhood.length; i++) {
      for (let j = 0; j < this.neighborhood.length; j++) {
        new_neighborhood[j][i] = this.neighborhood[i][j];
      }
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (new_neighborhood[j][i] == 1){
          if (matrix[j][i]==1) {
            cellNeighbors.push(1);
          } else {
            cellNeighbors.push(0);
          }
        }
      }
    }
    let idx = 0;
    for (let i = 0; i < cellNeighbors.length; i++) {
      idx += 2**i * cellNeighbors[i];
    }
    return idx;
  }

  this.makeDiag = function(matrix) {
    let new_m = [[0,0,0],
                 [0,0,0],
                 [0,0,0]];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
          new_m[i][j] = matrix[matrix[0].length - 1 - j][matrix[0].length - 1 - i];
        }
    }
    return new_m;
  }

  this.makeLR = function(matrix) {
    let new_m = [[0,0,0],
                 [0,0,0],
                 [0,0,0]];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
          new_m[i][j] = matrix[i][matrix[0].length - 1 - j];
        }
    }
    return new_m;
  }

  this.makeUD = function(matrix) {
    let new_m = [[0,0,0],
                 [0,0,0],
                 [0,0,0]];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
          new_m[i][j] = matrix[matrix[0].length - 1 - i][j]
        }
    }
    return new_m;
  }
};

var CyclicCA = function() {
  this.r = 1;
  this.t = 3;
  this.c = 3;
  this.on = true;
  this.moore = false;

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
    // uniforms.u_currentTexture.value = rtFront.texture;
    // uniforms.needsUpdate = true;
    // material.fragmentShader = document.getElementById( current_ca ).textContent;
    // material.fragmentShader.needsUpdate = true;
  }

  this.randomRule = function() {
    this.r = Math.random() * 20;
    this.c = Math.random() * 20;
    this.t = Math.random() * 20;
    uniforms.u_r.value = this.r;
    uniforms.u_c.value = this.c;
    uniforms.u_t.value = this.t;
    this.resetCA();
  }

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
g.add(ruleCA, "pause");
var ruleFolder = g.addFolder("Rule");
ruleFolder.add(ruleCA, "randomRule");
var cyclicCA = new CyclicCA();
var cyclicFolder = g.addFolder("Cyclic");
cyclicFolder.add(cyclicCA, "r", 1, 5).step(1);
cyclicFolder.add(cyclicCA, "t", 1, 23).step(1);
cyclicFolder.add(cyclicCA, "c", 1, 14).step(1);
cyclicFolder.add(cyclicCA, "resetCA");
cyclicFolder.add(cyclicCA, "moore");
var symmCA = new SymmCA();
symmCA.getSymms();
symmCA.generateRule(0);
// -----------------------------------------------------------------------------
init();
loop();


function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( width ,height );
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
    // u_currentTexture: { type: "t", value: rtFront.texture },
    u_currentTexture: { type: "t", value: rtFront },
    u_mouse: { type: "v3", value: new THREE.Vector3() },
    u_frameCount: { type: "i", value: -1. },
    u_w: { value: width },
    u_h: { value: height },
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
    u_zeros: { value: symmCA.zeros },
    u_ones: { value: symmCA.ones },
    u_moore: { value: cyclicCA.moore },
    u_time: { value: performance.now() },
    u_paused: {type: 'i', value: 1},
  };

  material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    // fragmentShader: document.getElementById( 'rule_ca' ).textContent
    fragmentShader: document.getElementById( current_ca ).textContent,
    vertexShader: document.getElementById( "vertexShader" ).textContent
  } );


  material.fragmentShader.needsUpdate = true;

  let mesh = new THREE.Mesh( geometry, material );

  // new THREE.TextureLoader().load("textures/pie.jpg", function(texture) {
  //   texture.minFilter = THREE.LinearFilter;
  //   mesh.material.uniforms.u_currentTexture.value = texture;
  //   rtFront.texture = texture;
  //   mesh.material.needsUpdate = true;
  // });
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
  uniforms.u_frameCount.value = 0;
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
  uniforms.u_r.value = cyclicCA.r;
  uniforms.u_t.value = cyclicCA.t;
  uniforms.u_c.value = cyclicCA.c;
  uniforms.u_moore.value = cyclicCA.moore;
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
