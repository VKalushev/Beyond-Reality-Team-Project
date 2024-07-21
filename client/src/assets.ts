export type PropertyMap = {
    [id: string]: number
};

// TODO: Assets need an ID...
/**
* A digital asset that will have an associated visual mesh and a table of properties.
*/
export class Asset {
    /// The Asset ID in the database
    id: string;

    /// Name of the asset
    name: string;

    /// Where the model and other components are stored
    modelRepository: string;

    /// Name of the model file
    modelName: string;

    /// Scaler for the model meshes. Useful for smaller models.
    modelScale: number = 1.0;

    /// Asset property map
    properties: PropertyMap;

    constructor(name: string, modelRepository: string, modelPath: string, properties: PropertyMap = {}) {
        this.name = name;
        this.modelRepository = modelRepository;
        this.modelName = modelPath;
        this.properties = properties;
    }
}

// This will load all the assets into memory (rubbish idea but for prototype this is fine).
export class AssetRepository {
    private _assets: {[id: string]: Asset} = {};

    constructor() {

    }

    getAsset(id: string): Asset {
        if (id in this._assets)
            return this._assets[id];
        return null;
    }

    getAllAssets(): Asset[] {
        return Object.values(this._assets);
    }

    async load() {
        // Cheating for this demo. Normally these IDs would be random and it would be loaded from a database.
        this._assets['turbine'] = new Asset("Wind Turbine", "./builtin/models/", "WindTurbine.obj", {"Cost": 25000, "Assembly (hours)": 5});
        this._assets['pipes'] = new Asset("Pipes", "./builtin/models/", "Pipes2V2obj.obj", {"Cost": 2500, "Assembly (hours)": 1});
        this._assets['tanker'] = new Asset("Tanker", "./builtin/models/", "TankerWithGastEX.obj", {"Cost": 750000, "Staff": 100});
        this._assets['tanks'] = new Asset("Tanks 4x7", "./builtin/models/", "Tanks4x7.obj", {"Cost": 1000, "Assembly (hours)": 2});
        this._assets['tanks_pipes'] = new Asset("Tanks with Pipes", "./builtin/models/", "TanksWithPipes.obj", {"Cost": 2300, "Assembly (hours)": 3});
        this._assets['truck'] = new Asset("Truck", "./builtin/models/", "camion jugete.obj", {"Cost": 2300, "Staff": 2});
        this._assets['truck'].modelScale = 32;
    }
}