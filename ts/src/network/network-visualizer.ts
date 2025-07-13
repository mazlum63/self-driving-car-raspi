import { lerp } from "../utils/utils";
import type { Level, NeuralNetwork } from "./neuralnetwork";

export class NeuralNetworkVisualizer {
    private static canvasWidth = 500;
    private static visualWidth = this.canvasWidth - 100;
    private static distanceBetweenNeurons = 200;
    private static neuronSize = 30;
    static drawNetwork(context: CanvasRenderingContext2D, network: NeuralNetwork) {
        for (let i = network.levels.length - 1; i > -1; i--) {
            NeuralNetworkVisualizer.drawLevel(context, network.levels[i], i + 1)
        }
        NeuralNetworkVisualizer.drawOutput(context, network)
    }

    private static drawLevel(context: CanvasRenderingContext2D, level: Level, index: number) {
        for (let i = 0; i < level.inputs.length; i++) {


            context.beginPath();
            for (let j = 0; j < level.outputs.length; j++) {
                context.moveTo(lerp(30, this.visualWidth, i / (level.inputs.length + 1)), this.distanceBetweenNeurons * index);
                context.strokeStyle = `rgb(${255 - level.weights[i][j] * 255},${255 - level.weights[i][j] * 255},${level.weights[i][j] * 255})`;
                context.lineWidth = level.weights[i][j] * 2;
                context.lineTo(lerp(30, this.visualWidth, j / (level.outputs.length - 1)), this.distanceBetweenNeurons * (index + 1));
            }
            context.stroke();
            context.closePath()

            context.arc(lerp(30, this.visualWidth, i / (level.inputs.length - 1)), this.distanceBetweenNeurons * index, 10, 0, Math.PI * 2)
            context.fillStyle = `rgb(${255 - level.inputs[i] * 255},${255 - level.inputs[i] * 255},${255 - level.inputs[i] * 255}`
            context.fill();

        }
    }

    private static drawOutput(context: CanvasRenderingContext2D, network: NeuralNetwork) {
        const levelLength = network.levels.length;
        const outputs = network.levels[levelLength - 1].outputs;
        const emojies = ["⬆️", "⬅️", "➡️", "⬇️"];
        for (let i = 0; i < outputs.length; i++) {
            context.beginPath();
            context.arc(lerp(30, this.visualWidth - 20, (i / outputs.length - 1)), this.distanceBetweenNeurons * (levelLength + 1), 20, 0, Math.PI * 2)
            context.fillStyle = outputs[i] == 1 ? "#FFFF00" : "#0000FF"
            context.fill();
            context.font = `22px Verdana`;
            const x = lerp(30, this.visualWidth - this.neuronSize, i / (outputs.length - 1)) - this.neuronSize / 2
            const y = (this.distanceBetweenNeurons * (levelLength + 1)) + 11
            context.fillText(emojies[i], x, y)
        }
        console.log(outputs.length);

    }
}