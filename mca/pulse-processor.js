const minFrontPoints = 4;
const maxFrontPoints = 12;
let currentFrontPoints = 0;
let prevValue = 0;
let frontStartValue = 0;

class PulseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // inputs[0] is the first input, channel[0] is the first channel
    const inputChannelData = inputs[0][0];

    if (inputChannelData) {
      const pulses = [];

      for (i = 0; i < inputChannelData.length; i++) {
        const currentValue = inputChannelData[i] + 1; // from 0 to 2
        if (currentValue > prevValue) {
          if (currentFrontPoints === 0) {
            frontStartValue = prevValue;
          }

          currentFrontPoints++;
        } else {
          if (currentFrontPoints >= minFrontPoints && currentFrontPoints <= maxFrontPoints) {
            pulses.push(currentValue - frontStartValue);
          } else {
            frontStartValue = 0;
            currentFrontPoints = 0;
          }
        }

        prevValue = currentValue;
      }

      this.port.postMessage(pulses);
    }

    return true;
  }
}

registerProcessor('pulse-processor', PulseProcessor);