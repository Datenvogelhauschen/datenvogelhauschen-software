/**
 * Index.html script
 */
(() => {
    const sensorTemperature = document.getElementById("sensor-temperature");
    const sensorHumidity = document.getElementById("sensor-humidity");
    const sensorPressure = document.getElementById("sensor-pressure");
    const sensorTVOC = document.getElementById("sensor-tvoc");
    const sensorCo2 = document.getElementById("sensor-co2");

    const feed = document.getElementById("feed");

    const sendWeatherData = document.getElementById("send-weather");
    const sendBirdData = document.getElementById("send-birddata");
    const sendStreamData = document.getElementById("send-stream");
    const viewDataButton = document.getElementById("view-data");
    const saveDataLocally = document.getElementById("save-data-locally");

    const shutdownButton = document.getElementById("shutdown");
    const rebootButton = document.getElementById("reboot");
    const softwareRestartButton = document.getElementById("software-restart");

    const streamImage = document.getElementById("stream-image");
    const togglePauseButton = document.getElementById("toggle-stream-pause");

    const popupBackground = document.getElementById("popup-background");
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popup-title");
    const popupContent = document.getElementById("popup-content");
    const popupClose = document.getElementById("popup-close");

    const usedStorage = document.getElementById("used-storage");
    const allStorage = document.getElementById("all-storage");
    const usageBar = document.getElementById("storage-usage-bar");

    const exportData = document.getElementById("export-data-to-usb");
    const deleteData = document.getElementById("delete-data");

    const pageContents = document.getElementById("page-contents");

    let pauseStream = false;

    /**
     * Updates local storage usage bar
     */
    const updateStorageUsage = () => {
        fetch("/v1/storage")
            .then(resp => resp.json())
            .then(data => {
                usageBar.style = `width: ${ Math.round(((data.sizeMb - data.freeMb) / data.sizeMb) * 100) }%`;
                usedStorage.innerText = Math.round((data.sizeMb - data.freeMb) / 100) / 10;
                allStorage.innerText = Math.round(data.sizeMb / 100) / 10;
            });
    };

    /**
     * Updates video stream
     */
    const updateImage = () => {
        if(pauseStream) { return; }

        const timestamp = new Date().getTime();

        const preloadedImage = document.createElement("img");

        preloadedImage.onload = () => {
            setTimeout(() => {
                streamImage.src = "/v1/camera?" + timestamp;
            }, 100);
        }

        preloadedImage.src = "/v1/camera?" + timestamp;
    };

    /**
     * Toggles stream pause
     */
    const toggleStreamPause = () => {
        if(pauseStream) {
            togglePauseButton.innerText = "Pause";
            pauseStream = false;
        } else {
            togglePauseButton.innerText = "Abspielen";
            pauseStream = true;
        }
    }

    /**
     * Updates sensor values
     */
    const updateSensors = () => {
        fetch("/v1/sensors")
            .then(resp => resp.json())
            .then(data => {
               sensorTemperature.innerText = (Math.round(data.temperature.value * 10000) / 10000) + " " + data.temperature.unitChar;
               sensorHumidity.innerText = (Math.round(data.humidity.value * 10000) / 10000) + " " + data.humidity.unitChar;
               sensorPressure.innerText = (Math.round(data.pressure.value * 10000) / 10000) + " " + data.pressure.unitChar;
               sensorCo2.innerText = (Math.round(data.co2.value * 10000) / 10000) + " " + data.co2.unitChar;
               sensorTVOC.innerText = (Math.round(data.tvoc.value * 10000) / 10000) + " " + data.tvoc.unitChar;
            });
    };

    /**
     * Creates HTML text for feed element
     * @param title Title
     * @param text Text content
     * @returns {`
            <div class="feed">
                <h3>${string}</h3>
                <p>${string}</p>
            </div>
        `}
     */
    const getFeedHTML = (title, text) => {
        return `
            <div class="feed">
                <h3>${ title }</h3>
                <p>${ text }</p>
            </div>
        `;
    };

    /**
     * Updates feed
     */
    const updateFeed = () => {
        fetch("/v1/feed")
            .then(resp => resp.json())
            .then(data => {
                feed.innerHTML = "";

                if(data.feed.length > 0) {
                    data.feed.forEach(f => {
                        feed.innerHTML += getFeedHTML(f.title, f.content);
                    });
                } else {
                    feed.innerHTML = `
                        <p style="text-align: center;">
                            Kein Feed verfügbar!
                        </p>`;
                }
            });
    };

    /**
     * Updates current settings
     */
    const updateSettings = () => {
        fetch("/v1/settings")
            .then(resp => resp.json())
            .then(data => {
                sendWeatherData.checked = data.dataSharing.weather;
                sendBirdData.checked = data.dataSharing.bird;
                sendStreamData.checked = data.dataSharing.camera;

                saveDataLocally.checked = data.localData.saveLocally;
            });
    };

    /**
     * Patches settings on the server and updates current settings
     */
    const patchSettings = () => {
        fetch("/v1/settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dataSharing: {
                    weather: sendWeatherData.checked,
                    bird: sendBirdData.checked,
                    camera: sendStreamData.checked
                },
                localData: {
                    saveLocally: saveDataLocally.checked
                }
            })
        })
            .then(resp => resp.json())
            .then(data => {
                sendWeatherData.checked = data.dataSharing.weather;
                sendBirdData.checked = data.dataSharing.bird;
                sendStreamData.checked = data.dataSharing.camera;

                saveDataLocally.checked = data.localData.saveLocally;
            });
    }

    /**
     * Exports data to USB
     */
    const exportDataToUsb = () => {
        openYesNoPopup("Lokale Daten auf USB-Stick kopieren",
            "Möchtest du alle lokalen Daten auf deinen USB-Stick kopieren? Stelle sicher, dass ein " +
            "USB-Stick im ext4 oder NTFS-Format (auf Partition 1 bzw. \"/dev/sda1\") eingesteckt ist und genügend Speicherplatz " +
            "auf dem USB-Stick verfügbar ist.", "Ja, jetzt exportieren", "Nein, schließen",
            () => {
                closePopup();
                openWaitPopup("Bitte warten, während Daten auf den USB-Stick kopiert werden...");

                fetch("/v1/actions/exportLocalDataToUsb")
                    .then(resp => resp.json())
                    .then(data => {
                        if(data.exported) {
                            closePopup();
                            openInfoPopup("Kopiervorgang - Erfolg!",
                                "Daten erfolgreich exportiert. Der USB-Stick kann jetzt abgezogen werden.");
                        }

                        if(data.error) {
                            closePopup();
                            openInfoPopup("Kopiervorgang - Fehler!",
                                "Daten konnten nicht kopiert werden. Stelle sicher, dass der USB-Stick genügend " +
                                "Speicherplatz hat und während des Kopiervorgangs nicht abgezogen wurde.");
                        }
                    });
            });
    };

    /**
     * Deletes all local data
     */
    const purgeLocalData = () => {
        openYesNoPopup("Lokale Daten löschen",
            "Möchtest du wirklich alle lokalen Daten löschen? Diese Daten können nach dem Löschvorgang nicht " +
            "wiederhergestellt werden. Exportiere deine Daten zuvor auf einen USB-Stick um diese zu behalten. " +
            "Daten auf dem Datenvogelhäuschen.de Server bleiben weiter bestehen.",
            "Lokale Daten löschen", "Nein, schließen",
            () => {
                closePopup();
                openWaitPopup("Bitte warten während lokale Daten gelöscht werden...");

                fetch("/v1/actions/purgeLocalData")
                    .then(resp => resp.json())
                    .then(data => {
                        closePopup();
                        openInfoPopup("Löschvorgang - Erfolg!",
                            "Lokale Daten wurden erfolgreich gelöscht. Falls du diese noch brauchen solltest, ist " +
                            "es spätestens jetzt zu spät. Wir hoffen das beste...");
                    });
            });
    };

    /**
     * System shutdown
     */
    const shutdown = () => {
        openYesNoPopup("Herunterfahren", "Möchtest du wirklich das gesamte Datenvogelhäuschen herunterfahren?",
            "Ja, herunterfahren", "Nein, schließen", () => {
                fetch("/v1/actions/shutdown")
                    .then(resp => resp.json())
                    .then(data => {
                        if (data.queued) {
                            openInfoPopup("Herunterfahren - Erfolg!",
                                "Dein Datenvogelhäuschen wird in 1 Minute heruntergefahren.");
                        }
                    });
            });
    };

    /**
     * System reboot
     */
    const reboot = () => {
        openYesNoPopup("Neustarten", "Möchtest du wirklich das gesamte Datenvogelhäuschen neustarten?",
            "Ja, neustarten", "Nein, schließen", () => {
                fetch("/v1/actions/reboot")
                    .then(resp => resp.json())
                    .then(data => {
                        if(data.queued) {
                            openInfoPopup("Neustarten - Erfolg!",
                                "Dein Datenvogelhäuschen wird in 1 Minute neugestartet.");
                        }
                    });
            });
    }

    /**
     * Software restart
     */
    const restartSoftware = () => {
        openYesNoPopup("Software neustarten", "Möchtest du wirklich die Datenvogelhäuschen Software neustarten?",
            "Ja, Software neustarten", "Nein, schließen", () => {
                fetch("/v1/actions/restartSoftware")
                    .then(resp => resp.json())
                    .then(data => {
                        if(data.queued) {
                            openInfoPopup("Software neustarten - Erfolg!",
                                "Die Software deines Datenvogelhäuschens wird jetzt neu gestartet.");
                        }
                    });
            });
    };

    /**
     * Opens info popup
     * @param title Title
     * @param text Text
     */
    const openInfoPopup = (title, text) => {
        popupTitle.innerText = title;
        popupContent.innerHTML = `
            ${text}
            
            <br>
            
            <button class="button-popup" id="popup-no-button">
                Schließen
            </button>
        `;

        document.getElementById("popup-no-button").onclick = () => {
            closePopup();
        };

        pageContents.classList.add("blur-page");
        popupClose.removeAttribute("hidden");
        popupTitle.removeAttribute("hidden");
        popup.removeAttribute("hidden");
        popupBackground.removeAttribute("hidden");
    };

    /**
     * Opens Yes-No-Dialog
     * @param title Title
     * @param question Question
     * @param yesButtonText Text on yes button
     * @param noButtonText Text on no button
     * @param yesButtonCallback Yes button click callback
     */
    const openYesNoPopup = (title, question, yesButtonText, noButtonText, yesButtonCallback) => {
        popupTitle.innerText = title;
        popupContent.innerHTML = `
            ${question}
            
            <br>
            
            <button class="button-popup" id="popup-yes-button">
                ${yesButtonText}
            </button>
            
            <button class="button-popup" id="popup-no-button">
                ${noButtonText}
            </button>
        `;

        document.getElementById("popup-yes-button").onclick = yesButtonCallback;
        document.getElementById("popup-no-button").onclick = () => {
            closePopup();
        };

        popupClose.removeAttribute("hidden");
        pageContents.classList.add("blur-page");
        popupTitle.removeAttribute("hidden");
        popup.removeAttribute("hidden");
        popupBackground.removeAttribute("hidden");
    };

    /**
     * Opens wait popup to be closed by script
     * @param text Text
     */
    const openWaitPopup = (text) => {
        popupContent.innerHTML = `
            <center>
                <img src="img/loading.svg" alt="Loading...">
            </center>
        
            <center>
                ${text}
            </center>
        `;

        popupTitle.setAttribute("hidden", "1");

        pageContents.classList.add("blur-page");
        popupClose.setAttribute("hidden", "1");
        popup.removeAttribute("hidden");
        popupBackground.removeAttribute("hidden");
    };

    /**
     * Closes any popup
     */
    const closePopup = () => {
        pageContents.classList.remove("blur-page");
        popup.setAttribute("hidden", "1");
        popupBackground.setAttribute("hidden", "1");
    };

    /**
     * Opens hardware authentication page in new tab
     */
    const openDatenvogelhauschenOnlineService = () => {
        viewDataButton.setAttribute("disabled", "1");

        // Thanks, Apple...
        let windowRef = window.open();

        fetch("/v1/onlineServiceToken")
            .then(resp => resp.json())
            .then(data => {
                windowRef.location = `//dash.datenvogelhäuschen.de/gateway/hardwareAuthentication.html?hash=${data.currentHash}&timestamp=${data.createdFrom}`;
                viewDataButton.removeAttribute("disabled");
            });
    };

    /**
     * Main function
     */
    const _ = () => {
        // Register interaction functions
        togglePauseButton.onclick = toggleStreamPause;

        popupClose.onclick = closePopup;

        sendWeatherData.onclick = patchSettings;
        sendBirdData.onclick = patchSettings;
        sendStreamData.onclick = patchSettings;
        saveDataLocally.onclick = patchSettings;

        viewDataButton.onclick = openDatenvogelhauschenOnlineService;

        softwareRestartButton.onclick = restartSoftware;
        rebootButton.onclick = reboot;
        shutdownButton.onclick = shutdown;

        exportData.onclick = exportDataToUsb;
        deleteData.onclick = purgeLocalData;

        // Run image and sensor update every few seconds
        setInterval(updateImage, 5000);
        setInterval(updateSensors, 5000);

        updateStorageUsage();
        updateSettings();
        updateSensors();
        updateImage();
        updateFeed();
    };

    // Run main function
    _();
})();
