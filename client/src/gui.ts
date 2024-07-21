import { Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, Rectangle, ScrollViewer, StackPanel } from "@babylonjs/gui";
import { App } from "./app";

export class Gui {
    private _app: App;
    private _texture: AdvancedDynamicTexture;

    private _scrollViewer: ScrollViewer;
    private _assetsList: StackPanel;

    constructor(app: App) {
        this._app = app;
        this._texture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this._scrollViewer = new ScrollViewer("assetSelectScroll");
        this._scrollViewer.background = "brown";
        this._scrollViewer.width = "30%";
        this._scrollViewer.height = "50%";
        this._scrollViewer.isVisible = false;

        this._assetsList = new StackPanel("assetSelect");

        this._scrollViewer.addControl(this._assetsList);

        this._texture.addControl(this._scrollViewer);


        let bottomPanel = new StackPanel();
        bottomPanel.isVertical = false;
        bottomPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        bottomPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._texture.addControl(bottomPanel);

        let addButton = this.createToolbarButton("Place Asset", () => {this.populateList(); this._scrollViewer.isVisible = !this._scrollViewer.isVisible}, "green");
        bottomPanel.addControl(addButton);

        let deleteButton = this.createToolbarButton("Delete Asset", () => this._app.deleteSelected(), "red");
        bottomPanel.addControl(deleteButton);
    }

    private populateList() {
        this._assetsList.clearControls();
        let assets = this._app.assetRepository.getAllAssets();
        for (let asset of assets) {
            let truck = this.addAssetButton(asset.name, () => {this._app.placeAsset(asset, this._app.camera.getFrontPosition(5)); this._scrollViewer.isVisible = false; });
            this._assetsList.addControl(truck);
        }
    }

    private createToolbarButton(text, action, color: string): Button {
        let button = Button.CreateSimpleButton("toolbarButton-" + text, text);
        button.width = "150px"
        button.height = "40px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = color;
        button.onPointerUpObservable.add(action);
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        return button;
    }

    private addAssetButton(assetName: string, action): Button {
        let button = Button.CreateSimpleButton("add" + assetName, assetName);
        button.width = "150px"
        button.height = "40px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = "green";
        button.onPointerUpObservable.add(action);
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        return button;
    }
}