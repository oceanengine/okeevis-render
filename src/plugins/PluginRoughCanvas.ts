import { AbstractPlugin } from '../abstract/AbstractPlugin';
import { Options as RoughOptions } from 'roughjs/bin/core';
import { RoughCanvas } from 'roughjs/bin/canvas';
import type CanvasPainter from '../painter/CanvasPainter';

export interface PluginRoughCanvasConfig {
    rough?: boolean;
    options?: RoughOptions;
}

export class PluginRoughCanvas extends AbstractPlugin<PluginRoughCanvasConfig> {
    public name = 'roughCanvas';

    public init(): void {
        this.render.enableDirtyRect = false;
        const canvasPainter = this.render.getPainter() as CanvasPainter;
        const roughCanvas = new RoughCanvas(canvasPainter.getCanvas());
        (canvasPainter as any).roughCanvas = roughCanvas;
        this._setConfig();
        
    }
    
    updateConfig(config: PluginRoughCanvasConfig) {
        this.config = config;
        this._setConfig();
    }

    private _setConfig() {
        const canvasPainter = this.render.getPainter() as CanvasPainter;
        (canvasPainter as any).roughConfig = {
            rough: this.config.rough ?? true,
            options: {
                seed: 1,
                ...this.config.options
            },
        }
    }
}