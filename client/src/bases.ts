/*
 * These add helper methods for spawning base plates for scenes, like grass or ocean
 */

import {Color3, CreateBox, CreateGround, GroundMesh, Mesh, StandardMaterial, Texture, Vector2} from "@babylonjs/core";
import {Scene} from "@babylonjs/core/scene";
import {SkyMaterial, WaterMaterial} from "@babylonjs/materials";
import {GrassProceduralTexture} from "@babylonjs/procedural-textures";

let isInit = false;

let waterMaterial: WaterMaterial;
let grassMaterial: StandardMaterial;
let skyMaterial: SkyMaterial;

function init(scene: Scene) {
    if (!isInit) {
        waterMaterial = new WaterMaterial("water_material", scene);
        waterMaterial.windForce = 4; // Represents the wind force applied on the water surface
        waterMaterial.waveHeight = 0.1; // Represents the height of the waves
        waterMaterial.bumpHeight = 0.3; // According to the bump map, represents the pertubation of reflection and refraction
        waterMaterial.windDirection = new Vector2(1.0, 1.0); // The wind direction on the water surface (on width and height)
        waterMaterial.waterColor = new Color3(0.1, 0.1, 0.6); // Represents the water color mixed with the reflected and refracted world
        waterMaterial.colorBlendFactor = 0.3; // Factor to determine how the water color is blended with the reflected and refracted world
        waterMaterial.waveLength = 0.3; // The lenght of waves. With smaller values, more waves are generated
        waterMaterial.bumpTexture = new Texture("/builtin/textures/waterbump.png", scene);

        // Grass material
        grassMaterial = new StandardMaterial("grass_material", scene);
        grassMaterial.ambientTexture = new GrassProceduralTexture("grass_tex", 2048, scene);

        // Configure the skybox material
        skyMaterial = new SkyMaterial("sky_material", scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.turbidity = 1;
        skyMaterial.luminance = 1;
        skyMaterial.rayleigh = 2;
        skyMaterial.inclination = 0.25;

        isInit = true;
    }
}

export function createSkyBox(scene: Scene): Mesh {
    init(scene);

    let skybox = CreateBox("skybox", {size: 1000.0}, scene);
    skybox.material = skyMaterial;
    skybox.isPickable = false;
    return skybox;
}

export function createOceanSurface(scene: Scene, width: number, height: number): GroundMesh {
    init(scene);
    let ground = CreateGround('ground', {width: width, height: height, subdivisions: 32}, scene);
    ground.material = waterMaterial;
    ground.isPickable = false;
    return ground;
}

export function createGrassSurface(scene: Scene, width: number, height: number): GroundMesh {
    init(scene);
    let ground = CreateGround('ground', {width: width, height: height, subdivisions: 32}, scene);
    ground.material = grassMaterial;
    ground.isPickable = false;
    return ground;
}

/*
 * Add something to the render list of the water material so that it refracts and reflects properly
 */
export function addReflectedMesh(node: any) {
    waterMaterial.addToRenderList(node);
}