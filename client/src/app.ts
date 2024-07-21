/// The renderer will initially be created using a project
/// This project will be processed and added to the scene in its entirety
/// Then any additions to the scene must be synced using the addPlaced method.
import {Scene} from "@babylonjs/core/scene";
import {Engine} from "@babylonjs/core/Engines/engine";
import {
    AbstractMesh,
    ActionManager,
    AssetsManager,
    Color3,
    ExecuteCodeAction,
    HighlightLayer,
    Mesh,
    SceneLoader,
    UniversalCamera,
    Vector3
} from "@babylonjs/core";
import {BaseType, LoadedProject, PlacedAsset, Project} from "./project";
import {Asset, AssetRepository, PropertyMap} from './assets';
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight";
import {addReflectedMesh, createGrassSurface, createOceanSurface, createSkyBox} from "./bases";

interface TrackedAsset {
    placedAsset: PlacedAsset;
    meshes: AbstractMesh[];
}

export class App {
    private _engine: Engine;
    private _assetsManager: AssetsManager;
    assetRepository: AssetRepository;
    private _scene: Scene;
    camera: UniversalCamera;
    private _light: HemisphericLight;
    private _project: Project;
    private _assets: TrackedAsset[] = [];
    private _highlight: HighlightLayer;
    private _selected: TrackedAsset;

    private _inputMap: {[id: string]: boolean} = {};

    constructor(canvas: HTMLCanvasElement, loadedProject: LoadedProject) {
        // Create asset repository
        this.assetRepository = new AssetRepository();

        // Create babylon engine
        this._engine = new Engine(canvas, true);

        // Display the loader
//        this._engine.displayLoadingUI();

        // Create the babylon scene
        this._scene = new Scene(this._engine);

        // Create assets manager
        this._assetsManager = new AssetsManager(this._scene);

        // Create the camera
        this.camera = new UniversalCamera("universalCamera", new Vector3(0, 12, 0), this._scene);
        this.camera.setTarget(new Vector3(0, 0, 50));
        this.camera.speed = 0.75;
        this.camera.attachControl(true);

        // Default light
        this._light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._scene);
        this._light.intensity = 0.7;

        // Create highlight layer
        this._highlight = new HighlightLayer("highlight", this._scene);

        // Skybox
        let skybox = createSkyBox(this._scene);

        // Hook up inputs
        this._scene.actionManager = new ActionManager(this._scene);
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {				
            console.log(evt.sourceEvent.key);				
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {								
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        // Setup loading screen
        this._assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
            this._engine.loadingUIText = 'Loading project... ' + remainingCount + ' out of ' + totalCount + ' asset models remaining.';
        };

        // Configure render loop
        this._assetsManager.onFinish = () => {
            this.updateTotals();

        // Position and scale here
        for (let tracked of this._assets) {
            tracked.meshes.forEach(mesh => {
                // Scale up the mesh to match the asset properties
                mesh.scaling = new Vector3(tracked.placedAsset.asset.modelScale, tracked.placedAsset.asset.modelScale, tracked.placedAsset.asset.modelScale);

                // Set the meshes position in the world.
                mesh.setAbsolutePosition(tracked.placedAsset.position);
            })
        }

            this._engine.runRenderLoop(() => this._scene.render());
        };

        // Perform asset loading, then load the project
        this.assetRepository.load().then(() => {
            // TODO: Load the project
            this._project = Project.fromLoaded(loadedProject, this.assetRepository);

            // Configure the ground plane
            if (this._project.base == BaseType.Grassy) {
                createGrassSurface(this._scene, 512, 512);
            } else if (this._project.base == BaseType.Ocean) {
                createOceanSurface(this._scene, 512, 512);
                addReflectedMesh(skybox);
            } else {
                console.warn("Invalid base type was used for project.");
                alert("Project corruption detected. Contact an administrator for guidance.");
            }

            // Place all assets into the scene.
            for (let asset of this._project.assets) {
                let task = this._assetsManager.addMeshTask("task", "", asset.asset.modelRepository, asset.asset.modelName);
                task.onSuccess = task => {
                    // Track the asset
                    let tracked: TrackedAsset = {
                        placedAsset: asset,
                        meshes: []
                    };
                    this._assets.push(tracked);
                    console.log(this._assets.length);

                    // Process loaded meshes
                    task.loadedMeshes.forEach(mesh => {
                        // Add to tracker
                        tracked.meshes.push(mesh);

                        // Enable picking
                        mesh.isPickable = true;

                        // Add to reflection of the ground
//                    addReflectedMesh(mesh);
                    });

                    // Hook to watch changes
                    asset.setChangedCallback(asset => {
                        tracked.meshes.forEach(mesh => mesh.setAbsolutePosition(asset.position));
                        this.updateAssetsList();
                    });
                };

                task.onError = (task, message, exception) => {
                    console.error(message, exception);
                }
            }

            this._assetsManager.load();
        });

        // Hook window resizes
        window.addEventListener("resize", () => {
            canvas.removeAttribute("width");
            canvas.removeAttribute("height");
            this._engine.resize(false);
        });

        // Hook mesh selection
        this._scene.onPointerDown = (evt, pickResult) => {
            // Attempt to pick an object
            if (pickResult.hit) {
                for (let track of this._assets) {
                    if (track.meshes.indexOf(pickResult.pickedMesh) > -1) {
                        this.selectAsset(track);
                        break;
                    }
                }
            }
        }

        // Accept keyboard inputs
        this._scene.onBeforeRenderObservable.add(() => {
            if (this._selected != null) {
                if (this._inputMap['Escape']) {
                    this.selectAsset(null);
                    return;
                }

                if (this._inputMap['Home']) {
                    this._selected.placedAsset.position = new Vector3(0, 0, 0);
                    return;
                }

                let moveVec = Vector3.Zero();
                if (this._inputMap['e']) {
                    moveVec.y += 1.0;
                }
                if (this._inputMap['q']) {
                    moveVec.y -= 1.0;
                }
                if (this._inputMap['w']) {
                    moveVec.z += 1.0;
                }
                if (this._inputMap['s']) {
                    moveVec.z -= 1.0;
                }
                if (this._inputMap['d']) {
                    moveVec.x += 1.0;
                }
                if (this._inputMap['a']) {
                    moveVec.x -= 1.0;
                }

                if (moveVec.length() > 0) {
                    console.log(moveVec);
                    let pos = this._selected.placedAsset.position;
                    this._selected.placedAsset.position = new Vector3(pos.x + moveVec.x, pos.y + moveVec.y, pos.z + moveVec.z);;
                    console.log(this._selected.placedAsset);
                }
            }
        })
    }

    placeAsset(asset: Asset, position: Vector3): PlacedAsset {
        let placed = this._project.place(asset, position);

        let tracked: TrackedAsset = {
            placedAsset: placed,
            meshes: []
        };
        this._assets.push(tracked);

        SceneLoader.ImportMesh("", asset.modelRepository, asset.modelName, this._scene, (meshes) => {
            meshes.forEach(mesh => {
                // Scale up the mesh to match the asset properties
                mesh.scaling = new Vector3(asset.modelScale, asset.modelScale, asset.modelScale);

                // Set the meshes position in the world.
                mesh.setAbsolutePosition(placed.position);

                // Add to tracker
                tracked.meshes.push(mesh);

                // Enable picking
                mesh.isPickable = true;

                // Add to reflection of the ground
                // Disabled due to limitation in the water material blocking from removal from the reflection thing
//                addReflectedMesh(mesh);
            });
        });

        // Track for positional changes
        placed.setChangedCallback(asset => {
            tracked.meshes.forEach(mesh => mesh.setAbsolutePosition(asset.position));
            this.updateAssetsList();
        });

        this.updateTotals();
        return placed;
    }

    removeAsset(asset: PlacedAsset) {
        // Remove from screen
        this._selected.meshes.forEach(mesh => this._scene.removeMesh(mesh));
        
        // Remove from project
        this._project.remove(asset);

        // Remove from tracking
        for (let i = 0; i < this._assets.length; i++) {
            if (this._assets[i].placedAsset === asset) {
                this._assets.splice(i, 1);
                break;
            }
        }

        this.updateTotals();
    }

    deleteSelected() {
        if (this._selected != null) {
            this.removeAsset(this._selected.placedAsset);
            this.selectAsset(null);
        }
    }

    private updateTotals() {
        this.populatePropertyTable("totalData", this.propertySum(), true);
        this.updateAssetsList();
    }

    private selectAsset(asset: TrackedAsset) {
        this._highlight.removeAllMeshes();
        this._selected = asset;

        if (asset == null) {
            document.getElementById("assetSelection").innerHTML = "No asset selected.";
            this.populatePropertyTable("selectedData", {}, true);
        } else {
            document.getElementById("assetSelection").innerHTML = "Selected: " + asset.placedAsset.asset.name;
            this.populatePropertyTable("selectedData", this.resolveProperties(asset), true);

            asset.meshes.forEach(mesh => {
                if (mesh instanceof Mesh)
                    this._highlight.addMesh(mesh, Color3.Green())
            });
        }
    }

    private resolveProperties(asset: TrackedAsset): PropertyMap {
        // Copy the properties so we can write to them safely
        let properties = Object.assign({}, asset.placedAsset.asset.properties);
        for (let overrideP in asset.placedAsset.overrideProperties) {
            properties[overrideP] = asset.placedAsset.overrideProperties[overrideP];
        }
        return properties;
    }

    private populatePropertyTable(tableId: string, data: PropertyMap, clear: boolean = false) {
        const table: HTMLTableSectionElement = document.getElementById(tableId) as HTMLTableSectionElement;

        // Wipe the table
        if (clear) {
            for (let i = table.rows.length - 1; i >= 0; i--) {
                table.deleteRow(i);
            }
        }

        // Write table contents
        for (let pName in data) {
            let row = table.insertRow();

            let propertyName = row.insertCell();
            propertyName.innerHTML = pName;

            // TODO: Maybe do a textbox???
            let propertyValue = row.insertCell();
            propertyValue.innerHTML = data[pName].toString();
        }
    }

    private updateAssetsList() {
        const table: HTMLTableSectionElement = document.getElementById('assetsList') as HTMLTableSectionElement;

        // Wipe table
        for (let i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
        }

        // Write table contents
        for (let asset of this._project.assets) {
            let row = table.insertRow();

            let propertyName = row.insertCell();
            propertyName.innerHTML = asset.asset.name;

            // TODO: Maybe do a textbox???
            let propertyValue = row.insertCell();
            propertyValue.innerHTML = asset.position.toString();
        }
    }

    private propertySum(): PropertyMap {
        let props: PropertyMap = {};
        for (let asset of this._assets) {
            let assetProps = this.resolveProperties(asset);
            for (let k in assetProps) {
                if (k in props) {
                    props[k] += assetProps[k];
                } else {
                    props[k] = assetProps[k];
                }
            }
        }
        return props;
    }
}