(() => {
    let base64Files = {};

    // A FUNCTION TO CONVERT A FILE TO ITS BASE64 EQUIVALENT.
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // A FUNCTION TO UPDATE THE GALLERY'S VISIBILITY.
    const updateGalleryVisibility = (id, files) => {
        const gallery = document.querySelector(`.form-media-gallery[data-form-id="${id}"]`);
        const secondaryGallery = document.querySelector(`.form-media-gallery.secondary[data-form-id="${id}"]`);
        const imagesInput = document.querySelector(`input[name="images"][data-form-id="${id}"]`);
        gallery.classList.add('hidden');
        if (imagesInput.value !== 'null') {
            secondaryGallery.classList.remove('hidden');
        }
        if (files.length !== 0) {
            gallery.classList.remove('hidden');
            secondaryGallery.classList.add('hidden');
        }
    };

    // A FUNCTION TO UPDATE THE MEDIA INPUT'S VALUE.
    const updateMediaInput = (id, files) => {
        document.querySelector(`input[name="media"][data-form-id="${id}"]`).value = JSON.stringify(files);
        document.querySelector(`input[name="files"][data-form-id="${id}"]`).value = '';
    };

    const dropZones = document.querySelectorAll('.form-media-drop-zone');
    const fileInputs = document.querySelectorAll('input[name="files"]');

    // A FUNCTION TO PROCESS FILES AS NEEDED.
    const processFiles = async (id, files) => {
        const filesArray = Array.from(files);

        for (let i = 0; i < filesArray.length; i++) {
            const base64File = await fileToBase64(filesArray[i]);
            if (!base64Files[id].includes(base64File)) {
                base64Files[id].push(base64File);

                const img = document.createElement('img');
                img.src = base64File;
                img.alt = `Image #${i + 1}`;
                img.setAttribute('data-form-id', id);

                img.addEventListener('click', () => {
                    img.parentNode.removeChild(img);

                    const index = base64Files[id].indexOf(base64File);

                    if (index > -1) {
                        base64Files[id].splice(index, 1);
                    }

                    updateMediaInput(id, base64Files[id]);
                    updateGalleryVisibility(id, base64Files[id]);
                });

                document.querySelector(`.form-media-gallery[data-form-id="${id}"]`).appendChild(img);
            }
        }

        updateMediaInput(id, base64Files[id]);
        updateGalleryVisibility(id, base64Files[id]);
    };

    // A FUNCTION TO WATCH FOR CHANGES IN FILE INPUTS.
    fileInputs.forEach((fileInput) => {
        fileInput.addEventListener('change', (evt) => {
            const id = fileInput.getAttribute('data-form-id');
            processFiles(id, evt.target.files);
        });
    });

    // A FUNCTION TO WATCH FOR CHANGES IN THE DROP ZONES.
    dropZones.forEach((dropZone) => {
        const id = dropZone.getAttribute('data-form-id');
        base64Files[id] = [];

        dropZone.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            dropZone.classList.add('highlight');
        });

        dropZone.addEventListener('dragleave', (e) => {
            dropZone.classList.remove('highlight');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.stopPropagation();
            e.preventDefault();

            let files;

            if (e.dataTransfer) {
                files = e.dataTransfer.files;
            }

            dropZone.classList.remove('highlight');
            await processFiles(id, files);
        });

        dropZone.addEventListener('click', () => {
            document.querySelector(`input[type="file"][data-form-id="${id}"]`).click();
        });
    });
})();
