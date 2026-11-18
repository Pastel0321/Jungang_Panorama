import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';


// ====================
// HTML 요소
// ====================

const viewer = document.getElementById("viewer");
const startScreen = document.getElementById("startScreen");
const pinLayer = document.getElementById("pinLayer");

const infoPanel = document.getElementById("infoPanel");
const infoImage = document.getElementById("infoImage");
const infoTitle = document.getElementById("infoTitle");
const infoDescription = document.getElementById("infoDescription");
const infoClose = document.getElementById("infoClose");

const backButton = document.getElementById("backButton");
const homeButton = document.getElementById("homeButton");

const westSquarePopup = document.getElementById("westSquarePopup");


// ====================
// 장소 데이터
// ====================

const places = {

    // 현충원
    hyeonchungmun: {
        title: "현충문",
        panorama: "hyeonchungmun.jpg",
        image: "hyeonchungwon.jpg",
        description: "국립대전현충원의 입구에 위치한 현충문입니다.",
        link: "https://namu.wiki/w/국립대전현충원",

        pins: [
            {
                title: "호국철도기념관 (외부)",
                target: "railwayOutside",
                yaw: -270,
                pitch: 0
            }
        ]
    },

    // 호국철도기념관 외부
    railwayOutside: {
        title: "호국철도기념관 (외부)",
        panorama: "railwayOutside.jpg",
        image: "railwayOutside.jpg",
        description: "호국철도기념관 외부를 살펴볼 수 있습니다.",
        link: "",

        pins: [
            {
                title: "호국철도기념관 (내부)",
                target: "railwayInside",
                yaw: -170,
                pitch: 0 
            }
        ]
    },

    // 호국철도기념관 내부
    railwayInside: {
        title: "호국철도기념관 (내부)",
        panorama: "railwayInside.jpg",
        image: "railwayInside.jpg",
        description: "호국철도기념관 내부의 전시 공간입니다.",
        link: "",
        pins: []
    },


    // ====================
    // 대전역
    // ====================

    // ====================
// 대전역
// ====================

// 대전역 서광장
westSquare: {
    title: "대전역 서광장",
    panorama: "eastSquare.jpg",
    image: "eastSquare.jpg",
    description: "대전역 서광장입니다.",
    link: "",

    pins: [
        {
            title: "대전역 (동광장)",
            target: "eastSquare",
            yaw: -180,
            pitch: 2
        }
    ]
},

// 대전역 동광장
eastSquare: {
    title: "대전역 동광장",
    panorama: "westSquare.jpg",
    image: "westSquare.jpg",
    description: "대전역 동광장입니다.",
    link: "",

    pins: [
    {
        title: "소제중앙문화공원",
        target: "sojedongPark",
        yaw: -280,
        pitch: 2
    }
]
},


    // ====================
    // 대전형무소
    // ====================

    memorialTower: {
        title: "대전형무소 추모탑",
        panorama: "memorialTower.jpeg",
        image: "memorialTower.jpeg",
        description: "대전형무소의 역사를 기억하기 위한 추모탑입니다.",
        link: "",

        pins: [
            {
                title: "우물",
                target: "well",
                yaw: -180,
                pitch: -5
            },
            {
                title: "기억의 터",
                target: "memorySite",
                yaw: -50,
                pitch: -6
            },
            {
                title: "기억의 터",
                target: "brickWall",
                yaw: -70,
                pitch: -8
            }
        ]
    },

    well: {
        title: "우물",
        panorama: "well.jpg",
        image: "well.jpg",
        description: "대전형무소와 관련된 우물입니다.",
        link: "",
        pins: []
    },

    brickWall: {
            title: "벽돌벽",
            panorama: "brickWall.jpg",
            image: "brickWall.jpg",
            description: "대전형무소의 역사를 간직한 벽돌벽입니다.",
            link: "",
            pins: []
        },

    memorySite: {
        title: "기억의 터",
        panorama: "memorySite.jpg",
        image: "memorySite.jpg",
        description: "대전형무소의 역사를 기억하는 공간입니다.",
        link: "",
        pins: []
    },

    // ====================
// 소제동
// ====================

    // ====================
// 소제동
// ====================

// 소제동 공원
sojedongPark: {
    title: "소제중앙문화공원",
    panorama: "sojedongPark.jpg",
    image: "sojedongPark.jpg",
    description: "소제동 공원의 모습을 살펴볼 수 있습니다.",
    link: "",
    pins: []
}

};


// 시작 화면에서 선택할 장소
const firstPlaces = [
    "hyeonchungmun",
    "westSquare",
    "memorialTower"
];


// ====================
// Three.js 기본 설정
// ====================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.toneMapping = THREE.NoToneMapping;

viewer.appendChild(renderer.domElement);


// ====================
// 270도 파노라마
// ====================

const textureLoader = new THREE.TextureLoader();

const geometry = new THREE.CylinderGeometry(
    10,
    10,
    11.55,
    200,
    1,
    true,
    -Math.PI * 0.75,
    Math.PI * 1.5
);

geometry.scale(-1, 1, 1);

const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide
});

const panorama = new THREE.Mesh(
    geometry,
    material
);

panorama.rotation.y = Math.PI;

scene.add(panorama);


// ====================
// 현재 장소 및 이동 기록
// ====================

let currentPlaceId = null;

let historyStack = [];

let loadToken = 0;


// ====================
// 파노라마 불러오기
// ====================

function loadPlace(placeId, saveHistory = true) {

    const place = places[placeId];

    if (!place) {
        console.error("존재하지 않는 장소:", placeId);
        return;
    }

    if (saveHistory && currentPlaceId) {
        historyStack.push(currentPlaceId);
    }

    currentPlaceId = placeId;

    const thisLoadToken = ++loadToken;

    westSquarePopup.classList.remove("active"); 

    textureLoader.load(
        place.panorama,

        (texture) => {

            // 이전에 요청한 이미지가 늦게 도착한 경우 무시
            if (thisLoadToken !== loadToken) {
                texture.dispose();
                return;
            }

            texture.colorSpace = THREE.SRGBColorSpace;

            if (panorama.material.map) {
                panorama.material.map.dispose();
            }

            panorama.material.map = texture;
            panorama.material.needsUpdate = true;

            // 파노라마 방향 초기화
            rotationY = 0;

            // 장소 핀 생성
            createPins(place.pins);

        },

        undefined,

        (error) => {
            console.error("파노라마 이미지 불러오기 실패:", place.panorama, error);
            alert(place.title + " 파노라마 이미지를 불러오지 못했습니다.");
        }
    );

    // 화면 전환
    startScreen.style.display = "none";
    viewer.style.display = "block";

    backButton.style.display = "block";
    homeButton.style.display = "block";

    infoPanel.classList.remove("active");
}


// ====================
// 파노라마 핀 생성
// ====================

// 현재 생성된 핀 목록
let panoramaPins = [];



function createPins(pins) {
    pinLayer.innerHTML = "";
    panoramaPins = [];

    // 장소 이동 핀 생성
    pins.forEach((pin) => {
        const button = document.createElement("button");
        button.className = "panoramaPin";
        button.innerHTML = `
            <span class="pinIcon">📍</span>
            <span class="pinLabel">${pin.title}</span>
        `;

        button.addEventListener("click", () => {
            loadPlace(pin.target);
        });

        pinLayer.appendChild(button);

        panoramaPins.push({
            element: button,
            yaw: pin.yaw,
            pitch: pin.pitch
        });
    });

    // 장소별 돋보기 설정
    const magnifierSettings = {
        westSquare: [
            {
                yaw: -210,
                pitch: 5,
                image: "westSquareInfo1.png"
            }
        ],

        eastSquare: [
            {
                yaw: -180,
                pitch: 0,
                image: "eastSquareInfo.png"
            }
        ],
        
        railwayOutside: [
            {
                yaw: -190,
                pitch: 2,
                image: "railwayOutsideInfo.png"
            }
        ],

        railwayInside: [
            {
                yaw: -140,
                pitch: 0,
                image: "railwayInsideInfo.png"
            }
        ],

        sojedongPark: [
            {
                yaw: -300,
                pitch: 0,
                image: "sojedongParkInfo1.png"
            },
            {
                yaw: -180,
                pitch: 0,
                image: "sojedongParkInfo2.png"
            }
        ],

        memorialTower: [
            {
                yaw: -90,
                pitch: -6,
                image: "memorialTowerInfo.png"
            }
        ],

        memorySite: [
            {
                yaw: -177,
                pitch: -5,
                image: "memorySiteInfo1.png"
            },
            {
                yaw: -167,
                pitch: 0,
                image: "memorySiteInfo2.png"
            }
        ],

        well: [
            {
                yaw: -190,
                pitch: 0,
                image: "wellInfo.png"
            }
        ],

        brickWall: [
            {
                yaw: -195,
                pitch: -5,
                image: "brickWallInfo1.png"
            },
            {
                yaw: -160,
                pitch: -5,
                image: "brickWallInfo2.png"
            }
        ]
    };

    const magnifiers = magnifierSettings[currentPlaceId];

    if (!magnifiers) return;

    // 돋보기 생성
    magnifiers.forEach((item) => {
        const button = document.createElement("button");
        button.className = "panoramaPin imagePin";

        button.innerHTML = `
            <img src="magnifier.png" alt="확대해서 보기">
        `;

        button.addEventListener("click", () => {
    const isWestSquare = currentPlaceId === "westSquare";

    // 서광장에서만 화살표 표시
    document.getElementById("popupPrev").style.display =
        isWestSquare ? "block" : "none";

    document.getElementById("popupNext").style.display =
        isWestSquare ? "block" : "none";

    if (isWestSquare) {
        popupImageIndex = 0;
        showPopupImage();
    } else {
        popupImage.src = item.image;
    }

    westSquarePopup.classList.add("active");
});

        pinLayer.appendChild(button);

        panoramaPins.push({
            element: button,
            yaw: item.yaw,
            pitch: item.pitch
        });
    });
}


const popupImages = [
    "westSquareInfo1.png",
    "westSquareInfo2.png"
];

let popupImageIndex = 0;

const popupImage = document.getElementById("popupImage");

function showPopupImage() {
    popupImage.src = popupImages[popupImageIndex];
}

document.getElementById("popupPrev").addEventListener("click", () => {
    popupImageIndex =
        (popupImageIndex - 1 + popupImages.length) % popupImages.length;
    showPopupImage();
});

document.getElementById("popupNext").addEventListener("click", () => {
    popupImageIndex =
        (popupImageIndex + 1) % popupImages.length;
    showPopupImage();
});




// ====================
// 3D 파노라마 핀 위치 계산
// ====================

function updatePinPositions() {

    panoramaPins.forEach((pin) => {

        // 각도를 라디안으로 변환
        const yaw = THREE.MathUtils.degToRad(pin.yaw);
        const pitch = THREE.MathUtils.degToRad(pin.pitch);

        const radius = 9.7;

        // 파노라마 원통 내부의 3D 좌표
        const localPosition = new THREE.Vector3(
            Math.sin(yaw) * Math.cos(pitch) * radius,
            Math.sin(pitch) * radius,
            -Math.cos(yaw) * Math.cos(pitch) * radius
        );

        // 파노라마의 회전을 적용하여 월드 좌표로 변환
        const worldPosition = panorama.localToWorld(
            localPosition.clone()
        );

        // 카메라 기준 좌표로 변환
        const cameraPosition = worldPosition.clone();

        cameraPosition.applyMatrix4(camera.matrixWorldInverse);

        // 카메라 뒤쪽에 있는 핀은 숨김
        if (cameraPosition.z >= 0) {
            pin.element.style.display = "none";
            return;
        }

        // 화면 좌표로 변환
        const screenPosition = worldPosition.clone();

        screenPosition.project(camera);

        const x = (screenPosition.x * 0.5 + 0.5)
            * window.innerWidth;

        const y = (-screenPosition.y * 0.5 + 0.5)
            * window.innerHeight;

        // 화면 밖에 있는 핀은 숨김
        if (
            screenPosition.z < -1 ||
            screenPosition.z > 1 ||
            x < -100 ||
            x > window.innerWidth + 100 ||
            y < -100 ||
            y > window.innerHeight + 100
        ) {
            pin.element.style.display = "none";
            return;
        }

        pin.element.style.display = "flex";

        pin.element.style.left = x + "px";
        pin.element.style.top = y + "px";

    });

}


// ====================
// 시작 화면 버튼
// ====================

// ====================
// 홈 화면 장소 카드
// ====================

document.querySelectorAll(".placeCard").forEach((button) => {

    button.addEventListener("click", () => {

        const startId = button.dataset.start;

        historyStack = [];

        currentPlaceId = null;

        loadPlace(startId, false);

    });

});


// ====================
// 뒤로 가기
// ====================

backButton.addEventListener("click", () => {

    infoPanel.classList.remove("active");

    if (historyStack.length > 0) {

        const previousPlace = historyStack.pop();

        // 기록을 추가하지 않고 이전 장소로 이동
        loadPlace(previousPlace, false);

    } else {

        // 첫 장소라면 시작 화면으로
        goHome();

    }

});


// ====================
// 처음 화면으로
// ====================

function goHome() {

    loadToken++;

    currentPlaceId = null;

    historyStack = [];

    pinLayer.innerHTML = "";

    viewer.style.display = "none";

    startScreen.style.display = "grid";

    backButton.style.display = "none";
    homeButton.style.display = "none";

    infoPanel.classList.remove("active");

}


homeButton.addEventListener("click", goHome);



infoClose.addEventListener("click", () => {

    infoPanel.classList.remove("active");

});


infoPanel.addEventListener("click", (event) => {

    if (event.target === infoPanel) {
        infoPanel.classList.remove("active");
    }

});


window.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        infoPanel.classList.remove("active");
    }

});


// ====================
// 마우스 / 터치 회전
// ====================

let isDragging = false;

let previousX = 0;

let rotationY = 0;

const sensitivity = 0.003;


// 마우스 누르기
renderer.domElement.addEventListener("mousedown", (event) => {

    isDragging = true;

    previousX = event.clientX;

});


// 마우스 놓기
window.addEventListener("mouseup", () => {

    isDragging = false;

});


// 마우스 이동
window.addEventListener("mousemove", (event) => {

    if (!isDragging) return;

    const deltaX = event.clientX - previousX;

    previousX = event.clientX;

    rotationY += deltaX * sensitivity;

    rotationY = THREE.MathUtils.clamp(
        rotationY,
        -Math.PI * 0.5,
        Math.PI * 0.5
    );

});


// 터치 시작
renderer.domElement.addEventListener("touchstart", (event) => {

    isDragging = true;

    previousX = event.touches[0].clientX;

}, { passive: true });


// 터치 이동
renderer.domElement.addEventListener("touchmove", (event) => {

    if (!isDragging) return;

    const currentX = event.touches[0].clientX;

    const deltaX = currentX - previousX;

    previousX = currentX;

    rotationY += deltaX * sensitivity;

    rotationY = THREE.MathUtils.clamp(
        rotationY,
        -Math.PI * 0.5,
        Math.PI * 0.5
    );

}, { passive: true });


// 터치 종료
renderer.domElement.addEventListener("touchend", () => {

    isDragging = false;

});


// ====================
// 화면 출력
// ====================

// ====================
// 화면 출력
// ====================

function animate() {

    requestAnimationFrame(animate);

    camera.rotation.x = 0;
    camera.rotation.z = 0;
    camera.rotation.y = rotationY;

    // 카메라와 파노라마의 좌표 갱신
    camera.updateMatrixWorld(true);
    panorama.updateMatrixWorld(true);

    // 핀 위치 갱신
    updatePinPositions();

    renderer.render(scene, camera);

}

animate();  


// ====================
// 화면 크기 변경
// ====================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

});

// 서광장 이미지 팝업 닫기
westSquarePopup.addEventListener("click", (event) => {

    // 팝업 이미지 바깥을 클릭했을 때만 닫기
    if (event.target === westSquarePopup) {
        westSquarePopup.classList.remove("active");
    }

});
