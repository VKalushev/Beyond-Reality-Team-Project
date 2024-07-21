/*
 * This file will deal with per-project constructs and map them to the babylonjs world
 */


// A simple TS type for a string to number map
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Asset, AssetRepository, PropertyMap} from './assets';

const assets: Asset[] = [
    new Asset("Truck", "/builtin/models/", "camion jugete.obj", {"cost": 2300}),
]

export type PlacedAssetChanged = (asset: PlacedAsset) => void;

/// A placed instance of an asset.
export class PlacedAsset {
    /// The asset reference.
    private _asset: Asset;

    /// The position of the asset.
    private _position: Vector3;

    // TODO: Add rotation support.

    /// Any overridden properties.
    private _overrideProperties: PropertyMap = {};

    private _changedCallback: PlacedAssetChanged;

    constructor(asset: Asset, position: Vector3) {
        this._asset = asset;
        this._position = position;
    }

    get asset(): Asset {
        return this._asset;
    }

    get position(): Vector3 {
        return this._position;
    }

    get overrideProperties(): PropertyMap {
        return this._overrideProperties;
    }

    set position(pos: Vector3) {
        this._position = pos;
        if (this._changedCallback !== undefined && this._changedCallback !== null) {
            this._changedCallback(this);
            console.log("CHANGE!");
        }
    }

    setChangedCallback(callback: PlacedAssetChanged) {
        this._changedCallback = callback;
    }
}

export enum BaseType {
    Grassy,
    Ocean
}

export class Project {
    private _assets: PlacedAsset[] = [];
    private _base: BaseType;

    constructor(base: BaseType) {
        this._base = base;
    }

    static fromLoaded(project: LoadedProject, assetRepository: AssetRepository): Project {
        // Create
        let proj: Project;
        switch (project.type) {
            case "sea":
                proj = new Project(BaseType.Ocean);
                break;
            case "grass":
                proj = new Project(BaseType.Grassy);
                break;
            default:
                console.error("Invalid project type!");
                proj = new Project(BaseType.Ocean);
        }

        // Load in the assets
        for (let placed of project.assets) {
            let asset = assetRepository.getAsset(placed.asset);
            if (asset != null && placed.position.length === 3)
                proj.place(asset, new Vector3(parseFloat(placed.position[0]), parseFloat(placed.position[1]), parseFloat(placed.position[2])));
            else
                console.error("Failed to place asset, couldnt find asset or position was malformed.");
                console.debug(placed);
        }

        return proj;
    }

    get assets() {
        return this._assets;
    }

    get base() {
        return this._base;
    }

    /// Place an asset into the project.
    place(asset: Asset, position: Vector3): PlacedAsset {
        let placed = new PlacedAsset(asset, position);
        this._assets.push(placed);
        return placed;
    }

    remove(asset: PlacedAsset) {
        let i = this._assets.indexOf(asset);
        if (i > 0) {
            this._assets.splice(i, 1);
        }
    }
}

// This doesnt feature all of the possible parameters, just the ones we need for the demo.
export interface LoadedAssetPlacement {
    asset: string;
    position: any[];
}

export interface LoadedProject {
    type: string;
    assets: LoadedAssetPlacement[];
}