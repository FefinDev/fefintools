"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let toolsLoaded = false;

let currentTool = "home";

let currentWhatsAppURL = "";

let generatedDiscountCodes = [];

let lastCompressedBlob = null;
let lastCompressedName = "compressed-image.jpg";

let resizeImageData = null;


/* =========================================================
   TOOL DATA
========================================================= */

const toolNames = {

    qr: "QR Generator",
    password: "Password Generator",
    palette: "Palette Generator",
    converter: "Image Converter",
    compressor: "Image Compressor",
    resizer: "Image Resizer",
    whatsapp: "WhatsApp Link",
    barcode: "Barcode Generator",
    discount: "Discount Calculator",
    utm: "UTM Builder",
    codes: "Discount Codes"

};


/* =========================================================
   DISCOUNT DATA
========================================================= */

const countryNames = {

    AR: "Argentina",
    MX: "México",
    CL: "Chile",
    CO: "Colombia",
    UY: "Uruguay",
    BR: "Brasil",
    US: "Estados Unidos",
    ES: "España",
    GB: "Reino Unido",
    INT: "Internacional"

};


const southernCountries = [
    "AR",
    "CL",
    "UY",
    "BR"
];


const commercialEvents = {

    AR: [
        { month: 10, name: "DIADELAMADRE" },
        { month: 11, name: "CYBERMONDAY" },
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NAVIDAD" }
    ],

    MX: [
        { month: 5, name: "HOTSALE" },
        { month: 11, name: "BUENFIN" },
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NAVIDAD" }
    ],

    CL: [
        { month: 5, name: "CYBERDAY" },
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NAVIDAD" }
    ],

    CO: [
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NAVIDAD" }
    ],

    UY: [
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NAVIDAD" }
    ],

    BR: [
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NATAL" }
    ],

    US: [
        { month: 10, name: "HALLOWEEN" },
        { month: 11, name: "THANKSGIVING" },
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "CHRISTMAS" }
    ],

    ES: [
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "NAVIDAD" }
    ],

    GB: [
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "CHRISTMAS" }
    ],

    INT: [
        { month: 11, name: "BLACKFRIDAY" },
        { month: 12, name: "HOLIDAYS" }
    ]

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    initializeGlobalEvents();

    await loadTools();

    initializeTools();

    hideLoader();

});


/* =========================================================
   LOAD TOOLS.HTML
========================================================= */

async function loadTools() {

    const container =
        document.getElementById("toolsContainer");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("tools.html", {
                cache: "no-cache"
            });

        if (!response.ok) {
            throw new Error("No se pudo cargar tools.html");
        }

        const html =
            await response.text();

        container.innerHTML = html;

        toolsLoaded = true;

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="tool-page">
                <div class="panel">
                    <h2 style="margin-top:0;">
                        No se pudieron cargar las herramientas
                    </h2>

                    <p style="color:#8995a3;font-size:12px;line-height:1.6;">
                        Abrí Fefin Tools mediante un servidor web
                        local o publicalo en un hosting.
                        Si abrís index.html directamente como
                        archivo, el navegador puede bloquear la carga
                        de tools.html por las políticas de seguridad.
                    </p>
                </div>
            </div>
        `;

    }

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeGlobalEvents() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                const tool =
                    button.dataset.tool;

                if (tool === "home") {
                    showHome();
                } else {
                    openTool(tool);
                }

                closeMobileSidebar();

            });

        });


    document
        .querySelectorAll(".tool-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                openTool(
                    card.dataset.toolCard
                );

            });

        });


    const search =
        document.getElementById("toolSearch");

    if (search) {

        search.addEventListener(
            "input",
            filterTools
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                const input =
                    document.getElementById("toolSearch");

                if (input) {
                    input.focus();
                }

            }

            if (event.key === "Escape") {

                closeMobileSidebar();

            }

        }
    );


    const mobileButton =
        document.getElementById("mobileMenuButton");

    if (mobileButton) {

        mobileButton.addEventListener(
            "click",
            toggleMobileSidebar
        );

    }

}


/* =========================================================
   INITIALIZE TOOLS
========================================================= */

function initializeTools() {

    const yearInput =
        document.getElementById("codeYear");

    if (yearInput) {

        yearInput.value =
            new Date().getFullYear();

    }

    updateCampaigns();

    initializeImageDropZones();

    initializePalette();

    initializeResizeInputs();

}


/* =========================================================
   NAVIGATION
========================================================= */

function openTool(tool) {

    if (!toolsLoaded) {
        showToast(
            "Las herramientas todavía se están cargando.",
            "error"
        );
        return;
    }

    currentTool = tool;

    const home =
        document.getElementById("homeView");

    const tools =
        document.getElementById("toolsView");

    if (home) {
        home.classList.remove("active");
    }

    if (tools) {
        tools.classList.add("active");
    }

    document
        .querySelectorAll(".tool-page")
        .forEach(page => {

            page.classList.toggle(
                "hidden",
                page.dataset.toolPage !== tool
            );

        });


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.tool === tool
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showHome() {

    currentTool = "home";

    const home =
        document.getElementById("homeView");

    const tools =
        document.getElementById("toolsView");

    if (tools) {
        tools.classList.remove("active");
    }

    if (home) {
        home.classList.add("active");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.tool === "home"
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function closeMobileSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

}


function toggleMobileSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {

        sidebar.classList.toggle(
            "mobile-open"
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function filterTools() {

    const input =
        document.getElementById("toolSearch");

    const query =
        input.value
            .trim()
            .toLowerCase();

    const cards =
        document.querySelectorAll(
            ".tool-card"
        );

    let visible = 0;

    cards.forEach(card => {

        const searchText =
            (
                card.dataset.search +
                " " +
                card.innerText
            ).toLowerCase();

        const matches =
            !query ||
            searchText.includes(query);

        card.classList.toggle(
            "hidden",
            !matches
        );

        if (matches) {
            visible++;
        }

    });


    const noResults =
        document.getElementById(
            "noSearchResults"
        );

    if (noResults) {

        noResults.classList.toggle(
            "hidden",
            visible !== 0
        );

    }


    const count =
        document.getElementById("toolCount");

    if (count) {
        count.textContent = visible;
    }

}


/* =========================================================
   TOASTS
========================================================= */

function showToast(message, type = "success") {

    const container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        "toast " + type;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3100);

}


/* =========================================================
   COPY
========================================================= */

async function copyText(text) {

    if (!text) {
        return false;
    }

    try {

        await navigator.clipboard.writeText(
            text
        );

        return true;

    } catch {

        try {

            const textarea =
                document.createElement("textarea");

            textarea.value = text;

            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();

            return true;

        } catch {

            return false;

        }

    }

}


async function copyElement(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    const success =
        await copyText(
            element.textContent
        );

    if (success) {

        showToast(
            "Copiado al portapapeles."
        );

    } else {

        showToast(
            "No se pudo copiar.",
            "error"
        );

    }

}


/* =========================================================
   QR
========================================================= */

let currentQRCode = null;


function generateQR() {

    if (
        typeof QRCode === "undefined"
    ) {

        showToast(
            "La librería QR todavía no está disponible.",
            "error"
        );

        return;
    }


    const text =
        document
            .getElementById("qrText")
            ?.value
            .trim();


    if (!text) {

        showToast(
            "Ingresá un contenido para generar el QR.",
            "error"
        );

        return;
    }


    const size =
        parseInt(
            document.getElementById("qrSize")
                ?.value || "260"
        );


    const levelValue =
        document.getElementById("qrLevel")
            ?.value || "M";


    const levels = {

        L: QRCode.CorrectLevel.L,
        M: QRCode.CorrectLevel.M,
        Q: QRCode.CorrectLevel.Q,
        H: QRCode.CorrectLevel.H

    };


    const output =
        document.getElementById(
            "qrOutput"
        );


    output.innerHTML = "";


    currentQRCode =
        new QRCode(
            output,
            {
                text,
                width: size,
                height: size,
                correctLevel:
                    levels[levelValue]
            }
        );


    document
        .getElementById("qrResult")
        .classList.remove("hidden");


    showToast(
        "Código QR generado."
    );

}


function downloadQR() {

    const output =
        document.getElementById(
            "qrOutput"
        );

    if (!output) return;

    const canvas =
        output.querySelector("canvas");

    const image =
        output.querySelector("img");


    let dataURL = null;


    if (canvas) {

        dataURL =
            canvas.toDataURL(
                "image/png"
            );

    } else if (image) {

        dataURL =
            image.src;

    }


    if (!dataURL) {

        showToast(
            "Primero generá el QR.",
            "error"
        );

        return;
    }


    const link =
        document.createElement("a");

    link.href = dataURL;

    link.download =
        "fefin-tools-qr.png";

    link.click();


    showToast(
        "QR descargado."
    );

}


function copyQRContent() {

    copyElement("qrText");

}


/* =========================================================
   PASSWORD
========================================================= */

function generatePassword() {

    const length =
        parseInt(
            document.getElementById(
                "passwordLength"
            ).value
        );


    let chars = "";

    if (
        document.getElementById(
            "passUpper"
        ).checked
    ) {

        chars +=
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    }

    if (
        document.getElementById(
            "passLower"
        ).checked
    ) {

        chars +=
            "abcdefghijklmnopqrstuvwxyz";

    }

    if (
        document.getElementById(
            "passNumbers"
        ).checked
    ) {

        chars +=
            "0123456789";

    }

    if (
        document.getElementById(
            "passSymbols"
        ).checked
    ) {

        chars +=
            "!@#$%^&*()-_=+[]{}?";

    }


    if (!chars) {

        showToast(
            "Seleccioná al menos un tipo de carácter.",
            "error"
        );

        return;
    }


    const values =
        new Uint32Array(length);

    crypto.getRandomValues(values);


    let password = "";

    for (
        let i = 0;
        i < length;
        i++
    ) {

        password +=
            chars[
                values[i] % chars.length
            ];

    }


    document.getElementById(
        "passwordOutput"
    ).textContent = password;


    document.getElementById(
        "passwordResult"
    ).classList.remove("hidden");

}


/* =========================================================
   PALETTE
========================================================= */

function initializePalette() {

    const color =
        document.getElementById(
            "baseColor"
        );

    const text =
        document.getElementById(
            "baseColorText"
        );

    if (!color || !text) {
        return;
    }


    color.addEventListener(
        "input",
        () => {

            text.value =
                color.value.toUpperCase();

        }
    );


    text.addEventListener(
        "input",
        () => {

            const value =
                text.value.trim();

            if (
                /^#[0-9A-Fa-f]{6}$/.test(
                    value
                )
            ) {

                color.value =
                    value;

            }

        }
    );


    generatePalette();

}


function hexToRgb(hex) {

    hex =
        hex.replace(
            "#",
            ""
        );

    return {

        r: parseInt(
            hex.substring(0, 2),
            16
        ),

        g: parseInt(
            hex.substring(2, 4),
            16
        ),

        b: parseInt(
            hex.substring(4, 6),
            16
        )

    };

}


function rgbToHex(r, g, b) {

    return "#" +
        [r, g, b]
            .map(
                value =>
                    Math
                        .max(
                            0,
                            Math.min(
                                255,
                                Math.round(
                                    value
                                )
                            )
                        )
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");

}


function generatePalette() {

    const color =
        document.getElementById(
            "baseColor"
        );

    const output =
        document.getElementById(
            "paletteResult"
        );

    if (!color || !output) {
        return;
    }


    const rgb =
        hexToRgb(
            color.value
        );


    const factors = [
        0.45,
        0.7,
        1,
        1.25,
        1.5
    ];


    output.innerHTML = "";


    factors.forEach(
        (factor, index) => {

            const hex =
                rgbToHex(
                    rgb.r * factor,
                    rgb.g * factor,
                    rgb.b * factor
                );


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "palette-color";

            item.style.background =
                hex;


            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                hex.toUpperCase();


            item.appendChild(
                label
            );


            item.addEventListener(
                "click",
                async () => {

                    const success =
                        await copyText(
                            hex.toUpperCase()
                        );

                    if (success) {

                        showToast(
                            `${hex.toUpperCase()} copiado.`
                        );

                    }

                }
            );


            output.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   FILE HELPERS
========================================================= */

function loadImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                const image =
                    new Image();

                image.onload = () =>
                    resolve(image);

                image.onerror =
                    reject;

                image.src =
                    reader.result;

            };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file
            );

        }
    );

}


function formatBytes(bytes) {

    if (!bytes) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const value =
        bytes /
        Math.pow(
            1024,
            index
        );


    return (
        value.toFixed(
            index === 0 ? 0 : 2
        ) +
        " " +
        units[index]
    );

}


function getFileExtension(filename) {

    const parts =
        filename.split(".");

    if (parts.length < 2) {
        return "image";
    }

    return parts
        .pop()
        .toLowerCase();

}


function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        filename;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );

}


/* =========================================================
   DROP ZONES
========================================================= */

function initializeImageDropZones() {

    document
        .querySelectorAll(
            ".file-drop"
        )
        .forEach(drop => {

            drop.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                    drop.classList.add(
                        "dragover"
                    );

                }
            );


            drop.addEventListener(
                "dragleave",
                () => {

                    drop.classList.remove(
                        "dragover"
                    );

                }
            );


            drop.addEventListener(
                "drop",
                event => {

                    event.preventDefault();

                    drop.classList.remove(
                        "dragover"
                    );


                    const file =
                        event.dataTransfer
                            .files[0];

                    if (!file) {
                        return;
                    }


                    const input =
                        drop.querySelector(
                            'input[type="file"]'
                        );


                    if (input) {

                        const dataTransfer =
                            new DataTransfer();

                        dataTransfer.items.add(
                            file
                        );

                        input.files =
                            dataTransfer.files;


                        input.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles: true
                                }
                            )
                        );

                    }

                }
            );

        });


    const converter =
        document.getElementById(
            "converterFile"
        );

    if (converter) {

        converter.addEventListener(
            "change",
            handleConverterFile
        );

    }


    const compressor =
        document.getElementById(
            "compressFile"
        );

    if (compressor) {

        compressor.addEventListener(
            "change",
            handleCompressorFile
        );

    }


    const resizer =
        document.getElementById(
            "resizeFile"
        );

    if (resizer) {

        resizer.addEventListener(
            "change",
            handleResizeFile
        );

    }

}


/* =========================================================
   IMAGE CONVERTER
========================================================= */

let converterCurrentFile = null;


async function handleConverterFile() {

    const input =
        document.getElementById(
            "converterFile"
        );

    const file =
        input?.files[0];


    if (!file) {
        return;
    }


    converterCurrentFile =
        file;


    try {

        const image =
            await loadImage(file);


        document.getElementById(
            "converterFileName"
        ).textContent =
            file.name;


        document.getElementById(
            "converterFileSize"
        ).textContent =
            formatBytes(
                file.size
            );


        document.getElementById(
            "converterDimensions"
        ).textContent =
            `${image.width} × ${image.height}`;


        document.getElementById(
            "converterInfo"
        ).classList.remove(
            "hidden"
        );

    } catch {

        showToast(
            "No se pudo leer la imagen.",
            "error"
        );

    }

}


async function convertImage() {

    if (!converterCurrentFile) {

        const input =
            document.getElementById(
                "converterFile"
            );

        converterCurrentFile =
            input?.files[0];

    }


    if (!converterCurrentFile) {

        showToast(
            "Seleccioná una imagen.",
            "error"
        );

        return;
    }


    const format =
        document.getElementById(
            "converterFormat"
        ).value;


    const quality =
        parseFloat(
            document.getElementById(
                "converterQuality"
            ).value
        );


    try {

        const image =
            await loadImage(
                converterCurrentFile
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            image.width;

        canvas.height =
            image.height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        if (
            format ===
            "image/jpeg"
        ) {

            ctx.fillStyle =
                "#ffffff";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }


        ctx.drawImage(
            image,
            0,
            0
        );


        canvas.toBlob(
            blob => {

                if (!blob) {

                    showToast(
                        "No se pudo convertir la imagen.",
                        "error"
                    );

                    return;
                }


                const extension =
                    format ===
                    "image/png"
                        ? "png"
                        : format ===
                          "image/webp"
                            ? "webp"
                            : "jpg";


                const baseName =
                    converterCurrentFile.name
                        .replace(
                            /\.[^/.]+$/,
                            ""
                        );


                downloadBlob(
                    blob,
                    `${baseName}-converted.${extension}`
                );


                document.getElementById(
                    "converterResultText"
                ).textContent =
                    `${formatBytes(blob.size)} · ${image.width} × ${image.height}`;


                document.getElementById(
                    "converterResult"
                ).classList.remove(
                    "hidden"
                );


                showToast(
                    "Imagen convertida."
                );

            },
            format,
            quality
        );

    } catch {

        showToast(
            "No se pudo procesar la imagen.",
            "error"
        );

    }

}


/* =========================================================
   COMPRESSOR
========================================================= */

let compressorCurrentFile = null;


async function handleCompressorFile() {

    const input =
        document.getElementById(
            "compressFile"
        );

    compressorCurrentFile =
        input?.files[0] || null;


    if (
        compressorCurrentFile
    ) {

        showToast(
            `Imagen seleccionada: ${formatBytes(compressorCurrentFile.size)}`
        );

    }

}


async function compressImage() {

    if (!compressorCurrentFile) {

        const input =
            document.getElementById(
                "compressFile"
            );

        compressorCurrentFile =
            input?.files[0];

    }


    if (!compressorCurrentFile) {

        showToast(
            "Seleccioná una imagen.",
            "error"
        );

        return;
    }


    const quality =
        parseInt(
            document.getElementById(
                "compressQuality"
            ).value
        ) / 100;


    const format =
        document.getElementById(
            "compressFormat"
        ).value;


    try {

        const image =
            await loadImage(
                compressorCurrentFile
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            image.width;

        canvas.height =
            image.height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        if (
            format ===
            "image/jpeg"
        ) {

            ctx.fillStyle =
                "#ffffff";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }


        ctx.drawImage(
            image,
            0,
            0
        );


        canvas.toBlob(
            blob => {

                if (!blob) {

                    showToast(
                        "No se pudo comprimir.",
                        "error"
                    );

                    return;
                }


                lastCompressedBlob =
                    blob;


                const extension =
                    format ===
                    "image/webp"
                        ? "webp"
                        : "jpg";


                const baseName =
                    compressorCurrentFile.name
                        .replace(
                            /\.[^/.]+$/,
                            ""
                        );


                lastCompressedName =
                    `${baseName}-compressed.${extension}`;


                const original =
                    compressorCurrentFile.size;

                const final =
                    blob.size;


                const saved =
                    original > 0
                        ? Math.max(
                            0,
                            (
                                1 -
                                final /
                                original
                            ) *
                            100
                        )
                        : 0;


                document.getElementById(
                    "originalSize"
                ).textContent =
                    formatBytes(
                        original
                    );


                document.getElementById(
                    "compressedSize"
                ).textContent =
                    formatBytes(
                        final
                    );


                document.getElementById(
                    "compressionSaved"
                ).textContent =
                    `${saved.toFixed(1)}%`;


                document.getElementById(
                    "compressionDimensions"
                ).textContent =
                    `${image.width} × ${image.height} px · ${format.toUpperCase().replace("IMAGE/", "")}`;


                document.getElementById(
                    "compressionResult"
                ).classList.remove(
                    "hidden"
                );


                document.getElementById(
                    "downloadCompressed"
                ).onclick =
                    () => {

                        downloadBlob(
                            lastCompressedBlob,
                            lastCompressedName
                        );

                    };


                if (final < original) {

                    showToast(
                        `Imagen reducida un ${saved.toFixed(1)}%.`
                    );

                } else {

                    showToast(
                        "La imagen final pesa más que la original.",
                        "error"
                    );

                }

            },
            format,
            quality
        );

    } catch {

        showToast(
            "No se pudo procesar la imagen.",
            "error"
        );

    }

}


/* =========================================================
   RESIZER
========================================================= */

function initializeResizeInputs() {

    const width =
        document.getElementById(
            "resizeWidth"
        );

    const height =
        document.getElementById(
            "resizeHeight"
        );


    if (!width || !height) {
        return;
    }


    width.addEventListener(
        "input",
        () => {

            if (
                !resizeImageData ||
                !document.getElementById(
                    "keepRatio"
                ).checked
            ) {
                return;
            }


            const ratio =
                resizeImageData.width /
                resizeImageData.height;


            const value =
                parseInt(
                    width.value
                );


            if (value > 0) {

                height.value =
                    Math.round(
                        value / ratio
                    );

            }

        }
    );


    height.addEventListener(
        "input",
        () => {

            if (
                !resizeImageData ||
                !document.getElementById(
                    "keepRatio"
                ).checked
            ) {
                return;
            }


            const ratio =
                resizeImageData.width /
                resizeImageData.height;


            const value =
                parseInt(
                    height.value
                );


            if (value > 0) {

                width.value =
                    Math.round(
                        value * ratio
                    );

            }

        }
    );

}


async function handleResizeFile() {

    const input =
        document.getElementById(
            "resizeFile"
        );

    const file =
        input?.files[0];


    if (!file) {
        return;
    }


    try {

        const image =
            await loadImage(file);


        resizeImageData = {

            file,
            width:
                image.width,
            height:
                image.height

        };


        document.getElementById(
            "resizeWidth"
        ).value =
            image.width;


        document.getElementById(
            "resizeHeight"
        ).value =
            image.height;


        const info =
            document.getElementById(
                "resizeOriginalInfo"
            );


        info.textContent =
            `Original: ${image.width} × ${image.height} px · ${formatBytes(file.size)}`;


        info.classList.remove(
            "hidden"
        );


        showToast(
            "Imagen cargada."
        );

    } catch {

        showToast(
            "No se pudo leer la imagen.",
            "error"
        );

    }

}


async function resizeImage() {

    if (!resizeImageData) {

        showToast(
            "Seleccioná una imagen.",
            "error"
        );

        return;
    }


    const width =
        parseInt(
            document.getElementById(
                "resizeWidth"
            ).value
        );


    const height =
        parseInt(
            document.getElementById(
                "resizeHeight"
            ).value
        );


    if (
        !width ||
        !height ||
        width <= 0 ||
        height <= 0
    ) {

        showToast(
            "Ingresá dimensiones válidas.",
            "error"
        );

        return;
    }


    try {

        const image =
            await loadImage(
                resizeImageData.file
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            width;

        canvas.height =
            height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.drawImage(
            image,
            0,
            0,
            width,
            height
        );


        canvas.toBlob(
            blob => {

                if (!blob) {

                    showToast(
                        "No se pudo redimensionar.",
                        "error"
                    );

                    return;
                }


                const baseName =
                    resizeImageData.file.name
                        .replace(
                            /\.[^/.]+$/,
                            ""
                        );


                downloadBlob(
                    blob,
                    `${baseName}-${width}x${height}.jpg`
                );


                showToast(
                    `Imagen redimensionada a ${width} × ${height}.`
                );

            },
            "image/jpeg",
            0.92
        );

    } catch {

        showToast(
            "No se pudo procesar la imagen.",
            "error"
        );

    }

}


/* =========================================================
   WHATSAPP
========================================================= */

function generateWhatsApp() {

    const rawNumber =
        document.getElementById(
            "waNumber"
        ).value;


    const message =
        document.getElementById(
            "waMessage"
        ).value;


    const number =
        rawNumber.replace(
            /\D/g,
            ""
        );


    if (!number) {

        showToast(
            "Ingresá un número de teléfono.",
            "error"
        );

        return;
    }


    currentWhatsAppURL =
        "https://wa.me/" +
        number +
        "?text=" +
        encodeURIComponent(
            message
        );


    document.getElementById(
        "waOutput"
    ).textContent =
        currentWhatsAppURL;


    document.getElementById(
        "waResult"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "waQrWrapper"
    ).classList.add(
        "hidden"
    );


    showToast(
        "Enlace de WhatsApp generado."
    );

}


function openWhatsApp() {

    if (!currentWhatsAppURL) {
        return;
    }

    window.open(
        currentWhatsAppURL,
        "_blank",
        "noopener,noreferrer"
    );

}


function generateWAQR() {

    if (
        typeof QRCode === "undefined"
    ) {

        showToast(
            "La librería QR todavía no está disponible.",
            "error"
        );

        return;
    }


    if (!currentWhatsAppURL) {
        return;
    }


    const output =
        document.getElementById(
            "waQrOutput"
        );


    output.innerHTML = "";


    new QRCode(
        output,
        {
            text:
                currentWhatsAppURL,

            width: 240,
            height: 240,

            correctLevel:
                QRCode.CorrectLevel.M
        }
    );


    document.getElementById(
        "waQrWrapper"
    ).classList.remove(
        "hidden"
    );

}


/* =========================================================
   BARCODE
========================================================= */

function generateBarcode() {

    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        showToast(
            "La librería de códigos de barras todavía no está disponible.",
            "error"
        );

        return;
    }


    const text =
        document.getElementById(
            "barcodeText"
        ).value.trim();


    if (!text) {

        showToast(
            "Ingresá un código.",
            "error"
        );

        return;
    }


    const format =
        document.getElementById(
            "barcodeFormat"
        ).value;


    const display =
        document.getElementById(
            "barcodeDisplay"
        ).value === "true";


    try {

        JsBarcode(
            "#barcodeSvg",
            text,
            {

                format,

                displayValue:
                    display,

                lineColor:
                    "#000000",

                background:
                    "#ffffff",

                margin:
                    12,

                width:
                    2,

                height:
                    90

            }
        );


        document.getElementById(
            "barcodeResult"
        ).classList.remove(
            "hidden"
        );


        showToast(
            "Código de barras generado."
        );

    } catch {

        showToast(
            "El valor no es válido para ese formato.",
            "error"
        );

    }

}


function downloadBarcodeSVG() {

    const svg =
        document.getElementById(
            "barcodeSvg"
        );


    if (!svg || !svg.innerHTML) {

        showToast(
            "Primero generá un código.",
            "error"
        );

        return;
    }


    const source =
        new XMLSerializer()
            .serializeToString(
                svg
            );


    const blob =
        new Blob(
            [source],
            {
                type:
                    "image/svg+xml;charset=utf-8"
            }
        );


    downloadBlob(
        blob,
        "fefin-tools-barcode.svg"
    );


    showToast(
        "Código de barras descargado."
    );

}


/* =========================================================
   DISCOUNT CALCULATOR
========================================================= */

function calculateDiscount() {

    const price =
        parseFloat(
            document.getElementById(
                "discountPrice"
            ).value
        );


    const percent =
        parseFloat(
            document.getElementById(
                "discountPercent"
            ).value
        );


    if (
        !Number.isFinite(price) ||
        !Number.isFinite(percent) ||
        price < 0 ||
        percent < 0 ||
        percent > 100
    ) {

        showToast(
            "Ingresá valores válidos.",
            "error"
        );

        return;
    }


    const discount =
        price *
        percent /
        100;


    const finalPrice =
        price -
        discount;


    const formatter =
        new Intl.NumberFormat(
            "es-AR",
            {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2
            }
        );


    document.getElementById(
        "discountAmount"
    ).textContent =
        formatter.format(
            discount
        );


    document.getElementById(
        "discountPercentResult"
    ).textContent =
        `${percent}%`;


    document.getElementById(
        "finalPrice"
    ).textContent =
        formatter.format(
            finalPrice
        );


    document.getElementById(
        "discountResult"
    ).classList.remove(
        "hidden"
    );

}


/* =========================================================
   UTM
========================================================= */

function generateUTM() {

    const rawURL =
        document.getElementById(
            "utmUrl"
        ).value.trim();


    const source =
        document.getElementById(
            "utmSource"
        ).value.trim();


    const medium =
        document.getElementById(
            "utmMedium"
        ).value.trim();


    const campaign =
        document.getElementById(
            "utmCampaign"
        ).value.trim();


    const content =
        document.getElementById(
            "utmContent"
        ).value.trim();


    if (
        !rawURL ||
        !source ||
        !medium ||
        !campaign
    ) {

        showToast(
            "Completá URL, Source, Medium y Campaign.",
            "error"
        );

        return;
    }


    try {

        const url =
            new URL(
                rawURL
            );


        url.searchParams.set(
            "utm_source",
            source
        );


        url.searchParams.set(
            "utm_medium",
            medium
        );


        url.searchParams.set(
            "utm_campaign",
            campaign
        );


        if (content) {

            url.searchParams.set(
                "utm_content",
                content
            );

        }


        document.getElementById(
            "utmOutput"
        ).textContent =
            url.toString();


        document.getElementById(
            "utmResult"
        ).classList.remove(
            "hidden"
        );


        showToast(
            "URL UTM generada."
        );

    } catch {

        showToast(
            "La URL ingresada no es válida.",
            "error"
        );

    }

}


/* =========================================================
   DISCOUNT CODE GENERATOR
========================================================= */

function getSeason(
    date = new Date(),
    country = "AR"
) {

    const month =
        date.getMonth() + 1;


    const southern =
        southernCountries.includes(
            country
        );


    if (southern) {

        if (
            [12, 1, 2]
                .includes(month)
        ) {
            return "VERANO";
        }

        if (
            [3, 4, 5]
                .includes(month)
        ) {
            return "OTOÑO";
        }

        if (
            [6, 7, 8]
                .includes(month)
        ) {
            return "INVIERNO";
        }

        return "PRIMAVERA";

    }


    if (
        [12, 1, 2]
            .includes(month)
    ) {
        return "INVIERNO";
    }

    if (
        [3, 4, 5]
            .includes(month)
    ) {
        return "PRIMAVERA";
    }

    if (
        [6, 7, 8]
            .includes(month)
    ) {
        return "VERANO";
    }

    return "OTOÑO";

}


function getUpcomingCampaigns(
    country
) {

    const currentMonth =
        new Date().getMonth() + 1;


    const events =
        commercialEvents[
            country
        ] ||
        commercialEvents.INT;


    return events
        .filter(
            event =>
                event.month >=
                currentMonth
        )
        .sort(
            (a, b) =>
                a.month -
                b.month
        )
        .slice(
            0,
            4
        );

}


function updateCampaigns() {

    const select =
        document.getElementById(
            "codeCountry"
        );


    const container =
        document.getElementById(
            "campaignList"
        );


    if (!select || !container) {
        return;
    }


    const country =
        select.value;


    const campaigns =
        getUpcomingCampaigns(
            country
        );


    container.innerHTML = "";


    if (!campaigns.length) {

        const tag =
            document.createElement(
                "span"
            );

        tag.className =
            "campaign-tag";

        tag.textContent =
            "Temporada general";

        container.appendChild(
            tag
        );

        return;
    }


    campaigns.forEach(
        campaign => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "campaign-tag";

            tag.textContent =
                campaign.name;

            container.appendChild(
                tag
            );

        }
    );

}


function randomCode(length) {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    const values =
        new Uint32Array(
            length
        );


    crypto.getRandomValues(
        values
    );


    let result = "";


    for (
        let i = 0;
        i < length;
        i++
    ) {

        result +=
            characters[
                values[i] %
                characters.length
            ];

    }


    return result;

}


function sanitizePrefix(value) {

    return value
        .toUpperCase()
        .replace(
            /[^A-Z0-9]/g,
            ""
        )
        .substring(
            0,
            30
        );

}


function getCampaignPrefix(
    country
) {

    const campaigns =
        getUpcomingCampaigns(
            country
        );


    if (
        campaigns.length
    ) {

        return campaigns[0]
            .name;

    }


    return getSeason(
        new Date(),
        country
    );

}


function getSeasonShort(
    season
) {

    const names = {

        VERANO: "VERANO",
        OTOÑO: "OTONO",
        INVIERNO: "INVIERNO",
        PRIMAVERA: "PRIMAVERA"

    };


    return names[season] ||
        season;

}


function generateDiscountCodes() {

    const country =
        document.getElementById(
            "codeCountry"
        ).value;


    const year =
        parseInt(
            document.getElementById(
                "codeYear"
            ).value
        ) ||
        new Date()
            .getFullYear();


    const seasonMode =
        document.getElementById(
            "codeSeason"
        ).value;


    const style =
        document.getElementById(
            "codeStyle"
        ).value;


    const customPrefix =
        sanitizePrefix(
            document.getElementById(
                "codePrefix"
            ).value
        );


    const amount =
        Math.min(
            500,
            Math.max(
                1,
                parseInt(
                    document.getElementById(
                        "codeAmount"
                    ).value
                ) || 10
            )
        );


    const randomLength =
        Math.min(
            20,
            Math.max(
                4,
                parseInt(
                    document.getElementById(
                        "codeLength"
                    ).value
                ) || 5
            )
        );


    const separator =
        document.getElementById(
            "codeSeparator"
        ).value;


    let season;


    if (
        seasonMode ===
        "AUTO"
    ) {

        season =
            getSeason(
                new Date(),
                country
            );

    } else {

        const seasons = {

            SPRING: "PRIMAVERA",
            SUMMER: "VERANO",
            AUTUMN: "OTONO",
            WINTER: "INVIERNO",
            CHRISTMAS: "NAVIDAD",
            HALLOWEEN: "HALLOWEEN",
            BACK2SCHOOL: "VUELTACLASES"

        };


        season =
            seasons[
                seasonMode
            ];

    }


    const campaign =
        getCampaignPrefix(
            country
        );


    const yearShort =
        year
            .toString()
            .slice(-2);


    const countryCode =
        country;


    let basePrefix = "";


    if (
        customPrefix
    ) {

        basePrefix =
            customPrefix;

    } else if (
        style ===
        "RANDOM"
    ) {

        basePrefix =
            "";

    } else if (
        style ===
        "CAMPAIGN"
    ) {

        basePrefix =
            campaign
                .substring(
                    0,
                    16
                ) +
            yearShort;

    } else {

        /*
            SMART

            Ejemplos:

            AR26-PRIMAVERA-X7K2P
            AR26-BLACKFRIDAY-X7K2P
            US26-HALLOWEEN-A91KQ
        */

        const campaignPart =
            campaign
                .substring(
                    0,
                    14
                );


        basePrefix =
            countryCode +
            yearShort +
            separator +
            (
                campaignPart ||
                getSeasonShort(
                    season
                ).substring(
                    0,
                    10
                )
            );

    }


    generatedDiscountCodes = [];


    const used =
        new Set();


    while (
        generatedDiscountCodes.length <
        amount
    ) {

        const random =
            randomCode(
                randomLength
            );


        let code;


        if (
            style ===
            "RANDOM"
        ) {

            code =
                random;

        } else {

            code =
                basePrefix +
                separator +
                random;

        }


        if (
            !used.has(code)
        ) {

            used.add(
                code
            );

            generatedDiscountCodes.push(
                code
            );

        }

    }


    renderDiscountCodes();


    document.getElementById(
        "codesResult"
    ).classList.remove(
        "hidden"
    );


    showToast(
        `${generatedDiscountCodes.length} códigos generados.`
    );

}


function renderDiscountCodes() {

    const container =
        document.getElementById(
            "generatedCodes"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    generatedDiscountCodes.forEach(
        (code, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "code-row";

            row.style.animationDelay =
                `${Math.min(index, 20) * 0.025}s`;


            const value =
                document.createElement(
                    "span"
                );

            value.className =
                "code-value";

            value.textContent =
                code;


            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "code-copy";

            button.textContent =
                "Copiar";


            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const success =
                        await copyText(
                            code
                        );


                    if (success) {

                        button.textContent =
                            "Copiado";

                        showToast(
                            "Código copiado."
                        );


                        setTimeout(
                            () => {

                                button.textContent =
                                    "Copiar";

                            },
                            1300
                        );

                    }

                }
            );


            row.appendChild(
                value
            );

            row.appendChild(
                button
            );


            container.appendChild(
                row
            );

        }
    );

}


async function copyAllCodes() {

    if (
        !generatedDiscountCodes.length
    ) {

        showToast(
            "Primero generá códigos.",
            "error"
        );

        return;
    }


    const success =
        await copyText(
            generatedDiscountCodes
                .join("\n")
        );


    if (success) {

        showToast(
            "Todos los códigos fueron copiados."
        );

    } else {

        showToast(
            "No se pudieron copiar los códigos.",
            "error"
        );

    }

}


function downloadCodes() {

    if (
        !generatedDiscountCodes.length
    ) {

        showToast(
            "Primero generá códigos.",
            "error"
        );

        return;
    }


    const country =
        document.getElementById(
            "codeCountry"
        ).value;


    const year =
        document.getElementById(
            "codeYear"
        ).value;


    const content =
        [
            "FEFIN TOOLS",
            "DISCOUNT CODES",
            "",
            `País: ${countryNames[country]}`,
            `Año: ${year}`,
            "",
            ...generatedDiscountCodes
        ].join("\n");


    const blob =
        new Blob(
            [content],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    downloadBlob(
        blob,
        "fefin-tools-discount-codes.txt"
    );


    showToast(
        "Códigos descargados."
    );

}


/* =========================================================
   LOADER
========================================================= */

function hideLoader() {

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if (!loader) {
        return;
    }


    setTimeout(
        () => {

            loader.classList.add(
                "hidden"
            );

        },
        250
    );

}