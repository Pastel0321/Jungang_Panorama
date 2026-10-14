    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

    const viewer = document.getElementById("viewer");
    const mapScreen = document.getElementById("mapScreen");
    const detailButton = document.getElementById("detailButton");


    // ====================
    // 기본 설정
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


    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.toneMapping = THREE.NoToneMapping;

    viewer.appendChild(renderer.domElement);


    // ====================
    // 270도 파노라마
    // ====================

    const textureLoader = new THREE.TextureLoader();

    let panorama = null;


    // 파노라마 원통 생성
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

    // 파노라마 원통 크기 조절
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide
    });

    panorama = new THREE.Mesh(
        geometry,
        material
    );

    // 파노라마 시작 방향 설정
    panorama.rotation.y = Math.PI * 1;

    scene.add(panorama);


    // ====================
    // 파노라마 불러오기
    // ====================

    function loadPanorama(file) {

        textureLoader.load(file, (texture) => {

            texture.colorSpace = THREE.SRGBColorSpace;
            panorama.material.map = texture;
            panorama.material.needsUpdate = true;

            // 새로운 장소로 이동하면 회전 위치 초기화
            rotationY = 0;
        });
    }


    // ====================
    // 지도 핀
    // ====================

    // ====================
    // 장소 정보
    // ====================

    const infoPanel = document.getElementById("infoPanel");
    const infoImage = document.getElementById("infoImage");
    const infoTitle = document.getElementById("infoTitle");
    const infoDescription = document.getElementById("infoDescription");
    const infoClose = document.getElementById("infoClose");
    const infoButton = document.getElementById("infoButton");

    infoButton.addEventListener("click", () => {
        infoPanel.classList.add("active");
    });

    const backButton = document.getElementById("backButton");

    backButton.addEventListener("click", () => {

    infoPanel.classList.remove("active");

    viewer.style.display = "none";

    infoButton.style.display = "none";
    backButton.style.display = "none";

    mapScreen.style.display = "flex";

});

backButton.addEventListener("click", () => {

    // 정보창 닫기
    infoPanel.classList.remove("active");

    // 파노라마 숨기기
    viewer.style.display = "none";

    // 정보 버튼 숨기기
    infoButton.style.display = "none";

    // 지도 다시 표시
    mapScreen.style.display = "flex";

});


    // ====================
    // 지도 핀
    // ====================

    document.querySelectorAll(".mapPin").forEach((pin) => {

        pin.addEventListener("click", () => {

            const panoramaFile = pin.dataset.panorama;

            const title = pin.dataset.title;
            const description = pin.dataset.description;
            const image = pin.dataset.image;
            const link = pin.dataset.link;


            // 파노라마 변경
            loadPanorama(panoramaFile);


            // 정보창 내용 변경
            infoTitle.textContent = title;
            infoDescription.textContent = description;
            infoImage.src = image;
            detailButton.href = link;


            // 화면 전환
            mapScreen.style.display = "none";
            viewer.style.display = "block";

            infoButton.style.display = "block";
            backButton.style.display = "block";

        });

    });


    // ====================
    // 정보창 닫기
    // ====================

    infoClose.addEventListener("click", () => {
        infoPanel.classList.remove("active");
    }); 

    // ====================
    // 터치 / 마우스 회전
    // ====================

    let isDragging = false;
    let previousX = 0;

    let rotationY = 0;

    // 회전 속도 조절
    const sensitivity = 0.003;


    // 마우스
    renderer.domElement.addEventListener("mousedown", (event) => {

        isDragging = true;
        previousX = event.clientX;

    });

    window.addEventListener("mouseup", () => {

        isDragging = false;

    });

    window.addEventListener("mousemove", (event) => {

        if (!isDragging) return;

        const deltaX = event.clientX - previousX;

        previousX = event.clientX;

        rotationY += deltaX * sensitivity;

        rotationY = THREE.MathUtils.clamp(
            rotationY,
            -Math.PI * 0.5, // 회전 반경 조절 (모든 clamp 안 값 동일하게 유지)
            Math.PI * 0.5 
        );

    });


    // 터치
    renderer.domElement.addEventListener("touchstart", (event) => {

        isDragging = true;
        previousX = event.touches[0].clientX;

    }, { passive: true });


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


    renderer.domElement.addEventListener("touchend", () => {

        isDragging = false;

    });


    // ====================
    // 화면 출력
    // ====================

    function animate() {

        requestAnimationFrame(animate);

        camera.rotation.x = 0;
        camera.rotation.z = 0;
        camera.rotation.y = rotationY;

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

    }); 