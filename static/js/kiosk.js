/**
 * Kiosk.html script
 */
(() => {
    const videoTimestamp = document.getElementById("video-timestamp");

    const streamImage = document.getElementById("stream-image");

    /**
     * Updates video timestamp h2
     */
    const updateVideoTimestamp = () => {
        videoTimestamp.innerText = new Date().toLocaleString();
    };

    /**
     * Updates video stream
     */
    const updateImage = () => {
        const timestamp = new Date().getTime();

        const preloadedImage = document.createElement("img");

        preloadedImage.onload = () => {
            setTimeout(() => {
                streamImage.src = "/v1/camera?" + timestamp;
            }, 100);
        }

        preloadedImage.src = "/v1/camera?" + timestamp;
    }

    /**
     * Main function
     */
    const _ = () => {
        // Run timestamp update every second
        setInterval(updateVideoTimestamp, 1000);

        // Run image update every second
        setInterval(updateImage, 2500);

        // Inital run
        updateVideoTimestamp();
        updateImage();
    };

    // Run main function
    _();
})();
