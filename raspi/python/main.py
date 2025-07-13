from neural_network.neural_network import NeuralNetwork

# Ağ oluştur
nn = NeuralNetwork()

# Girdi ver
inputs = [0.5] * 11

# Çıktı al
outputs = NeuralNetwork.feed_forward(inputs, nn)

print("outputs:", outputs)
