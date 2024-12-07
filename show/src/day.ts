function computeSpeed(value: number): number {
    if (value <= 0) {
        return 1;
    }

    return value * 2;
}

function speedEventListener(callback: (speed: number) => void) {
    const speedSlider = document.getElementById("settings-speed") as HTMLInputElement;
    speedSlider.addEventListener("input", () => {
        callback(computeSpeed(parseInt(speedSlider.value)));
    });
}

export { computeSpeed, speedEventListener };
