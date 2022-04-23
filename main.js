window.onload = function() {
    startRender();
}
let capturer, canvas, canvasOverlay, ctx, frame = 0, objectFrame = 0, objectIndex, renderer, scene, camera, loadedObject, capturing = false;

const objectLength = 240; //In frames

const objects = [
    {
        obj: "", //Link to the obj file: This can be on any file hosting website
        mtl: "", //Link to the mtl file: This can be on any file hosting website
        name: "", //Name of the object
    }
];

let anglesFrom = [140, -10, 130];
let anglesTo = [-140, 10, -130];

function startRender() {
    canvas = document.getElementById("canvas");
    capturer = new CCapture( {
        format: "webm",
        framerate: 60,
        verbose: false
    } );

    canvasOverlay = document.getElementById("canvasOverlay");
    ctx = canvasOverlay.getContext("2d");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const light2 = new THREE.DirectionalLight(color, intensity);
    light2.position.set(1, -2, -4);
    scene.add(light2);

    objectIndex = 0;

    loadNextObject(true);
    
    camera.position.z = 0.2;
}
function renderFrame() {
    frame++;
    if(frame > objectLength * objects.length) {
        stopAnimation();
        return;
    }
    objectFrame++;
    if(objectFrame > objectLength) {
        objectIndex++;
        loadNextObject(false);
        return;
    }

    let bezierAmount = objectIndex % 2 === 0 ? objectFrame / objectLength : 1 - objectFrame / objectLength;

    // loadedObject.rotation.x = easeBezier(bezierAmount);
    // loadedObject.rotation.y = easeBezier(bezierAmount);
    
    loadedObject.rotation.x = lerp(degreesToRadians(anglesFrom[0]), degreesToRadians(anglesTo[0]), easeBezier(bezierAmount));
    loadedObject.rotation.y = lerp(degreesToRadians(anglesFrom[1]), degreesToRadians(anglesTo[1]), easeBezier(bezierAmount));
    loadedObject.rotation.z = lerp(degreesToRadians(anglesFrom[2]), degreesToRadians(anglesTo[2]), easeBezier(bezierAmount));
    
    renderer.render( scene, camera );

    ctx.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
    ctx.font = "15px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`${objectIndex + 1}/${objects.length} - ${objectFrame}/${objectLength} - ${Math.floor(objectFrame / objectLength * 100)}%`, 10, 20);
    ctx.fillText(`${frame}/${objectLength * objects.length} - ${Math.floor(frame / (objectLength * objects.length) * 100)}%`, 10, 40);
    ctx.fillText(`${objects[objectIndex].name}`, 10, 60);
    
    if(capturing) capturer.capture(canvas);
    requestAnimationFrame(renderFrame);
}

function loadNextObject(firstTime) {
    objectFrame = 0;

    capturing = false;

    if(loadedObject) {
        scene.remove(loadedObject);
    }

    var mtlLoader = new THREE.MTLLoader();

    mtlLoader.load( objects[objectIndex].mtl, function( materials ) {
        
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.load( objects[objectIndex].obj, function ( object ) {
            scene.add( object );

            loadedObject = object;

            capturing = true;
            renderFrame();
            if(firstTime) capturer.start();
        });

    });
}

function stopAnimation() {
    capturer.stop();
    capturer.save();
}

const easeBezier = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const lerp = (a, b, t) => a + (b - a) * t;

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}