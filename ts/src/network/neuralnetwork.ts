import { lerp } from "../utils/utils";

export class NeuralNetwork {
  levels: Level[] = [];
  constructor(neurons: number[]) {
    for (let i = 0; i < neurons.length - 1; i++) {
      this.levels.push(new Level(neurons[i], neurons[i + 1]));
    }
  }

  static feedForward(inputs: number[], network: NeuralNetwork): boolean[] {
    let output = Level.feedForward(inputs, network.levels[0]);
    for (let i = 1; i < network.levels.length; i++) {
      output = Level.feedForward(output, network.levels[i]);
    }
    return output.map((o) => (o == 1 ? true : false));
  }
  static mutate(network: NeuralNetwork, amount = 0.1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    });
  }
}

export class Level {
  inputs: number[] = [];
  outputs: number[] = [];
  weights: number[][] = [];
  biases: number[] = [];
  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array<number>(inputCount);
    this.outputs = new Array<number>(outputCount);
    this.biases = new Array<number>(outputCount);

    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array<number>(outputCount);
    }
    Level.randomize(this);
  }
  static randomize(level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  static feedForward(inputs: number[], level: Level): number[] {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = inputs[i];
    }
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      level.outputs[i] = sum > level.biases[i] ? 1 : 0;
    }
    return level.outputs;
  }
}
