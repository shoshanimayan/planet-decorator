import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



const timer = new THREE.Timer();
timer.connect(document);

let offsetDistance =0
let customScale= 0.25

const scene = new THREE.Scene();
scene.background= new THREE.Color("lightBlue")
const camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.z=5;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const controls = new OrbitControls(camera,renderer.domElement);

document.body.appendChild(renderer.domElement);

const onWindowResize=()=>{
  camera.aspect = window.innerWidth/ window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}

window.addEventListener('resize',onWindowResize);
const loader = new GLTFLoader();


const rockPath = "public/low-poly_rock.glb";
const treePath = "public/low_poly_tree.glb";
const bushPath = "public/bush_1_-_low_poly.glb"
let item = undefined



const rockGLB = (await loader.loadAsync(rockPath)).scene;
const treeGLB = (await loader.loadAsync(treePath)).scene;
const bushGLB = (await loader.loadAsync(bushPath)).scene;


const sphereGeometry = new THREE.SphereGeometry();
const material = new THREE.MeshBasicMaterial({color:'green'});



const planet = new THREE.Mesh(sphereGeometry,material);
planet.scale.setScalar(2);
scene.add(planet);



const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");

button1.addEventListener('click',(event)=>{
  event.stopPropagation();
  item = treeGLB;
  offsetDistance =0;
  customScale= 0.25;

})

button2.addEventListener('click',(event)=>{
    event.stopPropagation();

  item = rockGLB;
  offsetDistance =0;
  customScale= 0.0025;
})

button3.addEventListener('click',(event)=>{
    event.stopPropagation();
  item = bushGLB;
  offsetDistance =0;
  customScale= 0.001;
})


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const onClickDown=(event)=>{
  mouse.x= (event.clientX/window.innerWidth)*2-1
  mouse.y= -(event.clientY/window.innerHeight)*2+1

  
}

const onClickUp=(event)=>{
  if(mouse.x== (event.clientX/window.innerWidth)*2-1&&
  mouse.y== -(event.clientY/window.innerHeight)*2+1){

  raycaster.setFromCamera(mouse,camera);
  const instersections = raycaster.intersectObject(planet);
  if(instersections.length>0)
  {
    const intersection = instersections[0];
    const normal = intersection.face.normal.clone();
    const rayDir = raycaster.ray.direction;
    normal.transformDirection(intersection.object.matrixWorld);
    if(item==undefined)
    {
      item= treeGLB;
    }
    placeObject(item,intersection.point,normal,rayDir);
  }
  }
}

const placeObject=(toPlace,position,normal,rayDir)=>{

  console.log(toPlace)
  console.log(customScale)
  const placed = toPlace.clone();
  const y = normal.normalize();
  placed.position.copy(position.clone().addScaledVector(y,offsetDistance));
  const x= new THREE.Vector3().crossVectors(y,rayDir).normalize();
  const z= new THREE.Vector3().crossVectors(x,y).normalize();
  const euler = new THREE.Matrix4().makeBasis(x,y,z);
  placed.quaternion.setFromRotationMatrix(euler);
  placed.scale.setScalar(customScale);
  scene.add(placed);

}

renderer.domElement.addEventListener('mousedown', onClickDown);

renderer.domElement.addEventListener('mouseup', onClickUp);


const animate=()=>{

  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}

const light = new THREE.AmbientLight( 0x404040,10 ); // soft white light
scene.add( light );

animate();








